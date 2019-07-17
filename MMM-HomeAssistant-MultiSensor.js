'use strict';

Module.register('MMM-HomeAssistant-MultiSensor', {
	result: {},

	defaults: {
		host: 'hassio.local',
		port: '8321',
		https: false,
		token: '',
		updateInterval: 300, // seconds
		updateFadeSpeed: 0, // milliseconds
		colors: {
			green: '#6bb928',
			blue: '#53aae4',
			red: '#f35050',
			orange: '#fb8e2b',
		},
		widgets: [
			// {
			// 	title: 'Guestroom',
			// 	sensor: {
			// 		entity_id: 'sensor.temp',
			// 		unit: 'º',
			// 		color: 'green',
			// 		colors: {
			// 			24: 'orange',
			// 			30: 'red'
			// 		},
			// 	},
			// 	sensors: [
			// 		{
			// 			entity_id: 'sensor.co2',
			// 			unit: ' ppm',
			// 			color: 'green',
			// 			colors: {
			// 				900: 'orange',
			// 				1200: 'red'
			// 			},
			// 		},
			// 		{
			// 			entity_id: 'sensor.humidity',
			// 			unit: '%',
			// 			color: 'red',
			// 			colors: {
			// 				40: 'orange',
			// 				60: 'blue'
			// 			},
			// 		},
			// 	]
			// },
		],
	},

	start: function() {
		this.getStats();
		this.scheduleUpdate();
	},

	getStyles: function () {
		return [this.name + '.css'];
	},

	getDom: function() {
		if (this.result && Object.keys(this.result).length) {
			var table = document.createElement('table');
			table.classList.add('hams-table');
			this.config.widgets.forEach((value) => table.appendChild(this.renderWidget(value)));
			return table;
		}

		var error = document.createElement('div');
		error.classList.add('hams-error');
		error.innerHTML = 'No data from Home Assistant.';
		return error;
	},

	renderSensor: function(sensor) {
		let value = this.getValue(sensor.entity_id);

		const span = document.createElement('span');
		span.classList.add('hams-sensor');

		let color = sensor.color;
		if (sensor.colors) {
			Object.keys(sensor.colors).forEach((val) => {
				if (value >= val) {
					color = sensor.colors[val];
				}
			});
		}
		if (color && this.config.colors.hasOwnProperty(color)) {
			span.style.color = this.config.colors[color];
		}

		if (sensor.hasOwnProperty('unit')) {
			value += sensor.unit;
		} else {
			value += this.getUnit(sensor.entity_id);
		}

		span.textContent = value;
		return span;
	},

	renderWidget: function(item) {
		const tr = document.createElement('tr');
		tr.classList.add('hams-item');

		const left = document.createElement('td');
		left.classList.add('hams-left');
		left.appendChild(this.renderSensor(item.sensor));
		tr.appendChild(left);

		const right = document.createElement('td');
		right.classList.add('hams-right');
		tr.appendChild(right);

		const title = document.createElement('div');
		title.classList.add('hams-top');
		if (item.hasOwnProperty('title')) {
			title.textContent = item.title;
		} else {
			title.textContent = this.getName(item.sensor.entity_id);
		}
		right.appendChild(title);

		const sensors = document.createElement('div');
		sensors.classList.add('hams-bottom');
		item.sensors.forEach((sensor, i) => {
			sensors.appendChild(this.renderSensor(sensor));

			if (i < item.sensors.length - 1) {
				sensors.appendChild(document.createTextNode(' | '));
			}
		});
		right.appendChild(sensors);

		return tr;
	},

	getValue: function(entity_id) {
		const data = this.result.find((item) => item.entity_id === entity_id);
		return data ? data.state : null;
	},

	getUnit: function(entity_id) {
		const data = this.result.find((item) => item.entity_id === entity_id && item.attributes.hasOwnProperty('unit_of_measurement'));
		return data ? data.attributes.unit_of_measurement : '';
	},

	getName: function(entity_id) {
		const data = this.result.find((item) => item.entity_id === entity_id && item.attributes.hasOwnProperty('friendly_name'));
		return data ? data.attributes.friendly_name : '';
	},

	scheduleUpdate: function(delay) {
		setInterval(() => this.getStats, delay || this.config.updateInterval * 1000);
	},

	getStats: function() {
		this.sendSocketNotification('GET_STATS', this.config);
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === 'STATS_RESULT') {
			this.result = payload;
			this.updateDom(this.config.updateFadeSpeed);
		}
	},
});

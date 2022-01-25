const NodeHelper = require('node_helper');
const fetch = require('node-fetch');

module.exports = NodeHelper.create({
    start: function() {
        console.log('Starting node_helper for module [' + this.name + ']');
    },

    getStats: async function(config) {
        let args = {
            headers: {'Content-Type': 'application/json'}
        };

        if (config.token) {
            args.headers['Authorization'] = 'Bearer ' + config.token;
        }

        try {
            const response = await fetch(this.buildUrl(config), args);
            const body = await response.json();
            this.sendSocketNotification('STATS_RESULT', body);
        } catch (error) {
            console.error(this.name + ' ERROR:', error);
        }
    },

    buildUrl: function(config) {
        let url = config.host;
        if (config.port) {
            url += ':' + config.port;
        }
        url += '/api/states';
        if (config.https) {
            url = 'https://' + url;
        } else {
            url = 'http://' + url;
        }
        return url;
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_STATS') {
            this.getStats(payload);
        }
    }
});
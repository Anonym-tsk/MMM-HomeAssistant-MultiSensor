var NodeHelper = require('node_helper');
var fetch = require('node-fetch');

module.exports = NodeHelper.create({
    start: function() {
        console.log('Starting node_helper for module [' + this.name + ']');
    },

    getStats: function(config) {
        let request_args = {
            headers: {'Content-Type': 'application/json'}
        };

        if (config.token) {
            request_args.headers['Authorization'] = 'Bearer ' + config.token;
        }

        fetch(this.buildUrl(config), request_args).then((response) => {
            return response.json();
        }).then((body) => {
            this.sendSocketNotification('STATS_RESULT', body);
        }).catch((error) => {
            console.error(this.name + ' ERROR:', error);
        });
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
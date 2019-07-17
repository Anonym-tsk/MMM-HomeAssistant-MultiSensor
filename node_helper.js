var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
    start: function() {
        console.log('Starting node_helper for module [' + this.name + ']');
    },

    getStats: function(config) {
        let request_args = {
            url: this.buildUrl(config),
            json: true
        };

        if (config.token) {
            console.log(this.name + ': Adding token', config.token);
            request_args.headers = {'Authorization': 'Bearer ' + config.token};
        }

        request(request_args, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                this.sendSocketNotification('STATS_RESULT', body);
            } else {
                console.error(this.name + ' ERROR:', error);
                console.error(this.name + ' statusCode:', response.statusCode);
                console.error(this.name + ' Body:', body);
            }
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
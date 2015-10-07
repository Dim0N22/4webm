var Log = require('../models/log');


/**
 * Log error
 * @param {Error} err
 * @param {String} [message]
 * @param {Object} [data]
 */
module.exports.error = function (err, message, data) {
    if (!err && !message && !data) {
        return;
    }

    var error = {};
    if (err instanceof Error) {
        var properties = Object.getOwnPropertyNames(err);
        for (var property, i = 0, len = properties.length; i < len; ++i) {
            error[properties[i]] = err[properties[i]];
        }
    }

    var logRecord = {
        type: 'error',
        when: new Date(),
        error: error
    };

    if (message) {
        logRecord.message = message;
    }

    if (data) {
        logRecord.data = data;
    }

    if (process.env.NODE_ENV === 'production') {
        Log.create(logRecord, function (err) {
            if (err) {
                console.log(err);
            }
        });
    } else {
        console.log(logRecord);
    }
};


/**
 * Log info
 * @param {String} message
 * @param {Object} [data]
 */
module.exports.info = function (message, data) {
    if (!message && !data) {
        return;
    }

    var logRecord = {
        type: 'info',
        when: new Date()
    };

    if (message) {
        logRecord.message = message;
    }

    if (data) {
        logRecord.data = data;
    }

    if (process.env.NODE_ENV === 'production') {
        Log.create(logRecord, function (err) {
            if (err) {
                console.log(err);
            }
        });
    } else {
        console.log(logRecord);
    }
};
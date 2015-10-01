var db = require('./db');

module.exports.error = function (err, msg1, msg2, msg3) {
    var error = {};
    var messages;

    if (err instanceof Error) {
        var properties = Object.getOwnPropertyNames(err);
        for (var property, i = 0, len = properties.length; i < len; ++i) {
            error[properties[i]] = err[properties[i]]
        }

        if (arguments.length > 0) {
            messages = Array.prototype.slice.call(arguments, 1);
        }
    } else {
        messages = Array.prototype.slice.call(arguments, 0);
    }


    var logRecord = {
        type: 'error',
        messages: messages,
        error: error
    };

    if (process.env.NODE_ENV !== 'production') {
        console.log(logRecord);
    }

    db.logs.create(logRecord, function (err) {
        if (err) {
            console.log(err);
        }
    });
};


module.exports.info = function (msg1, msg2, msg3) {
    var logRecord ={
        type: 'info',
        messages: Array.prototype.slice.call(arguments, 0)
    };

    if (process.env.NODE_ENV !== 'production') {
        console.log(logRecord);
    }

    db.logs.create(logRecord, function (err) {
        if (err) {
            console.log(err);
        }
    });
};
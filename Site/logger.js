var winston = require('winston');
winston.emitErrs = true;

var logger = new winston.Logger({
    transports: [
        new winston.transports.DailyRotateFile({
            level: 'info',
            name: 'file_debug',
            handleExceptions: true,
            json: true,
            datePattern: '.yyyy-MM-dd',
            filename: "./logs/log_file.log",
            colorize: false
        })
        //,
        //new winston.transports.Console({
        //    level: 'debug',
        //    handleExceptions: true,
        //    json: false,
        //    colorize: true
        //})
        //new winston.transports.File({
        //    level: 'info',
        //    filename: './logs/all-logs.log',
        //    handleExceptions: true,
        //    json: true,
        //    maxsize: 5242880, //5MB
        //    maxFiles: 5,
        //    colorize: false
        //})
    ],
    exitOnError: false
});


module.exports.stream = {
    write: function (message, encoding) {
        logger.info(message);
    }
};


// логирование сообщения об ошибки со стеком
module.exports.logerror = function () {
    Array.prototype.push.call(arguments, (new Error()).stack.substring(86)); // обрезаю Error и первую строку стека
    logger.error.apply(this, arguments);
};

// логирование информационного сообщения со стеком
module.exports.loginfo = function () {
    Array.prototype.push.call(arguments, (new Error()).stack.substring(85)); // обрезаю Error и первую строку стека
    logger.info.apply(this, arguments);
};
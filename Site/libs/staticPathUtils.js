var url = require('url');
var config = require('./config');

module.exports.resolvePreviewSrc = function (path) {
    if (process.env.NODE_ENV === 'production') {
        return String(path).slice(2).replace(config.homePath, '') + '.300x300.jpg';
    } else {
        return url.resolve(config.get('videoServer'), String(path).slice(2) + '.300x300.jpg');
    }
};

module.exports.resolveVideoSrc = function (path) {
    if (process.env.NODE_ENV === 'production') {
        return String(path).slice(2).replace(config.homePath, '');
    } else {
        return url.resolve(config.get('videoServer'), String(path).slice(2));
    }
};
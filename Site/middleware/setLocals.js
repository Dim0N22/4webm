var config = require('../libs/config');

module.exports = function (req, res, next) {
    res.locals.projectName = config.get('projectName');
    res.locals.user = req.user;
    res.locals.authorized = Boolean(req.user);

    next();
};
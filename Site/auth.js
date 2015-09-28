var unless = require('express-unless');
var db = require('./db');


/**
 * middleware set req.user by req.cookies.token
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function setUserFromToken(req, res, next) {
    if (!req.cookies.token) {
        return next();
    }

    db.users.findOne({
        token: req.cookies.token
    }, function (err, user) {
        if (err) {
            console.log(err);
            return next();
        }

        if (!user || !user.token) {
            return next();
        }

        req.user = user;
        return next();
    });
}

function isAuthenticated(req, res, next) {
    console.log(req.user);
    if (!req.user) {
        res.redirect('/login');
        return;
    }

    next();
}

isAuthenticated.unless = unless;

module.exports.isAuthenticated = isAuthenticated;
module.exports.setUserFromToken = setUserFromToken;
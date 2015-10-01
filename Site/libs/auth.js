var unless = require('express-unless');
var db = require('../db');
var log = require('./log');


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
            log.error(err);
            return next();
        }

        if (!user || !user.token) {
            return next();
        }

        req.user = user;
        return next();
    });
}

function isAuthenticated(role) {
    function auth(req, res, next) {
        if (!req.user) {
            res.redirect('/login');
            return;
        }

        if (!role) {
            next();
            return;
        }


        // check roles
        if (!req.user.roles || req.user.roles.length === 0 || req.user.roles.indexOf(role) === -1) {
            // user is authorized but don't have permissions for this url
            res.redirect('/');
            return;
        }

        next();
    }

    auth.unless = unless;

    return auth;
}


module.exports.isAuthenticated = isAuthenticated;
module.exports.setUserFromToken = setUserFromToken;
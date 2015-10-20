var crypto = require('crypto');
var unless = require('express-unless');
var User = require('../models/user');
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

    User.findOne({tokens: req.cookies.token}, function (err, user) {
        if (err) {
            log.error(err);
            return next();
        }

        if (user) {
            req.user = user;
        }

        return next();
    });
}


/**
 * middleware for checking roles
 * @param role
 * @returns {auth}
 */
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

function isAuthenticatedForEditPage(req, res, next) {
    if (!req.user) {
        res.redirect(req.url);
        return;
    }

    next();
}


/** hash password */
function getHash(password) {
    return crypto.createHash('sha512').update(password).digest('hex');
}


/**
 * generate token
 * @param {number} [size=32]
 * @return {string}
 */
function token(size) {
    if (!size) {
        size = 32;
    }

    return crypto.randomBytes(size).toString('hex');
}


/**
 * generate secret
 * @param {number} [size=6]
 * @returns {string|*}
 */
function secret(size) {
    if (!size) {
        size = 6;
    }

    return crypto.randomBytes(size).toString('hex');
}

module.exports.isAuthenticated = isAuthenticated;
module.exports.isAuthenticatedForEditPage = isAuthenticatedForEditPage;
module.exports.setUserFromToken = setUserFromToken;
module.exports.getHash = getHash;
module.exports.token = token;
module.exports.secret = secret;
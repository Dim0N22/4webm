var unless = require('express-unless');
var db = require('./db');

function isAuthenticated(req, res, next) {
    if (!req.cookies.token) {
        res.redirect('/login');
        return;
    }

    db.users.findOne({
        token: req.cookies.token
    }, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect('/login');
            return;
        }

        if (!user || !user.token) {
            res.redirect('/login');
            return;
        }

        req.user = user;
        return next();
    });
}

isAuthenticated.unless = unless;

module.exports.isAuthenticated = isAuthenticated;
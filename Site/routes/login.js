var express = require('express');
var User = require('../models/user');
var config = require('../libs/config');
var log = require('../libs/log');
var auth = require('../libs/auth');

var router = express.Router();

router.get('/', function (req, res) {
    res.render('login', {
        title: config.get('projectName') + ' login',
        error: req.query.error,
        projectName: config.get('projectName')
    });
});


router.post('/', function (req, res) {
    if (!req.body.login || !req.body.secret) {
        res.redirect('/login?error=' + 400);
        return;
    }

    User.findOne({
        login: req.body.login,
        secret: auth.getHash(req.body.secret)
    }, function (err, user) {
        if (err) {
            log.error(err);
            res.redirect('/login?error=' + 500);
            return;
        }

        if (!user) {
            res.redirect('/login?error=' + 404);
            return;
        }

        var token = auth.token();
        User.update({_id: user._id}, {$set: {token: token}}, function (err) {
            if (err) {
                log.error(err);
                res.redirect('/login?error=' + 500);
                return;
            }

            res.cookie('token', token, {expires: new Date(2100, 1, 1), httpOnly: true});
            res.redirect('/');
        });
    });
});

module.exports = router;
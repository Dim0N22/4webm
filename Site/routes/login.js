var express = require('express');
var User = require('../models/user');
var config = require('../libs/config');
var log = require('../libs/log');

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
        //res.status(400).end();
        res.redirect('/login?error=' + 400);
        return;
    }

    User.findOne({
        login: req.body.login,
        secret: req.body.secret
    }, function (err, user) {
        if (err) {
            log.error(err);
            //res.status(500).end();
            res.redirect('/login?error=' + 500);
            return;
        }

        if (!user || !user.token) {
            //res.status(404).end();
            res.redirect('/login?error=' + 404);
            return;
        }

        res.cookie('token', user.token, {expires: new Date(2100, 01, 01), httpOnly: true});
        res.redirect('/');
    });
});

module.exports = router;
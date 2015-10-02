var crypto = require('crypto');
var express = require('express');
var mail = require('../libs/mail');
var User = require('../models/user');
var config = require('../libs/config');
var log = require('../libs/log');

var router = express.Router();

router.get('/', function (req, res) {
    res.render('invite', {
        title: config.get('projectName') + ' invite',
        error: req.query.error,
        success: req.query.success,
        projectName: config.get('projectName')
    });
});


router.post('/', function (req, res) {
    if (!req.body.email) {
        res.redirect('/invite?error=' + 400);
        return;
    }

    var secret = crypto.randomBytes(8).toString('hex');
    var token = crypto.randomBytes(64).toString('base64');

    User.create({
        login: req.body.email,
        secret: secret,
        token: token
    }, function (err) {
        if (err) {
            log.error(err);
            res.redirect('/invite?error=' + 500);
            return;
        }

        mail.sendInvite(req.body.email, secret, function (err) {
            if (err) {
                log.error(err);
                res.redirect('/invite?error=' + 500);
                return;
            }

            res.redirect('/invite?success=' + req.body.email);
        });
    });
});

module.exports = router;
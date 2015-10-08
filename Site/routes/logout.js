var express = require('express');
var mail = require('../libs/mail');
var User = require('../models/user');
var config = require('../libs/config');
var log = require('../libs/log');
var auth = require('../libs/auth');

var router = express.Router();

router.post('/', function (req, res) {
    res.clearCookie('token');

    User.update({_id: req.user._id}, {$unset: {token: ""}}, function (err) {
        if (err) {
            log.error(err);
            return;
        }
    });

    res.redirect('/');
});

module.exports = router;
var express = require('express');
var db = require('../../db');
var log = require('../../libs/log');

var router = express.Router();

router.post('/:tag', function (req, res) {
    res.status(200).end();

    process.nextTick(function () {
        db.tags.create({
            name: req.params.tag,
            creator: req.user ? req.user.login : null,
            when: new Date()
        }, function (err) {
            if (err) {
                log.error(err);
                return;
            }
        });
    });
});


module.exports = router;
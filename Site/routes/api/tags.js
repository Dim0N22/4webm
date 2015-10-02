var express = require('express');
var Tag = require('../../models/tag');
var log = require('../../libs/log');

var router = express.Router();

router.post('/:tag', function (req, res) {
    res.status(200).end();

    process.nextTick(function () {
        Tag.create({
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
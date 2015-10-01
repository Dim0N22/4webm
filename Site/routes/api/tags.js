var express = require('express');
var router = express.Router();
var db = require('../../db');
var logger = require('../../logger');


module.exports = router;

router.post('/:tag', function (req, res) {
    res.status(200).end();

    process.nextTick(function () {
        db.tags.create({
            name: req.params.tag,
            creator: req.user.login,
            where: new Date()
        }, function (err) {
            if (err) {
                logger.error(err);
                return;
            }
        });
    });
});
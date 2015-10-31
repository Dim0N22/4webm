var express = require('express');
var Webm = require('../models/webm');
var log = require('../libs/log');

var router = express.Router();

router.get('/', function (req, res) {
    var conditions = {seqid: {$exists: true}};
    if (req.tags) {
        conditions.tags = {$all: req.tags};
    }

    if (!req.user) {
        conditions = {$and: [conditions, {tags: {$nin: ['danger']}}]};
    }

    Webm.count(conditions, function (err, count) {
        if (err) {
            log.error(err);
            res.status(500).end();
            return;
        }

        var randomId = Math.round(Math.random() * (count - 1) + 1);
        Webm.find(conditions, 'seqid')
            .skip(randomId - 1)
            .limit(1)
            .exec(function (err, webms) {
                if (err) {
                    log.error(err);
                    res.status(500).end();
                    return;
                }

                if (!webms || webms.length === 0) {
                    res.redirect('/');
                    return;
                }

                res.redirect('/' + (req.user ? 'edit/' : '') + webms[0].seqid + req.tagsQuery);
            });
    });
});

module.exports = router;
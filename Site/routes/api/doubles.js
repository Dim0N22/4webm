var express = require('express');
var Webm = require('../../models/webm');
var log = require('../../libs/log');
var config = require('../../libs/config');

var router = express.Router();

router.get('/moar', function (req, res) {
    var params = {};

    if (req.query && req.query.lastSeqid) {
        params.lastSeqid = req.query.lastSeqid;
    }

    Webm.getDoubles(params, function (err, result) {
        if (err) {
            log.error(err);
            res.status(500).end();
            return;
        }

        if (!result || !result.webms || result.webms.length === 0) {
            res.status(404).end();
            return;
        }

        res.json({
            webms: result.webms,
            lastSeqid: result.lastSeqid,
            viewPath: '/doubles/'
        });
    });
});


router.put('/:id([0-9]+)', function (req, res) {
    res.status(200).end();
});


module.exports = router;
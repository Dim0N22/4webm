var express = require('express');
var Webm = require('../models/webm');
var log = require('../libs/log');
var config = require('../libs/config');

var router = express.Router();


router.get(['/', '/page/:page([0-9]+)'], function (req, res) {
    var params = {};
    if (req.params && req.params.page) {
        var page = Number(req.params.page);
        if (page >= 2) {
            params.page = page;
        }
    }

    Webm.getDoubles(params, function (err, result) {
        if (err) {
            log.error(err);
            res.status(500).end();
            return;
        }

        res.render('doubles', {
            title: config.get('projectName') + ' doubles',
            webms: result.webms,
            lastSeqid: result.lastSeqid,
            viewPath: '/doubles/'
        });
    });
});


module.exports = router;
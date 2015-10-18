var express = require('express');
var Webm = require('../../models/webm');
var log = require('../../libs/log');
var staticPathUtils = require('../../libs/staticPathUtils');

var router = express.Router();

router.post('/', function (req, res) {
    if (!req.body.favorites || !req.body.favorites.length) {
        res.status(400).end();
        return;
    }

    Webm.find({seqid: {$in: req.body.favorites}}, 'seqid file_info.path')
        .sort({seqid: 1})
        .exec(function (err, webmsdb) {
            if (err) {
                log.error(err);
                res.status(500).end();
                return;
            }

            var webms = [];
            for (var i = 0; i < webmsdb.length; i++) {
                webms.push({
                    seqid: webmsdb[i].seqid,
                    previewSrc: staticPathUtils.resolvePreviewSrc(webmsdb[i].file_info.path)
                });
            }

            res.json({
                webms: webms,
                viewPath: '/' + (req.user ? 'edit/' : '')
            });
        });
});


module.exports = router;
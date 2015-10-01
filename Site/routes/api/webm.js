var util = require('util');
var express = require('express');
var db = require('../../db');
var logger = require('../../libs/logger');

var router = express.Router();

/**
 * Get webms for index page with tags or get moar webms
 *
 * @param tags, lastSeqid
 */
router.get('/', function (req, res) {
    var params = {lastSeqid: req.query.lastSeqid};

    if (req.cookies.tags) {
        try {
            var tags = JSON.parse(req.cookies.tags);

            if (tags && tags.length > 0) {
                params.tags = tags;
            }
        } catch (e) {
            res.clearCookie('tags');
        }
    }

    db.getWebms(params, function (err, result) {
        if (err) {
            logger.error(err);
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
            authorized: Boolean(req.user)
        });
    });
});


/**
 * Sets webm's property (tags as an example)
 *
 * @params property, action, value
 */
router.put('/:id([0-9]+)', function (req, res) {
    if (req.body.property === "tags" && (req.body.action === 'add' || req.body.action === 'remove') && req.body.value) {
        logger.info(util.format('%s %s %s', req.body.action, req.body.property, req.body.value), {
            login: req.user ? req.user.login : null,
            seqid: req.params.id,
            property: req.body.property,
            action: req.body.action,
            value: req.body.value
        });

        if (req.body.action === 'add') {
            db.webms.update({seqid: req.params.id}, {$addToSet: {tags: req.body.value}}, function (err, raw) {
                if (err) {
                    logger.error(err);
                    res.status(500).end();
                    return;
                }

                res.status(200).end();
            });
        } else {
            db.webms.update({seqid: req.params.id}, {$pull: {tags: req.body.value}}, function (err) {
                if (err) {
                    logger.error(err);
                    res.status(500).end();
                    return;
                }

                res.status(200).end();
            });
        }
    } else {
        res.status(400).end();
    }
});


module.exports = router;
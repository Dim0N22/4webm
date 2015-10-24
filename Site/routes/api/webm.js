var util = require('util');
var express = require('express');
var Webm = require('../../models/webm');
var log = require('../../libs/log');

var router = express.Router();

/**
 * Get webms for index page with tags
 *
 * @param tags, lastSeqid
 */
router.get('/', function (req, res) {
    var params = {};
    if (req.tags) {
        params.tags = req.tags;
    }

    params.hideDanger = !req.user;

    Webm.countByTags(params, function (err, tags) {
        if (err) {
            log.error(err);
            res.status(500).end();
            return;
        }

        params.lastSeqid = req.query.lastSeqid;

        Webm.getWebms(params, function (err, result) {
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
                viewPath: '/' + (req.user ? 'edit/' : ''),
                tags: tags
            });
        });
    });
});


/**
 * Get moar webms
 *
 * @param tags, lastSeqid
 */
router.get('/moar', function (req, res) {
    var params = {};
    if (req.tags) {
        params.tags = req.tags;
    }

    params.hideDanger = !req.user;
    params.lastSeqid = req.query.lastSeqid;

    Webm.getWebms(params, function (err, result) {
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
            viewPath: '/' + (req.user ? 'edit/' : '')
        });
    });
});


/**
 * @params action, value
 */
router.put('/:id([0-9]+)/tags', function (req, res) {
    if (!(req.body.action === 'add' || req.body.action === 'remove') || !req.body.value) {
        res.status(400).end();
        return;
    }

    log.info(util.format('%s %s %s', req.body.action, req.body.property, req.body.value), {
        login: req.user ? req.user.login : null,
        seqid: req.params.id,
        property: req.body.property,
        action: req.body.action,
        value: req.body.value
    });

    var action;
    if (req.body.action === 'add') {
        action = {$addToSet: {tags: req.body.value}};
    } else {
        action = {$pull: {tags: req.body.value}};
    }

    Webm.update({seqid: req.params.id}, action, function (err) {
        if (err) {
            log.error(err);
            res.status(500).end();
            return;
        }

        res.status(200).end();
    });
});


/**
 * @params action
 */
router.put('/:id([0-9]+)/:property(favoriteCount|likeCount|dislikeCount)', function (req, res) {
    if (!req.body.increment) {
        res.status(400).end();
        return;
    }

    var action;
    switch (req.params.property) {
        case 'favoriteCount':
            action = {$inc: {favoriteCount: req.body.increment === "true" ? 1 : -1}};
            break;
        case 'likeCount':
            action = {$inc: {likeCount: req.body.increment === "true" ? 1 : -1}};
            break;
        case 'dislikeCount':
            action = {$inc: {dislikeCount: req.body.increment === "true" ? 1 : -1}};
            break;
    }

    Webm.update({seqid: req.params.id}, action, function (err) {
        if (err) {
            log.error(err);
            res.status(500).end();
            return;
        }

        res.status(200).end();
    });
});

router.put('/:id([0-9]+)/view', function (req, res) {
    if (!req.body.secondsViewed) {
        res.status(400).end();
        return;
    }

    var action = {$inc: {secondsViewed: req.body.secondsViewed, viewsCount: 1}};

    log.info('view', {
        login: req.user ? req.user.login : null,
        seqid: req.params.id,
        secondsViewed: req.body.secondsViewed
    });

    Webm.update({seqid: req.params.id}, action, function (err) {
        if (err) {
            log.error(err);
            res.status(500).end();
            return;
        }

        res.status(200).end();
    });
});

module.exports = router;
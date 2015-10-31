var url = require('url');
var express = require('express');
var Webm = require('../models/webm');
var Comment = require('../models/comment');
var Tag = require('../models/tag');
var config = require('../libs/config');
var log = require('../libs/log');
var staticPathUtils = require('../libs/staticPathUtils');

var router = express.Router();
router.use('/random', require('./random'));
router.use('/login', require('./login'));
router.use('/invite', require('./invite'));
router.use('/logout', require('./logout'));
router.use('/doubles', require('./doubles'));
router.use('/favorites', require('./favorites'));


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

        if (req.query.lastSeqid) {
            params.lastSeqid = req.query.lastSeqid;
        }

        Webm.getTopByField({count: 2, field: 'viewsCount'}, function (err, viewsTop) {
            Webm.getTopByField({count: 2, field: 'commentsCount'}, function (err, commentsTop) {
                Webm.getWebms(params, function (err, result) {
                    if (err) {
                        log.error(err);
                        res.status(500).end();
                        return;
                    }

                    res.render('index', {
                        title: config.get('projectName'),
                        viewsTop: viewsTop,
                        commentsTop: commentsTop,
                        tags: tags,
                        webms: result.webms,
                        lastSeqid: result.lastSeqid,
                        viewPath: '/' + (req.user ? 'edit/' : ''),
                        tagsQuery: req.query.tags ? '?tags=' + req.query.tags : ''
                    });
                });
            });
        });
    });
});


router.get('/page/:page([0-9]+)', function (req, res) {
    var page = Number(req.params.page);
    if (page < 2) {
        res.redirect('/');
        return;
    }

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

        params.page = page;

        Webm.getWebms(params, function (err, result) {
            if (err) {
                log.error(err);
                res.status(500).end();
                return;
            }

            res.render('index', {
                title: config.get('projectName'),
                tags: tags,
                webms: result.webms,
                lastSeqid: result.lastSeqid,
                viewPath: '/' + (req.user ? 'edit/' : ''),
                tagsQuery: req.query.tags ? '?tags=' + req.query.tags : ''
            });
        });
    });
});


router.get('/:id([0-9]+)', function (req, res) {
    var id = Number(req.params.id);

    var conditions = {};
    if (req.tags) {
        conditions.tags = {$all: req.tags};
    }

    if (!req.user) {
        conditions = {$and: [conditions, {tags: {$nin: ['danger']}}]};
    }

    var prevIdPromise = Webm.findOne({$and: [conditions, {seqid: {$lt: id}}]}, {seqid: 1}, {sort: {seqid: -1}}).exec();
    var nextIdPromise = Webm.findOne({$and: [conditions, {seqid: {$gt: id}}]}, {seqid: 1}, {sort: {seqid: 1}}).exec();
    var curWebmPromise = Webm.findOne({$and: [conditions, {seqid: id}]}, {hasharr: 0}, {sort: {seqid: 1}}).exec();
    var commentsPromise = Comment.find({seqid: id}, 'name msg when', {sort: {when: -1}}).exec();

    Promise.all([prevIdPromise, nextIdPromise, curWebmPromise, commentsPromise])
        .then(function (values) {
            function response(prevId, nextId) {
                res.render('view', {
                    title: config.get('projectName') + ' #' + id,
                    id: id,
                    webm: webm,
                    comments: comments,
                    videoSrc: staticPathUtils.resolveVideoSrc(webm.file_info.path),
                    previewSrc: staticPathUtils.resolvePreviewSrc(webm.file_info.path),
                    tags: webm.tags,
                    prevHref: '/' + prevId + (req.query.tags ? '?tags=' + req.query.tags : ''),
                    nextHref: '/' + nextId + (req.query.tags ? '?tags=' + req.query.tags : '')
                });
            }

            var webm = values[2];
            if (!webm) {
                res.redirect('/');
                return;
            }

            var comments = values[3];

            if (!values[0] && !values[1]) { // one webm on this criteria
                response(id, id);
                return;
            } else if (!values[0]) { // if prev not found (actually for first webm)
                conditions.seqid = {$exists: true};
                Webm.findOne(conditions, {seqid: 1}, {sort: {seqid: -1}}).exec(function (err, prevId) {
                    if (err) {
                        log.error(err);
                        res.status(500).end();
                        return;
                    }

                    response(prevId.seqid, values[1].seqid);
                });
                return;
            } else if (!values[1]) { // if next not found (actually for last webm)
                conditions.seqid = {$exists: true};
                Webm.findOne(conditions, {seqid: 1}, {sort: {seqid: 1}}).exec(function (err, nextId) {
                    if (err) {
                        log.error(err);
                        res.status(500).end();
                        return;
                    }

                    response(values[0].seqid, nextId.seqid);
                });
                return;
            }

            response(values[0].seqid, values[1].seqid);
        }).catch(function (err) {
        log.error(err);
        res.status(500).end();
    });
});


router.get('/edit/:id([0-9]+)', function (req, res) {
    var id = Number(req.params.id);

    var conditions = {};
    if (req.tags) {
        conditions.tags = {$all: req.tags};
    }

    if (!req.user) {
        conditions = {$and: [conditions, {tags: {$nin: ['danger']}}]};
    }

    var prevIdPromise = Webm.findOne({$and: [conditions, {seqid: {$lt: id}}]}, {seqid: 1}, {sort: {seqid: -1}}).exec();
    var nextIdPromise = Webm.findOne({$and: [conditions, {seqid: {$gt: id}}]}, {seqid: 1}, {sort: {seqid: 1}}).exec();
    var curWebmPromise = Webm.findOne({seqid: id}, {hasharr: 0}, {sort: {seqid: 1}}).exec();
    var tagsPromise = Tag.find().select('name').exec();
    var commentsPromise = Comment.find({seqid: id}, 'name msg when', {sort: {when: -1}}).exec();

    Promise.all([prevIdPromise, nextIdPromise, curWebmPromise, tagsPromise, commentsPromise])
        .then(function (values) {
            function response(prevId, nextId) {
                res.render('edit', {
                    title: config.get('projectName') + ' edit #' + id,
                    id: id,
                    webm: webm,
                    comments: comments,
                    videoSrc: staticPathUtils.resolveVideoSrc(webm.file_info.path),
                    previewSrc: staticPathUtils.resolvePreviewSrc(webm.file_info.path),
                    shareUrl: url.format({protocol: req.protocol, host: req.hostname, pathname: String(id)}),
                    tags: tags,
                    prevHref: '/edit/' + prevId + (req.query.tags ? '?tags=' + req.query.tags : ''),
                    nextHref: '/edit/' + nextId + (req.query.tags ? '?tags=' + req.query.tags : ''),
                    danger: danger
                });
            }

            var webm = values[2];
            var tags = values[3];
            var comments = values[4];

            if (!webm) {
                res.redirect('/');
                return;
            }

            if (webm.comments) {
                webm.comments.sort(function (a, b) {
                    return b.date - a.date;
                });
            }

            var danger = false;
            for (var k = 0; k < webm.tags.length; k++) {
                if (webm.tags[k] === 'danger') {
                    danger = true;
                    break;
                }
            }

            if (webm.tags && webm.tags.length > 0) {
                for (var i = 0; i < tags.length; i++) {
                    for (var j = 0; j < webm.tags.length; j++) {
                        if (webm.tags[j] === tags[i].name) {
                            tags[i].enable = true;
                            break;
                        }
                    }
                }
            }

            if (!values[0] && !values[1]) { // one webm on this criteria
                response(id, id);
                return;
            } else if (!values[0]) { // if prev not found (actually for first webm)
                conditions.seqid = {$exists: true};
                Webm.findOne(conditions, {seqid: 1}, {sort: {seqid: -1}}).exec(function (err, prevId) {
                    if (err) {
                        log.error(err);
                        res.status(500).end();
                        return;
                    }

                    response(prevId.seqid, values[1].seqid);
                });
                return;
            } else if (!values[1]) { // if next not found (actually for last webm)
                conditions.seqid = {$exists: true};
                Webm.findOne(conditions, {seqid: 1}, {sort: {seqid: 1}}).exec(function (err, nextId) {
                    if (err) {
                        log.error(err);
                        res.status(500).end();
                        return;
                    }

                    response(values[0].seqid, nextId.seqid);
                });
                return;
            }

            response(values[0].seqid, values[1].seqid);
        }).catch(function (err) {
        log.error(err);
        res.status(500).end();
    });
});


module.exports = router;

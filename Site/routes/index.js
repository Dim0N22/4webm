var url = require('url');
var crypto = require('crypto');
var express = require('express');
var Webm = require('../models/webm');
var Tag = require('../models/tag');
var User = require('../models/user');
var config = require('../libs/config');
var mail = require('../libs/mail');
var log = require('../libs/log');

var router = express.Router();

router.get('/', function (req, res) {
    Webm.aggregate([
        {$match: {"tags": {$exists: true}}},
        {$project: {_id: 0, tags: 1}},
        {$unwind: "$tags"},
        {$group: {_id: "$tags", count: {$sum: 1}}}
    ], function (err, tags) {
        if (err) {
            log.error(err);
            res.status(500).end();
            return;
        }

        var params;
        if (req.cookies.tags) {
            try {
                var clientTags = JSON.parse(req.cookies.tags);

                if (clientTags.length > 0) {
                    params = {tags: clientTags};
                }
            } catch (e) {
                res.clearCookie('tags');
            }
        }

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
                authorized: Boolean(req.user),
                projectName: config.get('projectName')
            });
        });
    });
});


router.get('/:id([0-9]+)', function (req, res) {
    var id = Number(req.params.id);

    var conditions = {};
    if (req.cookies.tags) {
        try {
            var tags = JSON.parse(req.cookies.tags);

            if (tags && tags.length > 0) {
                conditions.tags = {$all: tags};
            }
        } catch (e) {
            res.clearCookie('tags');
        }
    }

    var prevIdPromise = Webm.findOne({$and: [conditions, {seqid: {$lt: id}}]}, {seqid: 1}, {sort: {seqid: -1}}).exec();
    var nextIdPromise = Webm.findOne({$and: [conditions, {seqid: {$gt: id}}]}, {seqid: 1}, {sort: {seqid: 1}}).exec();
    var curWebmPromise = Webm.findOne({seqid: id}, null, {sort: {seqid: 1}}).exec();

    Promise.all([prevIdPromise, nextIdPromise, curWebmPromise])
        .then(function (values) {
            function response(prevId, nextId) {
                res.render('view', {
                    title: config.get('projectName') + ' #' + id,
                    id: id,
                    videoSrc: url.resolve(config.get('videoServer'), String(webm.file_info.path).slice(2)),
                    tags: webm.tags,
                    prevHref: '/' + prevId,
                    nextHref: '/' + nextId,
                    authorized: Boolean(req.user),
                    projectName: config.get('projectName')
                });
            }

            var webm = values[2];

            if (!webm) {
                res.redirect('/');
                return;
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


router.get('/edit/:id([0-9]+)', function (req, res) {
    var id = Number(req.params.id);

    var conditions = {};
    if (req.cookies.tags) {
        try {
            var tags = JSON.parse(req.cookies.tags);

            if (tags && tags.length > 0) {
                conditions.tags = {$all: tags};
            }
        } catch (e) {
            res.clearCookie('tags');
        }
    }


    var prevIdPromise = Webm.findOne({$and: [conditions, {seqid: {$lt: id}}]}, {seqid: 1}, {sort: {seqid: -1}}).exec();
    var nextIdPromise = Webm.findOne({$and: [conditions, {seqid: {$gt: id}}]}, {seqid: 1}, {sort: {seqid: 1}}).exec();
    var curWebmPromise = Webm.findOne({seqid: id}, null, {sort: {seqid: 1}}).exec();
    var tagsPromise = Tag.find().select('name').exec();

    Promise.all([prevIdPromise, nextIdPromise, curWebmPromise, tagsPromise])
        .then(function (values) {
            function response(prevId, nextId) {
                res.render('edit', {
                    title: config.get('projectName') + ' edit #' + id,
                    id: id,
                    videoSrc: url.resolve(config.get('videoServer'), String(webm.file_info.path).slice(2)),
                    tags: tags,
                    prevHref: '/edit/' + prevId,
                    nextHref: '/edit/' + nextId,
                    danger: danger,
                    projectName: config.get('projectName')
                });
            }

            var webm = values[2];
            var tags = values[3];

            if (!webm) {
                res.redirect('/');
                return;
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


router.get('/random', function (req, res) {
    var conditions = {seqid: {$exists: true}};
    if (req.cookies.tags) {
        try {
            var tags = JSON.parse(req.cookies.tags);

            if (tags && tags.length > 0) {
                conditions.tags = {$all: tags};
            }
        } catch (e) {
            res.clearCookie('tags');
        }
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

                res.redirect('/' + webms[0].seqid);
            });
    });
});


router.get('/login', function (req, res) {
    res.render('login', {
        title: config.get('projectName') + ' login',
        error: req.query.error,
        projectName: config.get('projectName')
    });
});


router.post('/login', function (req, res) {
    if (!req.body.login || !req.body.secret) {
        //res.status(400).end();
        res.redirect('/login?error=' + 400);
        return;
    }

    User.findOne({
        login: req.body.login,
        secret: req.body.secret
    }, function (err, user) {
        if (err) {
            log.error(err);
            //res.status(500).end();
            res.redirect('/login?error=' + 500);
            return;
        }

        if (!user || !user.token) {
            //res.status(404).end();
            res.redirect('/login?error=' + 404);
            return;
        }

        res.cookie('token', user.token, {expires: new Date(2100, 01, 01), httpOnly: true});
        res.redirect('/');
    });
});

router.get('/invite', function (req, res) {
    res.render('invite', {
        title: config.get('projectName') + ' invite',
        error: req.query.error,
        success: req.query.success,
        projectName: config.get('projectName')
    });
});


router.post('/invite', function (req, res) {
    if (!req.body.email) {
        res.redirect('/invite?error=' + 400);
        return;
    }

    var secret = crypto.randomBytes(8).toString('hex');
    var token = crypto.randomBytes(64).toString('base64');

    User.create({
        login: req.body.email,
        secret: secret,
        token: token
    }, function (err) {
        if (err) {
            log.error(err);
            res.redirect('/invite?error=' + 500);
            return;
        }

        mail.sendInvite(req.body.email, secret, function (err) {
            if (err) {
                log.error(err);
                res.redirect('/invite?error=' + 500);
                return;
            }

            res.redirect('/invite?success=' + req.body.email);
        });
    });
});


module.exports = router;

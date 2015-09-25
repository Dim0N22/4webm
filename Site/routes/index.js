var url = require('url');
var express = require('express');
var router = express.Router();
var db = require('../db');
var config = require('../config');


router.get('/', function (req, res) {
    res.render('index', {title: '4webm'});
});


router.get('/:id([0-9]+)', function (req, res) {
    res.render('view', {title: 'webm ' + req.params.id});
});


router.get('/edit/:id([0-9]+)', function (req, res) {
    var id = Number(req.params.id);

    db.webms.findOne({seqid: id}, function (err, webm) {
        if (err) {
            res.status(500).end();
            console.log(err);
            return;
        }

        if (!webm) {
            res.redirect('/');
            return;
        }

        db.tags.find(function (err, tags) {
            if (err) {
                res.status(500).end();
                console.log(err);
                return;
            }

            // mark enable tags
            if (webm.tags) {
                for (var i = 0; i < tags.length; i++) {
                    if (webm.tags[tags[i].name]) {
                        tags[i].enable = true;
                    }
                }
            }

            res.render('edit', {
                title: 'Edit ' + id,
                id: id,
                videoSrc: url.resolve(config.videoServer, String(webm.file_info.path).slice(2)),
                tags: tags,
                prevHref: id > 1 ? '/edit/' + (id - 1) : '/',
                nextHref: '/edit/' + (id + 1)
            });
        });
    });
});


module.exports = router;
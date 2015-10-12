var url = require('url');
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


router.get('/:id', function (req, res) {
    var id = req.params.id;


    Webm.findOne({_id: id}, 'doubles file_info.path').exec(function (err, main) {
        if (err) {
            log.error(err);
            res.status(500).end();
            return;
        }


        var condition = {doubles: {$exists: true, $not: {$size: 0}}};
        var prevIdPromise = Webm.findOne({$and: [condition, {_id: {$lt: id}}]}, {_id: 1}, {sort: {_id: -1}}).exec();
        var nextIdPromise = Webm.findOne({$and: [condition, {_id: {$gt: id}}]}, {_id: 1}, {sort: {_id: 1}}).exec();
        var doublesPromise = Webm.find({_id: {$in: main.doubles}}, '_id file_info.path').exec();


        Promise.all([prevIdPromise, nextIdPromise, doublesPromise])
            .then(function (values) {
                function response(prevId, nextId) {
                    res.render('doubles/view', {
                        title: config.get('projectName') + ' #' + id,
                        id: id,
                        doubles: doubles,
                        videoSrc: url.resolve(config.get('videoServer'), String(main.file_info.path).slice(2)),
                        prevHref: '/doubles/' + prevId,
                        nextHref: '/doubles/' + nextId
                    });
                }

                var doubles = [];
                for (var i = 0; i < values[2].length; i++) {
                    doubles.push({
                        _id: values[2][i]._id,
                        videoSrc: url.resolve(config.get('videoServer'), String(values[2][i].file_info.path).slice(2))
                    });
                }


                if (!values[0] && !values[1]) { // one webm on this criteria
                    response(id, id);
                    return;
                } else if (!values[0]) { // if prev not found (actually for first webm)
                    Webm.findOne(condition, {_id: 1}, {sort: {_id: -1}}).exec(function (err, prevId) {
                        if (err) {
                            log.error(err);
                            res.status(500).end();
                            return;
                        }

                        response(prevId._id, values[1]._id);
                    });
                    return;
                } else if (!values[1]) { // if next not found (actually for last webm)
                    Webm.findOne(condition, {_id: 1}, {sort: {_id: 1}}).exec(function (err, nextId) {
                        if (err) {
                            log.error(err);
                            res.status(500).end();
                            return;
                        }

                        response(values[0]._id, nextId._id);
                    });
                    return;
                }

                response(values[0]._id, values[1]._id);
            }).catch(function (err) {
                log.error(err);
                res.status(500).end();
            });

    });


});


module.exports = router;
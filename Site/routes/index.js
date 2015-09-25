var express = require('express');
var router = express.Router();
var db = require('../db');


router.get('/', function (req, res) {
    res.render('index', {title: 'Express'});
});


router.get('/:id([0-9]+)', function (req, res) {
    res.render('view', {title: 'webm ' + req.params.id});
});


router.get('/edit/:id([0-9]+)', function (req, res) {
//webms.find()
//    .limit(20)
//    .exec(function (err, kittens) {
//        if (err) return console.error(err);
//        console.log(kittens);
//    });

    var tags = [
        {name: 'tag1', enable: true},
        {name: 'tag2'}];

    var id = Number(req.params.id);

    res.render('edit', {
        title: 'Edit ' + id,
        id: id,
        videoSrc: '',
        tags: tags,
        prevHref: id > 1 ? '/edit/' + (id - 1) : '/',
        nextHref: '/edit/' + (id + 1)
    });

});


module.exports = router;
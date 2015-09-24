var express = require('express');
var router = express.Router();


router.get('/', function (req, res) {
    res.render('index', {title: 'Express'});
});


router.get('/:id([0-9]+)', function (req, res) {
    res.render('view', {title: 'webm ' + req.params.id});
});


router.get('/edit/:id([0-9]+)', function (req, res) {
    var tags = [
        {name: 'tag1', enable: true},
        {name: 'tag2'}];

    res.render('edit', {
        title: 'Edit ' + req.params.id,
        id: req.params.id,
        path: "",
        tags: tags
    });

});


module.exports = router;
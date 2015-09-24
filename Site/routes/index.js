var express = require('express');
var router = express.Router();


router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});


router.get('/:id([0-9]+)', function (req, res, next) {
    res.render('view', {title: 'View ' + req.params.id});
});


router.get('/edit/:id([0-9]+)?', function (req, res, next) {
    res.render('edit', {title: 'Edit ' + req.params.id});
});


module.exports = router;
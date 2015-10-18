var express = require('express');
var config = require('../libs/config');

var router = express.Router();

router.get('/', function (req, res) {
    res.render('favorites', {
        title: config.get('projectName') + ' favorites'
    });
});

module.exports = router;
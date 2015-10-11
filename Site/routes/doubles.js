var express = require('express');
var log = require('../libs/log');

var router = express.Router();

router.get('/', function (req, res) {
    res.status(200).end();
});


module.exports = router;
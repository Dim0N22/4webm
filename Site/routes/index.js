var express = require('express');

var router = express.Router();

router.get('/', function (req, res) {
    res.send('4webm');
});

module.exports = router;
var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
    res.send('webm');
});


// TODO add tag to video

module.exports = router;
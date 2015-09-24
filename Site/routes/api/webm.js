var express = require('express');
var router = express.Router();
var db = require('../../db');


router.get('/', function (req, res) {
    res.send('webm');
});


/**
 * Sets webm's property (tags as an example)
 *
 * @params property, action, value
 */
router.put('/:id([0-9]+)', function (req, res) {
    if (req.body.property === "tags" && (req.body.action === 'add' || req.body.action === 'remove') && req.body.value) {
        // TODO db.webm.updateTags(req.body.action, req.body.value)
        res.status(200).end();
    } else {
        res.status(400).end();
    }
});


router.put('/:id([0-9]+)/next', function (req, res) {
    res.send('webm');
});


router.put('/:id([0-9]+)/prev', function (req, res) {
    res.send('webm');
});


module.exports = router;
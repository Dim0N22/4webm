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
        if (req.body.action === 'add') {
            db.webms.update({seqid: req.params.id}, {$addToSet: {tags: req.body.value}}, function (err, raw) {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                    return;
                }

                res.status(200).end();
            });
        } else {
            db.webms.update({seqid: req.params.id}, {$pull: {tags: req.body.value}}, function (err) {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                    return;
                }

                res.status(200).end();
            });
        }
    } else {
        res.status(400).end();
    }
});


module.exports = router;
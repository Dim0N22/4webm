var mongoose = require('../libs/mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    seqid: {type: Number, index: true},
    name: String,
    msg: String,
    when: Date,
    ip: String
}, {versionKey: false});
var Comment = mongoose.model('Comment', commentSchema);


module.exports = Comment;
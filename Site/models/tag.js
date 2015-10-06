var mongoose = require('../libs/mongoose');
var Schema = mongoose.Schema;

var tagSchema = new Schema({
    name: String,
    creator: String,
    when: Date
}, {versionKey: false});
var Tag = mongoose.model('Tag', tagSchema);


module.exports = Tag;
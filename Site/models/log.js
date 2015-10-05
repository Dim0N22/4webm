var mongoose = require('../libs/mongoose');
var Schema = mongoose.Schema;

var logSchema = new Schema({
    type: String, // error|info
    when: Date,
    error: Object,
    message: String,
    data: Object
}, {versionKey: false});
var Log = mongoose.model('Log', logSchema);


module.exports = Log;
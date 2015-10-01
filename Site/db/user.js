var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    login: String,
    secret: String,
    token: String,
    roles: [String]
}, {versionKey: false});
var User = mongoose.model('User', userSchema);


module.exports = User;
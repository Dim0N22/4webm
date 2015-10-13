var mongoose = require('../libs/mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    login: { type: String, unique: true },
    secret: String,
    tokens: [String],
    roles: [String]
}, {versionKey: false});
var User = mongoose.model('User', userSchema);


module.exports = User;
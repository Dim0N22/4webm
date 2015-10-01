var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var maxWebmIdSchema = new Schema({currentId: Number}, {collection: 'maxwebmid'});
var MaxWebmId = mongoose.model('MaxWebmId', maxWebmIdSchema);


module.exports = MaxWebmId;
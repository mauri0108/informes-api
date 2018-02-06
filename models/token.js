var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TokenSchema = Schema({
    usuario: String,
    token: String,
    creado : String
});

 module.exports = mongoose.model('Token', TokenSchema, 'tokens');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProtocoloSchema = Schema({
  nombre : String,
  items : [
    { 
      _id: false,
      nombre : String,
      caracteristicas : [
        {
          _id: false,
          nombre : String,
          opciones : [String]
        }
      ]
    }
  ],
  creado : String
});

module.exports = mongoose.model('Protocolo', ProtocoloSchema, 'protocolos');

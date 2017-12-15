var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InformeSchema = Schema({
  nombre : String,
  items : [
    {
      nombre : String,
      caracteristicas : [
        {
          nombre : String,
          opciones : [String]
        }
      ]
    }
  ],
  creado : String
});

module.exports = mongoose.model('Informe', InformeSchema, 'informes');

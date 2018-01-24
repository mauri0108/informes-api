var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InformeSchema = Schema({
  institucion: String,
  logo: String,
  medico: String,
  paciente: String,
  detalle : {
        _id: false,
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
   },
   observacion: String,
   usuario : { type: Schema.Types.ObjectId, ref: 'Usuario' },
   fecha: String
});

module.exports = mongoose.model('Informe', InformeSchema, 'informes');
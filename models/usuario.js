'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UsuarioSchema = Schema({
  nombre: String,
  apellido: String,
  //telefono: String,
  email: String,
  pass: String,
  role: String,
  //imagen: String,
  fechaAlta : String,
  fechaBaja : String
});

module.exports = mongoose.model('Usuario', UsuarioSchema, 'usuarios');

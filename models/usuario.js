'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UsuarioSchema = Schema({
  nombre: String,
  apellido: String,
  email: String,
  instituciones: [
    {
      _id: false,
      nombre: String,
      logo: String
    }
  ],
  pass: String,
  role: String,
  fechaAlta : String,
  fechaBaja : String
});

UsuarioSchema.methods.toJSON = function(){
  let user = this;
  let userObject = user.toObject();
  delete userObject.pass;
  return userObject;
}

module.exports = mongoose.model('Usuario', UsuarioSchema, 'usuarios');

'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = '123456789';

exports.CrearToken = (usuario)=>{
  var payload = {
    sub: usuario._id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    role: usuario.role,
    iat: moment().unix(),
    exp: moment().add(1, 'days').unix
  }

  return jwt.encode(payload, secret);
};

'use strict'

var jwt = require('jsonwebtoken');
var crypto = require("crypto");
var SEED = require('../config/config').SEED ;

exports.CrearToken = (usuario, time)=>{

  var id = crypto.randomBytes(20).toString('hex');

  var token = jwt.sign( {
                         sub: id,
                         nombre: usuario.nombre,
                         apellido: usuario.apellido,
                         email: usuario.email
                        }, SEED , { expiresIn: time  });

  return token;
};

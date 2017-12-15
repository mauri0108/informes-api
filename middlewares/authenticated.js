'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = '123456789';

exports.ensureAuth = (req, res, next)=>{
  if (!req.headers.authorization) {
    return res.status(403).send({message: 'La peticion no tiene la cabecera de autenticacion'});
  }

  var token = req.headers.authorization.replace(/['"]+/g, '');

  try {
        var payload = jwt.decode(token, secret);

        if (payload <= moment().unix()) {
          return res.status(401).send({message: 'El token ha expirado'});
        }

  } catch (e) {
    console.log(e);
    return res.status(404).send({message: 'Token no valido'});
  }

  req.usuario = payload;

  next();
}

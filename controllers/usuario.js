'use strict'

var bcrypt = require('bcrypt-nodejs');
var Usuario = require('../models/usuario');
var jwt = require('../services/jwt');
var moment = require('moment');

function createUser(req, res) {
  var params = req.body;

  var nUsuario = new Usuario();

  nUsuario.nombre = params.nombre;
  nUsuario.apellido = params.apellido;
  nUsuario.email = params.email;
  nUsuario.pass = params.pass;
  nUsuario.role = params.role;
  nUsuario.fechaAlta = moment().format('DD-MM-YYYY HH:mm:ss');
  nUsuario.fechaBaja = null;

  //res.status(200).send({ body : req.body, usuario : nUsuario });

  if (params.email && params.pass ) {
    Usuario.findOne({email: params.email.toLowerCase()},(err, usuario)=>{
      if (err) {
        res.status(500).send({message: 'Error en la peticion', err : err });
      } else {
        if (!usuario) {
          nUsuario.email = params.email;

          bcrypt.hash(params.pass,null,null,(err,hash)=>{
            nUsuario.pass = hash;

            if (nUsuario.nombre != null && nUsuario.apellido != null) {
              nUsuario.save((err, usuarioStored)=>{
                if (err) {
                  res.status(500).send({message: 'Error al guardar el usuario'});
                } else {
                  if (!usuarioStored) {
                    res.status(404).send({message: 'No se ha registrado el usuario'});
                  }else {
                    res.status(200).send({usuario: usuarioStored});
                  }
                }
              });
            } else {
              res.status(200).send({message: 'Por favor complete los campos de nombre, apellido'});
            }
          });
        } else {
          res.status(200).send({message: 'Ya existe un usuario registrado con este email', usuario: usuario});
        }
      }
    });
  } else {
    res.status(200).send({message: 'Ingrese e-mail y clave'});
  }
}


function login(req, res) {
  var params = req.body;

   var email = params.email;
   var pass = params.pass;

    //res.status(200).send({ email : email, pass: pass});
    //return;

   Usuario.findOne({ email: email }, (err, usuario)=>{
     if (err) {
       res.status(500).send({message:'Error en la peticion'});
     } else {
       if (!usuario) {
         res.status(404).send({message: 'El usuario no existe o ingreso mal su email'});
       }else {
         bcrypt.compare(pass, usuario.pass, (err,check)=>{
           if (check) {
             //Se devuelven los datos del usuario
             if (params.gethash) {
               //devolver el jwt
               res.status(200).send({token: jwt.CrearToken(usuario), usuario: usuario});
             }
           }else {
             res.status(404).send({message: 'No se ha podido loguear, pass incorrecto'});
           }
         });
       }
     }
   });
}


module.exports ={
  createUser,
  login
};

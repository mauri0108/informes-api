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
                  res.status(500).send({message: 'Error al guardar el usuario', error: err});
                } else {
                  if (!usuarioStored) {
                    res.status(404).send({message: 'No se ha registrado el usuario'});
                  }else {
                    res.status(200).send({usuario: usuarioStored, message: 'Se creo correctamente el usuario'});
                  }
                }
              });
            } else {
              res.status(200).send({message: 'Por favor complete los campos de nombre, apellido'});
            }
          });
        } else {
          res.status(200).send({message: 'Ya existe un usuario registrado con este email'});
        }
      }
    });
  } else {
    res.status(200).send({message: 'Ingrese e-mail y clave'});
  }
}

function getUsers(req, res) {
  Usuario.find({}).exec((err, usuarios) =>{
    if (err) {
      res.status(500).send({message: 'Error en la peticion al servidor', error : err});
    } else {
      res.status(200).send( { usuarios : usuarios} );
    }
  });
}

function getUser(req, res) {
  var idUsuario = req.params.id;

  Usuario.findById(idUsuario).exec((err, usuario) =>{
    if (err) {
      res.status(500).send({ message: 'Error en la peticion al servidor', error : err });
    } else {
      if (!usuario) {
        res.status(200).send({ message: 'No existe ningun usuario con este id'});
      } else {
        res.status(200).send( { usuario : usuario } );
      }
    }
  });
}

function editUser(req, res) {
  var idUsuario = req.body._id;
  var datosNuevos = req.body;

  Usuario.findByIdAndUpdate(idUsuario, datosNuevos,{new : true},(err, userEdited)=>{
    if (err) {
      res.status(500).send({message:'Error al actualizar el usuario', err : err});
    }else {
      if (!userEdited) {
        res.status(404).send({message:'No se ha podido actualizar el usuario'});
      }else {
        res.status(200).send( { usuario : userEdited, message : 'Se actualizo correctamente el usuario'} );
      }
    }
  });
}


function login(req, res) {
  
  var params = req.body;
  var email = params.email;
  var pass = params.pass;

    //res.status(200).send({ email : email, pass: pass});
    //return;

   Usuario.findOne({ email: email }, (err, usuario)=>{
     if (err) {
       return res.status(500).send({message:'Error en la peticion', error: err});
     } 
       
    if (!usuario) {
         res.status(404).send({message: 'No se ha podido loguear e-mail o password incorrectos'});
    }else {
       bcrypt.compare(pass, usuario.pass, (err,check)=>{
           if (check) {
            usuario.pass = "No disponible";
            res.status(200).send({token: jwt.CrearToken(usuario), usuario: usuario});
           }else {
             res.status(404).send({message: 'No se ha podido loguear e-mail o password incorrectos'});
           }
         });
    }
     
   });
}


module.exports ={
  createUser,
  login,
  getUsers,
  getUser,
  editUser
};

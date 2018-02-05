'use strict'

var bcrypt = require('bcrypt-nodejs');
var Usuario = require('../models/usuario');
var jwt = require('../services/jwt');
var moment = require('moment');
var nodemailer = require('nodemailer');
var EMAIL = require('../config/config').EMAIL ;
var PASS = require('../config/config').PASS ;
var URL_CLIENTE = require('../config/config').URL_CLIENTE ;

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
            res.status(200).send({token: jwt.CrearToken(usuario, 86400), usuario: usuario});
           }else {
             res.status(404).send({message: 'No se ha podido loguear e-mail o password incorrectos'});
           }
         });
    }
     
   });
}

function resetPass(  req, res){
  var body = req.body;
  var email = body.email;
  var token = '';

  Usuario.findOne({ email: email }, (err, usuario)=>{
    if (err) {
      return res.status(500).send({message:'Error en la peticion', error: err});
    } 
     
    if (!usuario) {
        res.status(404).send({message: 'No se encontro el mail seleccionado'});
    }else {
      var transoporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user : EMAIL,
          pass : PASS,
        }
      });

      token = jwt.CrearToken(usuario, 3600);

      var mailOptions = {
        from: 'dominaeco.system <'+EMAIL+'>',
        to: usuario.email,
        subject: 'Cambio de contraseña',
        text: `Solicitud de cambio de contraseña. Para poder cambiar efectivamente su contraseña debera ingresar el siguiente link, 
              que solo estara disponible por 1 hora.${URL_CLIENTE}${token}`,
        html: `<h2>Solicitud de cambio de contraseña</h2>
              <p>Para poder cambiar efectivamente su contraseña debera ingresar el siguiente link, 
              que solo estara disponible por 1 hora.</p>
              ${URL_CLIENTE}${token}`
      };

      transoporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.status(401).send({ error })
        }

        res.status(200).send({ message: 'Se ha enviado a su e-mail registrado las instrucciones para cambiar su contraseña', info: info})
      });
            

    }
  });

}

function changePassToken( req, res){
  var body = req.body;
  var newPass = body.pass;
  var email = body.email;

  Usuario.findOne({ email: email }, (err, usuario)=>{
    if (err) {
      return res.status(500).send({message:'Error en la peticion', error: err});
    } 
      
   if (!usuario) {
        res.status(404).send({message: 'No se ha cambiar la contraseña loguear e-mail incorrecto'});
   }else {
      bcrypt.hash(newPass,null,null,(err,hash)=>{
        usuario.pass = hash;

        usuario.save((err, usuarioStored)=>{
          if (err) {
            res.status(500).send({message: 'Error al guardar el usuario', error: err});
          } else {
            if (!usuarioStored) {
                res.status(404).send({message: 'No se ha podido cambiado la contraseña'});
            }else {
                res.status(200).send({ message: 'Se cambio correctamente la contraseña'});
            }
          }
        });
      
      });
    }
  });
}

function changePass( req, res) {
  var body = req.body;
  var email = body.email;
  var pass = body.pass;
  var newPass = body.newpass

   Usuario.findOne({ email: email }, (err, usuario)=>{
     if (err) {
       return res.status(500).send({message:'Error en la peticion', error: err});
     } 
       
    if (!usuario) {
         res.status(404).send({message: 'No se ha podido encontrar el usuario'});
    }else {
       bcrypt.compare(pass, usuario.pass, (err,check)=>{
           if (check) {
            bcrypt.hash(newPass,null,null,(err,hash)=>{
              usuario.pass = hash;
  
              usuario.save((err, usuarioStored)=>{
                  if (err) {
                    res.status(500).send({message: 'Error al actualizar la contraseña el usuario', error: err});
                  } else {
                    if (!usuarioStored) {
                      res.status(404).send({message: 'No se ha podido cambiar la contraseña del usuario el usuario'});
                    }else {
                      res.status(200).send({ message: 'Se cambio correctamente la contraseña del usuario'});
                    }
                  }
                });
             
            });
           }else {
             res.status(404).send({ message: 'La contraseña ingresada no coincide con su contrasña, no es posible cambiar su contraseña' });
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
  editUser,
  resetPass,
  changePassToken,
  changePass
};

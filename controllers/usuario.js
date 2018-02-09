'use strict'

//Modelos
var Usuario = require('../models/usuario');
var Token = require('../models/token');

//Servicios
var jwt = require('../services/jwt');

//Librerias
var bcrypt = require('bcrypt-nodejs');
var crypto = require("crypto");
var moment = require('moment');
var nodemailer = require('nodemailer');
var fs = require('fs');
var _path = require("path");

//Configs
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
  var cryptoToken = '';

  Usuario.findOne({ email: email }, (err, usuario)=>{
    if (err) {
      return res.status(500).send({message:'Error en la peticion', error: err});
    } 
     
    if (!usuario) {
        res.status(404).send({message: 'No se encontro el mail seleccionado:'+ email });
    }else {
      var transoporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user : EMAIL,
          pass : PASS,
        }
      });

      cryptoToken = crypto.randomBytes(8).toString('hex');

      var token = new Token({
        token: cryptoToken,
        usuario: usuario.email,
        creado : moment().format('DD-MM-YYYY HH:mm:ss')
      });

      token.save( (error, tokenStored) => {
        if (error) {
          res.status(500).send({ message: 'Error en la peticion', error : error });
        } else {
          if ( !tokenStored ) {
            res.status(403).send({ message : 'No pudo generar el token'});
          } else {
            var mailOptions = {
              from: 'dominaeco.system <'+EMAIL+'>',
              to: usuario.email,
              subject: 'Cambio de contraseña',
              text: `Solicitud de cambio de contraseña. 
                    Para poder cambiar efectivamente su contraseña debera ingresar el siguiente link.
                    ${URL_CLIENTE}${tokenStored.token}`,
              html: `<h2>Solicitud de cambio de contraseña</h2>
                    <p>Para poder cambiar efectivamente su contraseña debera ingresar el siguiente link.</p>
                    ${URL_CLIENTE}${tokenStored.token}`
            };
      
            transoporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                res.status(401).send({ error })
              }
      
              res.status(200).send({ message: 'Se ha enviado a su e-mail registrado las instrucciones para cambiar su contraseña', info: info})
            });
          }
        }
      });
    }
  });

}

function changePassToken( req, res){
  var body = req.body;
  var newPass = body.newpass;
  var token = body.token;

  Token.findOne({ token: token  }, (error, tokenFind) => {
    if (error) {
      return res.status(500).send({message:'Error en la peticion', error: err});
    }

    if (!tokenFind) {
      res.status(404).send({message: 'No se ha cambiar la contraseña el token es inválido'});
    } else {
      Usuario.findOne({ email: tokenFind.usuario }, (err, usuario)=>{
        if (err) {
          return res.status(500).send({message:'Error en la peticion', error: err});
        } 
          
        if (!usuario) {
              res.status(404).send({message: 'No se ha cambiar la contraseña e-mail incorrecto'});
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
                    Token.findByIdAndRemove({ _id : tokenFind._id }, (error) => {
                      if (error) {
                        return res.status(500).send({message:'Error en la peticion al borrar token', error: error});
                      }
                    });
    
                    res.status(200).send({ message: 'Se cambio correctamente la contraseña'});   
                }
              }
            });
          }); 
        }
      });   
    }
  });



  
}

function changePass( req, res) {
  var body = req.body;
  var email = body.email;
  var pass = body.oldpass;
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
             res.status(404).send({ message: 'La contraseña ingresada no coincide con su contraseña actual, no es posible cambiar su contraseña' });
           }
         });
    }
     
   });
}

function uploadImage( req, res ) {
  var id = req.params.id;
  var instIndex = req.query.institucion;

  if( req.files ){
      let file = req.files.image;
      let extensionArr = file.name.split('.');
      let extesion = extensionArr[ extensionArr.length - 1 ];

      let extensionesValidas = [ 'png', 'jpg', 'gif', 'jpeg' ]

      if( extensionesValidas.indexOf(extesion) < 0 ){
          return res.status(400).send({
              message : "Extension no valida"
          });
      }

      var nombre = `${ id }-${ new Date().getMilliseconds()}.${ extesion }`;

      var path = `./uploads/${ nombre }`;
      
      file.mv( path, err =>{
          if( err ){
              return res.status(500).json({
                  message : 'Error al mover archivo',
                  errors: err
              });
          }

          Usuario.findById( id, (err, usuario ) =>{

              let pathViejo = `./uploads/${ usuario.instituciones[instIndex].logo }`;

              if ( fs.existsSync(pathViejo) ) {
                  fs.unlink( pathViejo );
              }

              usuario.instituciones[instIndex].logo = nombre;

              usuario.save( (err, usuarioUpdated)=>{
                  return res.status(200).send({
                      message: "Institucion agregada correctamente",
                      usuario : usuarioUpdated
                  });
              });
          });

      });

  }
}

function getImage(req, res) {
var nombre = req.params.name;
var path = _path.join(__dirname, '..', `uploads/${nombre}`);

fs.exists(path, image =>{
   if ( !image ) {
     //res.status(404).send({ ruta: path });
     res.status(404).send({ message: 'No se encontro la imagen' });
   }

   res.sendFile(path);
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
  changePass,
  uploadImage,
  getImage
};

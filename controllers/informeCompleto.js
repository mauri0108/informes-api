'use strict'

var InformeCompleto = require("../models/InformeCompleto");
var fs = require('fs');


function createInformeCompleto(req, res) {
    var params = req.body;
  
    var informeCompleto = new InformeCompleto({
        institucion: params.institucion,
        medico: params.medico,
        paciente: params.paciente,
        infDetalle: params.infDetalle,
        observacion: params.observacion,
        usuario : params.usuario,
        fecha: params.fecha
    });
  
    informeCompleto.save( (err, informeCompletoStored) => {
      if (err) {
        res.status(500).send({ message: 'Error en la peticion', error : err });
      } else {
        if (!informeCompletoStored) {
          res.status(200).send({ message : 'No se ha guardado el informe completo'});
        } else {
          res.status(201).send( { informeCompleto : informeCompletoStored, message : 'Se guardo correctamente el informe completo'} );
        }
      }
    });
}

function updateInformeCompleto( req, res ) {
    var id = req.body.id;
    var datosNuevos = req.body;
    
    InformeCompleto.findByIdAndUpdate( id, datosNuevos,{new : true}, ( err, informeCompletoEdited)=>{
        if (err) {
            res.status(500).send({message:'Error al actualizar el informe completo', err : err});
          }else {
            if (!informeEdited) {
              res.status(404).send({message:'No se ha podido actualizar el informe completo'});
            }else {
              res.status(200).send( { informeCompleto : informeEdited, message : 'Se actualizo correctamente el informe completo'} );
            }
          }
    });
}

function getInformeCompleto(req, res) {
    var id = req.params.id;
  
    InformeCompleto.findById(id).exec((err, informeCompleto) =>{
      if (err) {
        res.status(500).send({ message: 'Error en la peticion al servidor', error : err });
      } else {
        if (!informe) {
          res.status(200).send({ message: 'No existe ningun informe completo con este id'});
        } else {
          res.status(200).send( { informeCompleto : informeCompleto } );
        }
      }
    });
}

function getInformesUsuario(req, res) {
    var id = req.params.id;
  
    InformeCompleto.find( { usuario : id } ).exec((err, informeCompleto) =>{
      if (err) {
        res.status(500).send({ message: 'Error en la peticion al servidor', error : err });
      } else {
        if (!InformeCompleto) {
          res.status(200).send({ message: 'No existe ningun informe completo con este id'});
        } else {
          res.status(200).send( { informesCompletos : informeCompleto } );
        }
      }
    });
}

function uploadImage( req, res ) {
    var id = req.params.id;

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

            InformeCompleto.findById( id, (err, informeCompleto) =>{

                let pathViejo = `./uploads/${ informeCompleto.logo }`;

                if ( fs.existsSync(pathViejo) ) {
                    fs.unlink( pathViejo );
                }

                informeCompleto.logo = nombre;

                informeCompleto.save( (err, informeCompletoUpdated)=>{
                    return res.status(200).send({
                        message: "Imagen actualizada correctamente",
                        informeCompleto : informeCompletoUpdated
                    });
                });
            });

            /*res.status(200).json({
                message : 'Archivo movido',
                nombre
            });*/
        });

    }
}




module.exports = {
    createInformeCompleto,
    updateInformeCompleto,
    getInformeCompleto,
    getInformesUsuario,
    uploadImage
  };
  
'use strict'

var Informe = require("../models/informe");
var fs = require('fs');


function createInforme(req, res) {
    var params = req.body;
  
    var informe = new Informe({
        institucion: params.institucion,
        medico: params.medico,
        paciente: params.paciente,
        detalle: params.detalle,
        observacion: params.observacion,
        usuario : params.usuario,
        fecha: params.fecha
    });
  
    informe.save( (err, informeStored) => {
      if (err) {
        res.status(500).send({ message: 'Error en la peticion', error : err });
      } else {
        if ( !informeStored ) {
          res.status(200).send({ message : 'No se ha guardado el informe'});
        } else {
          res.status(201).send( { informe : informeStored, message : 'Se guardo correctamente el informe'} );
        }
      }
    });
}

function updateInforme( req, res ) {
    var id = req.body.id;
    var datosNuevos = req.body;
    
    Informe.findByIdAndUpdate( id, datosNuevos,{new : true}, ( err, informeEdited)=>{
        if (err) {
            res.status(500).send({message:'Error al actualizar el informe', err : err});
          }else {
            if ( !informeEdited ) {
              res.status(404).send({message:'No se ha podido actualizar el informe'});
            }else {
              res.status(200).send( { informe : informeEdited, message : 'Se actualizo correctamente el informe'} );
            }
          }
    });
}

function getInforme(req, res) {
    var id = req.params.id;
  
    Informe.findById(id).exec((err, informe) =>{
      if (err) {
        res.status(500).send({ message: 'Error en la peticion al servidor', error : err });
      } else {
        if (!informe) {
          res.status(200).send({ message: 'No existe ningun informe con este id'});
        } else {
          res.status(200).send( { informe : informe } );
        }
      }
    });
}

function getInformesUsuario(req, res) {
    var id = req.params.id;
  
    Informe.find( { usuario : id } ).exec((err, informes) =>{
      if (err) {
        res.status(500).send({ message: 'Error en la peticion al servidor', error : err });
      } else {
        if ( !informes ) {
          res.status(200).send({ message: 'No existes informes para este usuario'});
        } else {
          res.status(200).send( { informes : informes } );
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

            Informe.findById( id, (err, informe ) =>{

                let pathViejo = `./uploads/${ informe.logo }`;

                if ( fs.existsSync(pathViejo) ) {
                    fs.unlink( pathViejo );
                }

                informe.logo = nombre;

                informe.save( (err, informeUpdated)=>{
                    return res.status(200).send({
                        message: "Imagen actualizada correctamente",
                        informe : informeUpdated
                    });
                });
            });

        });

    }
}

function getImage(req, res) {
  var nombre = req.params.name;
  var path = `./uploads/${nombre}`;

  fs.exists( path, image =>{
     if ( !image ) {
       path = './assets/no-img.jpg'
     }

     res.sendfile(path);
  });
}



module.exports = {
    createInforme,
    updateInforme,
    getInforme,
    getInformesUsuario,
    uploadImage,
    getImage
};
  
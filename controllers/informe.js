'use strict'

var Informe = require("../models/informe");



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
    var id = req.body._id;
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
          res.status(404).send({ message: 'No existes informes para este usuario'});
        } else {
          res.status(200).send( { informes : informes } );
        }
      }
    });
}



function searchInforme(req, res) {
  var texto = req.params.texto;
  var idUsuario = req.params.id;
  Informe.find({'$text':{'$search': texto }, usuario: idUsuario }).exec((err, informes) =>{
    if (err) {
      return res.status(500).send({ message : 'Error en la busqueda'});
    }

    res.status(200).json({ informes });
  });
}



module.exports = {
    createInforme,
    updateInforme,
    getInforme,
    getInformesUsuario,
    searchInforme
};
  
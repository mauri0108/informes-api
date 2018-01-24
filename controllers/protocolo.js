'use strict'

var Protocolo = require("../models/protocolo");
const moment = require('moment')

function getProtocolos(req, res) {
  Protocolo.find({}).exec((err, protocolos) =>{
    if (err) {
      res.status(500).send({message: 'Error en la peticion al servidor', error : err});
    } else {
      res.status(200).send( { protocolos : protocolos} );
    }
  });
}

function getProtocolo(req, res) {
  var idProtocolo = req.params.id;

  Protocolo.findById( idProtocolo ).exec((err, protocolo) =>{
    if (err) {
      res.status(500).send({ message: 'Error en la peticion al servidor', error : err });
    } else {
      if (!protocolo ) {
        res.status(200).send({ message: 'No existe ningun protcolo con este id'});
      } else {
        res.status(200).send( { protocolo : protocolo } );
      }
    }
  });
}

function createProtocolo(req, res) {
  var body = req.body;

  var protocolo = new Protocolo({
    nombre : body.nombre,
    items: body.items,
    creado: moment().format('DD-MM-YYYY HH:mm:ss')
  });

  protocolo.save((err, protocoloStored) => {
    if (err) {
      res.status(500).send({ message: 'Error en la peticion', error : err });
    } else {
      if (!protocoloStored) {
        res.status(200).send({ message : 'No se ha guardado el protocolo'});
      } else {
        res.status(200).send( { protocolo : protocoloStored, message : 'Se guardo correctamente el protocolo'} );
      }
    }
  });
}

function editProtocolo(req, res) {
  var idProtocolo = req.body._id;
  var datosNuevos = req.body;

  Protocolo.findByIdAndUpdate(idProtocolo, datosNuevos,{new : true},(err, protocoloEdited)=>{
    if (err) {
      res.status(500).send({message:'Error al actualizar el protocolo', err : err});
    }else {
      if (!protocoloEdited) {
        res.status(404).send({message:'No se ha podido actualizar el protocolo'});
      }else {
        res.status(200).send( { protocolo : protocoloEdited, message : 'Se actualizo correctamente el protocolo'} );
      }
    }
  });
}

module.exports = {
  getProtocolos,
  getProtocolo,
  createProtocolo,
  editProtocolo
};

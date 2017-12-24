'use strict'

var Informe = require("../models/informe");
const moment = require('moment')

function getInformes(req, res) {
  Informe.find({}).exec((err, informes) =>{
    if (err) {
      res.status(500).send({message: 'Error en la peticion al servidor', error : err});
    } else {
      res.status(200).send( informes );
    }
  });
}

function getInforme(req, res) {
  var idInforme = req.params.id;

  Informe.findById(idInforme).exec((err, informe) =>{
    if (err) {
      res.status(500).send({message: 'Error en la peticion al servidor', error : err});
    } else {
      if (!informe) {
        res.status(200).send({ message: 'No existe ningun informe con este id'});
      } else {
        res.status(200).send( informe );
      }
    }
  });
}

function createInforme(req, res) {
  var params = req.body;

  var nInforme = new Informe();

  nInforme.nombre = params.nombre;
  nInforme.organos = params.organos;
  nInforme.creado = moment().format('dd-mm-yyyy');


  nInforme.save((err, informeStored) => {
    if (err) {
      res.status(500).send({ message: 'Error en la peticion', error : err });
    } else {
      if (!informeStored) {
        res.status(200).send({ message : 'No se ha guardado el informe'});
      } else {
        res.status(200).send( informeStored );
      }
    }
  });
}

function editInforme(req, res) {
  var idInforme = req.body._id;
  var datosNuevos = req.body;

  Hotel.findByIdAndUpdate(idInforme, datosNuevos,{new : true},(err, informeEdited)=>{
    if (err) {
      res.status(500).send({message:'Error al actualizar el informe', err : err});
    }else {
      if (!informeEdited) {
        res.status(404).send({message:'No se ha podido actualizar el informe'});
      }else {
        res.status(200).send( informeEdited );
      }
    }
  });
}

module.exports = {
  getInformes,
  getInforme,
  createInforme,
  editInforme
};

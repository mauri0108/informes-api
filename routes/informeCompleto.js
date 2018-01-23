'use strict'

var express = require('express');
var informeCompletoController = require('../controllers/informeCompleto');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/informe-completo/crear', informeCompletoController.createInformeCompleto);
api.post('/informe-completo/editar', informeCompletoController.updateInformeCompleto);
api.get('/informe-completo/:id', informeCompletoController.getInformeCompleto);
api.get('/informes-completos/usuario/:id', informeCompletoController.getInformesUsuario);
api.post('/upload/:id', informeCompletoController.uploadImage);

module.exports = api;

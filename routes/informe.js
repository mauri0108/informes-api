'use strict'

var express = require('express');
var informeController = require('../controllers/informe');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/informe', md_auth.ensureAuth ,informeController.createInforme);
api.put('/informe',md_auth.ensureAuth ,informeController.updateInforme);
api.get('/informe/:id', informeController.getInforme);
api.get('/informes/usuario/:id', informeController.getInformesUsuario);
api.post('/upload/:id', informeController.uploadImage);
api.get('/img/:name', informeController.getImage);

module.exports = api;

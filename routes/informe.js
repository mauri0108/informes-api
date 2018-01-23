'use strict'

var express = require('express');
var informeController = require('../controllers/informe');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.get('/informes',informeController.getInformes);
//api.get('/informes',md_auth.ensureAuth,informeController.getInformes);
api.get('/informe/:id', informeController.getInforme);
api.post('/informe/crear', informeController.createInforme);
api.post('/informe/editar', informeController.editInforme);

module.exports = api;

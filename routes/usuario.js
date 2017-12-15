'use strict'

var express = require('express');
var usuarioController = require('../controllers/usuario');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

//api.get('/informes', informeController.getInformes);
//api.get('/informe/:id', informeController.getInforme);
api.post('/registrarse',usuarioController.createUser);
api.post('/login',usuarioController.login);


module.exports = api;

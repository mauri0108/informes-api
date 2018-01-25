'use strict'

var express = require('express');
var protocoloController = require('../controllers/protocolo');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.get('/protocolos', md_auth.ensureAuth ,protocoloController.getProtocolos);
//api.get('/informes',md_auth.ensureAuth,informeController.getInformes);
api.get('/protocolo/:id', protocoloController.getProtocolo);
api.post('/protocolo', protocoloController.createProtocolo);
api.put('/protocolo', protocoloController.editProtocolo);

module.exports = api;

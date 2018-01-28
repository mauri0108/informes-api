'use strict'

var express = require('express');
var protocoloController = require('../controllers/protocolo');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.get('/protocolos', protocoloController.getProtocolos);
api.get('/protocolo/:id', protocoloController.getProtocolo);
api.post('/protocolo', md_auth.ensureAuth ,protocoloController.createProtocolo);
api.put('/protocolo', md_auth.ensureAuth ,protocoloController.editProtocolo);

module.exports = api;

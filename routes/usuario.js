'use strict'

var express = require('express');
var usuarioController = require('../controllers/usuario');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/usuario', md_auth.ensureAuth ,usuarioController.createUser);
api.post('/login',usuarioController.login);
api.get('/usuarios',usuarioController.getUsers);
api.get('/usuario/:id',usuarioController.getUser);
api.put('/usuario', md_auth.ensureAuth ,usuarioController.editUser);


module.exports = api;

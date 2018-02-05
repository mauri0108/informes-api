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
api.post('/usuario/reset-pass',usuarioController.resetPass);
api.post('/usuario/token-change-pass', md_auth.ensureResetPass ,usuarioController.changePassToken);
api.post('/usuario/change-pass', md_auth.ensureAuth ,usuarioController.changePass);


module.exports = api;

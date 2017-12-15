'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//Cargar las rutas
var informe_routes = require('./routes/informe');
var usuario_routes = require('./routes/usuario');

//Middlewares

//Body-parser
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(bodyParser.json());

//Configuracion del *CORS*
app.use((req,res,next)=>{
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Headers','X-API-KEY, Origin, X-Request-With, Content-Type, Accept, Access-Control-Request-Method');
  res.header('Acess-Control-Allow-Methods','GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow','GET, POST, OPTIONS, PUT, DELETE');

  next();
});

//Rutas base
app.use('/api/v1', informe_routes);
app.use('/api/v1', usuario_routes);

module.exports = app;

'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3030;

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/diagnosticos', { useMongoClient: true }, (err,res)=>{
  if (err) {
    throw err;
  }else{
    console.log("La base de datos esta corriendo correctamente...");
    app.listen(port, () => {
        console.log("Servidor del api rest de informes en el puerto "+ port);
    })
  }
});

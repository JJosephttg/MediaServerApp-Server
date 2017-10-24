'use strict';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var debug = require('debug')('MediaAppServer');

var app = express();
//importing my own custom modules (libraries) that I made
var updateCategories = require('./libs/categoryvalidation');
var updateFiles = require('./libs/filevalidation');

//process.argv is the parameters passed in from RunServer.ps1 to allow the server to dynamically change based on where the user wants the files to be located...
if (!endsWith(process.argv[2], "\\")) {
  process.argv[2] = process.argv[2] + "\\";
}
if (!endsWith(process.argv[3], "\\")) {
  process.argv[3] = process.argv[3] + "\\";
}

app.set('port', 8000);
var url = 'mongodb://localhost:27017/MediaServerDB';
var prod = false;

var ipAddr= {
  prod:"mediacloud.com",
  local: "0.0.0.0" //allows the server to just use the ip address on the network, or the computer name (0.0.0.0)
}
//Created an object that contains some different locations
var dirs = {
  mediaDir: process.argv[2].replace("\\", "/"),
  mediaDirBack: process.argv[2].replace("\\\\", "\\"),
  mediaIMGLoc: process.argv[3].replace("\\", "/"),
  mediaIMGLocBack: process.argv[3].replace("\\\\", "\\"),
  root: process.argv[2].split(":")[0] + ":/",
  rootBack: process.argv[2].split(":")[0] + ":\\",
}

//Used for synchronous operation, and passing values from callbacks outside.
var categoryList = [];

//home page logic, and serves the html/json that you see through browser, or the information you may see through client.. routing js files take care of the behind logic...
var home = require('./routes/index');

//Function to initiate the server and use the data base throughout routes
function expressInit(db, files, fileCollection, categoryCollection, categories) {
  //starts server on specified address
  var server = app.listen(app.get('port'), prod == true ? ipAddr.prod : ipAddr.local, function() {
      debug('Server listening on port ' + server.address().port);
  });
  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  // uncomment after placing your favicon in /public
  //app.use(favicon(__dirname + '/public/favicon.ico'));

  //Different URLs that client can go to for different purposes
  //The first argument is the url, and the second argument is the function/route handler that gets called when a user makes the request to the specified url. In this case, I have a class method I call for each
  app.use('/api', home);
  app.use('/api/upload/:category', files.uploadFile.bind(files));
  app.use('/api/download/:file', files.downloadFile.bind(files));
  app.use('/api/categories/', categories.get.bind(categories));
  app.use('/api/fileicons/:iconname/', files.getIcons.bind(files));
  app.use('/api/:category/', files.get.bind(files));



  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
  });

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
      app.use(function (err, req, res, next) {
          res.status(err.status || 500);
          res.render('error', {
              message: err.message,
              error: err
          });
      });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
          message: err.message,
          error: {}
      });
  });
};

//connnects for the first time to the mongo database
console.log('Attempting to connect to database...');
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  else if (!err) console.log('Connection established to database'); console.log('');
  var fileCollection = db.collection('files');
  var categoryCollection = db.collection('categories');
  var filesRoute = require('./routes/files.js')
    , files = new filesRoute(db, fileCollection, categoryCollection, dirs);
  var categoriesRoute = require('./routes/categories.js')
    , categories = new categoriesRoute(db, categoryCollection);
  //Does checks on category and file collection and logs categories that currently exist
  updateCategories.validateCategories(categoryCollection, dirs);
  updateFiles.validateFiles(fileCollection, dirs);
  //passes db variable to routes
  expressInit(db, files, fileCollection, categoryCollection, categories);
});

//function to find if a string ends with a certain character
function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

module.exports = {
  app: app,
  dirs: dirs,
}

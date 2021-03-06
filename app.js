//App.js is the "master script"/controller of everything. The server starts with this script....
'use strict';
//all the libraries that are needed
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

//importing my own custom modules (libraries) that I made
var updateCategories = require('./libs/categoryvalidation');
var updateFiles = require('./libs/filevalidation');

//home page logic, and serves the html/json that you see through browser, or the information you may see through client.. routing js files take care of the behind logic...
var home = require('./routes/index');

var debug = require('debug')('MediaAppServer');
var app = express();

//process.argv is the parameters passed in from RunServer.ps1 to allow the server to dynamically change based on where the user wants the files to be located...
if (!endsWith(process.argv[2], "\\")) {
  process.argv[2] = process.argv[2] + "\\"
}
if (!endsWith(process.argv[3], "\\")) {
  process.argv[3] = process.argv[3] + "\\"
}
//function to find if a string ends with a certain character
function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
//The location of the media which the server will look for..

//Created an object that contains some different locations
var dirs = {
  mediaDir: process.argv[2].replace("\\", "/"),
  mediaDirBack: process.argv[2].replace("\\\\", "\\"),
  mediaIMGLoc: process.argv[3].replace("\\", "/"),
  mediaIMGLocBack: process.argv[3].replace("\\\\", "\\"),
  root: process.argv[2].split(":")[0] + ":/",
  rootBack: process.argv[2].split(":")[0] + ":\\"
}



//set up server
//sets port
app.set('port', 8000);
//fill in here if you are using a different IP address, same for port
var ipAddr = "0.0.0.0";
//allows the server to just use the ip address on the network, or the computer name

//Same for mongodb
var url = 'mongodb://localhost:27017/MediaServerDB';
//mongodb is a database service that allows you to store collections of information/in my case text/json: That is what I use to save, and serve to the client, files

//Used for synchronous operation, and passing values from callbacks outside.
var categoryList = [];

var fileListDB = [];

//Function to initiate the server and use the data base throughout routes
function expressInit(db, files, fileCollection, categoryCollection, categories) {

  //starts server on specified address
  var server = app.listen(app.get('port'), ipAddr, function() {
      debug('API server listening on port ' + server.address().port);
  });

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  // uncomment after placing your favicon in /public
  //app.use(favicon(__dirname + '/public/favicon.ico'));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));


  //Different URLs that client can go to for different purposes
  //The first argument is the url, and the second argument is the function/route handler that gets called when a user makes the request to the specified url. In this case, I have a class method I call for each
  app.use('/', home);
  app.use('/upload/:category', files.uploadFile.bind(files));
  app.use('/download/:file', files.downloadFile.bind(files));
  app.use('/categories/', categories.get.bind(categories));
  app.use('/fileicons/:iconname/', files.getIcons.bind(files));
  app.use('/:category/', files.get.bind(files));



  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
  });

  // error handlers

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
  validateDB(fileCollection, categoryCollection);
  //passes db variable to routes
  expressInit(db, files, fileCollection, categoryCollection, categories);



});

//Process for validating both category DB and file DB
function validateDB(fileCollection, categoryCollection) {
  validateCategories(categoryCollection);
  validateFiles(fileCollection);
};

//function logic for process of validating categories
function validateCategories(categoryCollection, sv) {
  if (!sv) {
    getCategoryDB(categoryCollection);
  } else {
    categoryValidation(categoryCollection, sv);
    categoryList = [];
  }
};

//function logic for process of validating files
function validateFiles(fileCollection, filePathDB) {
  if (!filePathDB) {
    getFileDB(fileCollection);
  } else {
    fileValidation(fileCollection, filePathDB);

  }
}

//Gets the current categories from actual database
function getCategoryDB(categoryCollection) {
  categoryCollection.find({}, {"Category": 1, "_id":0}).toArray(function(err, categories) {
    //console.log('');
    //console.log("Current database categories are:");
    categories = categories.sort();
    for (var i = 0; i < categories.length; i++) {
      //console.log(categories[i].Category);
      categoryList.push(categories[i].Category);
    };
    validateCategories(categoryCollection, categoryList);
  });
};

//Gets current files from database
function getFileDB(fileCollection) {
  fileCollection.find({}, {"name": 1, "_id" : 0, "path": 1, "ext": 1, "category": 1}).toArray(function(err, files) {
    files = files.sort();
    var filePathDB = [];
    for (var i = 0; i < files.length; i++) {
      fileListDB.push({
        name: files[i].name,
        path: files[i].path,
        ext: files[i].ext,
        category: files[i].category
      });
      filePathDB.push(files[i].path);
    }
    validateFiles(fileCollection, fileListDB, filePathDB);
  });
};


//gets categories via actual folders in media location and validates against database
function categoryValidation(categoryCollection, categoriesDB) {
  fs.readdir(dirs.mediaDir, function (err, files) {
    if (err) {
        throw err;
    }
    var verifiedCategories = [];
    //console.log('Actual Categories are:');
    files.map(function (file) {
        return path.join(file);
    }).forEach(function (file) {
        if (path.extname(file) == '') {
          //console.log("%s", file);
          verifiedCategories.push(file);
        }
    });
    //Now to compare to the database...
    //console.log('');
    //console.log("Comparing and making appropriate category changes to database...")

    if (verifiedCategories.sort().length == categoriesDB.sort().length && verifiedCategories.sort().every(function(u, i) {
      return u === categoriesDB.sort()[i];
    })) {
      //console.log('No category changes necessary, database is up to date!');
    } else {
      //console.log('Category database not up to date, making database changes...');
      updateCategories.updateDatabase(verifiedCategories, categoriesDB, categoryCollection);
    }});
  };

//gets files via folders in media location and validates the files to database
function fileValidation(fileCollection, filePathDB) {
  //Find files and fill appropriate items...
  //console.log('Actual Files are:');
  var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
      if (err) return done(err);
      var i = 0;
      (function next() {
        var file = list[i++];
        if (!file) return done(null, results);
        file = path.resolve(dir, file);
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
              walk(file, function(err, res) {
              results = results.concat(res);
              next();
            });
          } else {
            var dirValues = path.parse(file).dir.split(dirs.mediaDirBack);
            var category = dirValues[1];
            if(category) {
              results.push({
                name: path.parse(file).name,
                path: path.parse(file).dir + '\\' + path.parse(file).base,
                ext: path.parse(file).ext,
                category: category
              });
              //console.log(path.parse(file).name);
            }
            next();
          }
        });
      })();
    });
  };
  walk(dirs.mediaDir, function(err, results) {
    if (err) throw err;
    var fileList = results;
    var filePathList = [];
    for(var i = 0; i < results.length; i++) {
      filePathList.push(results[i].path);
    }
    console.log('Validating files, updating file database');
    updateFiles.updateDatabase(fileList, fileListDB, fileCollection, filePathDB, filePathList);

  });
};







//exports the directories and express variable
module.exports = {
  app: app,
  dirs: dirs
}

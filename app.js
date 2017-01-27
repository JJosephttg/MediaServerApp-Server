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

var updateCategories = require('./libs/categoryvalidation');
var updateFiles = require('./libs/filevalidation');

var home = require('./routes/index');
var viewCategory = require('./routes/viewcategory');

var debug = require('debug')('MediaAppServer');
var app = express();



//The location of the media which the server will look for..
var mediaDir = "E:/Media/";
var mediaDirBack = "E:\\Media\\"


//set up server
app.set('port', 3000);
//fill in here if you are using a different IP address, same for port
var ipAddr = "192.168.1.15";

//Same for mongodb
var url = 'mongodb://localhost:27017/MediaServerDB';

//Used for synchronous operation, and passing values from callbacks outside.
var categoryList = [];

var fileListDB = [];

console.log('Attempting to connect to database...');
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  else if (!err) console.log('Connection established to database');
  var fileCollection = db.collection('files');
  var categoryCollection = db.collection('categories');

  //Does checks on category and file collection and logs categories that currently exist
  validateDB(db, fileCollection, categoryCollection);


});
//Process for validating both category DB and file DB
function validateDB(db, fileCollection, categoryCollection) {
  validateCategories(db, categoryCollection);
  validateFiles(db, fileCollection);
};

//function logic for process of validating categories
function validateCategories(db, categoryCollection, sv) {
  if (!sv) {
    getCategoryDB(db, categoryCollection);
  } else {
    categoryValidation(db, categoryCollection, sv);
    //console.log('');
    categoryList = [];
  }
};

//function logic for process of validating files
function validateFiles(db, fileCollection, filePathDB) {
  console.log('');
  if (!filePathDB) {
    getFileDB(db, fileCollection);
  } else {
    fileValidation(db, fileCollection, filePathDB);

  }
}

//Gets the current categories from actual database
function getCategoryDB(db, categoryCollection) {
  categoryCollection.find({}, {"Category": 1, "_id":0}).toArray(function(err, categories) {
    //console.log('');
    //console.log("Current database categories are:");
    categories = categories.sort();
    for (var i = 0; i < categories.length; i++) {
      //console.log(categories[i].Category);
      categoryList.push(categories[i].Category);
    };
    validateCategories(db, categoryCollection, categoryList);
  });
};

//Gets current files from database
function getFileDB(db, fileCollection) {
  fileCollection.find({}, {"name": 1, "_id" : 0, "path": 1, "ext": 1, "category": 1}).toArray(function(err, files) {
    console.log("Current files are:");
    files = files.sort();
    var filePathDB = [];
    for (var i = 0; i < files.length; i++) {
      console.log("%s at %s", files[i].name, files[i].path);
      fileListDB.push({
        name: files[i].name,
        path: files[i].path,
        ext: files[i].ext,
        category: files[i].category
      });
      filePathDB.push(files[i].path);
    }
    validateFiles(db, fileCollection, fileListDB, filePathDB);
  });
};


//gets categories via actual folders in media location and validates against database
function categoryValidation(db, categoryCollection, categoriesDB) {
  fs.readdir(mediaDir, function (err, files) {
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
      updateCategories.updateDatabase(verifiedCategories, categoriesDB, db, categoryCollection);
    }});
  };

//gets files via folders in media location and validates the files to database
function fileValidation(db, fileCollection, filePathDB) {
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
            var dirValues = path.parse(file).dir.split(mediaDirBack);
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
  walk(mediaDir, function(err, results) {
    if (err) throw err;
    var fileList = results;
    var filePathList = [];
    for(var i = 0; i < results.length; i++) {
      filePathList.push(results[i].path);
    }
    function sorting(List) {
      var isSame = List.sort(function(a, b) {
        var nameA = a.name.toLowerCase(); // ignore upper and lowercase
        var nameB = b.name.toLowerCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        // names must be equal
        return 0;
      });
    }
    var fileListSorted = sorting(fileList);
    var fileListDBSorted = sorting(fileListDB);

    if(fileList.length == fileListDB.length ) {
      console.log('All up to date');
    } else {
      console.log('Not up to date, updating file database');
      updateFiles.updateDatabase(fileList, fileListDB, db, fileCollection, filePathDB, filePathList);
    }
  });
};




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

app.use('/', home);
app.use('/category/', viewCategory);


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

module.exports = app;

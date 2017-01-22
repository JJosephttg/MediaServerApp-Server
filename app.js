'use strict';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var home = require('./routes/index');
var viewCategory = require('./routes/viewcategory');

var debug = require('debug')('MediaAppServer');
var app = express();



//The location of the media which the server will look for..
var mediaDir = "E:/Media/";


//set up server
app.set('port', 3000);
//fill in here if you are using a different IP address, same for port
var ipAddr = "192.168.1.15";

//Same for mongodb
var url = 'mongodb://localhost:27017/MediaServerDB';

//Used for synchronous operation
var categoryList = [];
var categoryLength;

console.log('Attempting to connect to database...');
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  else if (!err) console.log('Connection established to database');
  var fileCollection = db.collection('files');
  var categoryCollection = db.collection('categories');

  //Does checks on category and file collection and logs categories that currently exist
  validateDB(db, fileCollection, categoryCollection);


});

function validateDB(db, fileCollection, categoryCollection) {
  validateCategories(db, categoryCollection);
};

function validateCategories(db, categoryCollection, sv) {
  if (!sv) {
    getCategoryDB(db, categoryCollection, sv);
  } else {
    categoryValidation(db, categoryCollection, sv);
    console.log(sv);
    categoryList = [];
    categoryLength = null;
    return sv;
  }
};

function getCategoryDB(db, categoryCollection, sv) {
  categoryCollection.find({}, {"Category": 1, "_id":0}).toArray(function(err, categories) {
    console.log('');
    console.log("Current categories are:");
    categoryLength = categories.length;
    for (var i = 0; i < categories.length; i++) {
      console.log(categories[i].Category);
      categoryList.push(categories[i].Category);
    };
    sv = categoryList;
    validateCategories(db, categoryCollection, sv)
  });
};

function categoryValidation(db, categoryCollection, categoriesDB) {

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

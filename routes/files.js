'use strict';
var express = require('express');
var router = express.Router();
var database = require('./mongodb');


router.get('/', function (req, res) {

  var body = 'hi';
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(body));
  res.send();
});


router.post('/:category/:fileName', function(req, res) {
  var category = req.params.category.toLowerCase();
  var fileName = req.params.fileName;
  res.setHeader('Content-Type', 'application/json');
  var body = {
      category: category,
      file: fileName
  }
  res.send(JSON.stringify(body));
});


module.exports = router;

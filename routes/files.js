var fs = require('fs');

var files = function(db, fileCollection, categoryCollection, dirs) {
  this.db = db;
  this.fileCollection = fileCollection;
  this.categoryCollection = categoryCollection;
  this.dirs = dirs;
};


files.prototype.get = function(req, res) {
  var db = this.db;
  var fileCollection = this.fileCollection;
  var categoryCollection = this.categoryCollection;
  if (req.params.category == 'all') {
    fileCollection.find({}, {'_id': 0}).toArray(function(err, result) {
      if (err) {throw err}
      else {
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify(result));
        res.send();
      }
    });
  } else {
    categoryCollection.find({}, {'_id': 0}).toArray(function(err, result) {
      if (err) {throw err};
      var isCategory;
      var counter = 0;
      for (var i = 0; i < result.length; i++) {
        counter = counter + 1;
        if (req.params.category == result[i].Category) {
          isCategory = true;
          fileCollection.find({'category': req.params.category}, {'_id': 0}).toArray(function(err, result) {
              res.setHeader('Content-Type', 'application/json');
              res.write(JSON.stringify(result));
              res.send();
          });
        }
        if (isCategory != true && counter == result.length) {
          res.status(404);
          res.end();
        }
      }
    });
  }
}

files.prototype.getIcons = function(req, res) {
  var dirs = this.dirs;
  var filePath = dirs.mediaIMGLoc + req.params.iconname + '.bmp';

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404);
    res.end();
  }

}


module.exports = files;

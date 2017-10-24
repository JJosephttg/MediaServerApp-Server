//Used to manage routes related to reading or modifying files

//imports library fs, and url
var fs = require('fs');
var url = require('url');

//prototype created that has some attributes (you can consider prototypes as classes)
var files = function(db, fileCollection, categoryCollection, dirs) {
  this.db = db;
  this.fileCollection = fileCollection;
  this.categoryCollection = categoryCollection;
  this.dirs = dirs;
};

//Get request for retreiving files from database based on the category... If the category is all, it will send a response with all the files from all categories
files.prototype.get = function(req, res) {
  var db = this.db;
  var fileCollection = this.fileCollection;
  var categoryCollection = this.categoryCollection;
  if (req.params.category.toLowerCase() == 'all') {
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

//Used to get the icons associated with files... This has to be a separate request as you cannot have 2 different content types in a response....
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

//Used to serve the files to client. When the download button is clicked client side, the server gets a request with the file name, category, and extension within the url... it can then find the file and respond
//with it....

//format: <category>|<Filename>.<ext>
files.prototype.downloadFile = function(req, res) {
  var dirs = this.dirs;
  var path = req.params.file.replaceAll('\\|', '/');
  var pathDiv = path.split('/');
  fileName = pathDiv[pathDiv.length-1]

  path = dirs.mediaDir + path;
  if (fs.existsSync(path)) {
    res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
    res.download(path, fileName);
    res.end();
  } else {
    res.status(401);
    res.end();
  }
}

files.prototype.uploadFile = function(req, res) {
  var dirs = this.dirs;
  console.log(req.files);
  fs.readFile(req.files, function (err, data) {
    if (err) {
      res.status(404);
    } else {
      var newPath = dirs.MediaDir; //+ req.category + "/";
      fs.writeFile(newPath, data, function (err) {
        if (err) {
          res.status(404);
        } else {
          res.status(200);
        }
      });
    }
  });
}

//Algorithm that can be used to replace all instances of a character, rather than just replacing a single instance...
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
//exports the class/prototype
module.exports = files;

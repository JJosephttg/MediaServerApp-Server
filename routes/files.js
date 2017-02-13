var files = function(db, fileCollection, categoryCollection) {
  this.db = db;
  this.fileCollection = fileCollection;
  this.categoryCollection = categoryCollection;
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
  }
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


module.exports = files;

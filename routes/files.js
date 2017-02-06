var files = function(db, fileCollection, categoryCollection) {
  this.db = db;
  this.fileCollection = fileCollection;
  this.categoryCollection = categoryCollection;
};


files.prototype.get = function(req, res) {
  var db = this.db;
  var fileCollection = this.fileCollection;
  var categoryCollection = this.categoryCollection;
  fileCollection.find({}, {'_id': 0}).toArray(function(err, result) {
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(result));
    res.send();
  });


}


module.exports = files;

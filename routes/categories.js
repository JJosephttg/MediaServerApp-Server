var categories = function(db, categoryCollection) {
  this.db = db;
  this.categoryCollection = categoryCollection;
};


categories.prototype.get = function(req, res) {
  var db = this.db;
  var categoryCollection = this.categoryCollection;
  categoryCollection.find({}, {'_id': 0}).toArray(function(err, result) {
    if (err) {throw err};
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(result));
    res.send();
  });
}


module.exports = categories;

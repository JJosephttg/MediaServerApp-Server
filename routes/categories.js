//Routes for category related requests... (for example: http://****/categories)

//Prototype that is created to allow routes to have access to the database and collections. In this case, the database (db) is used to query all the categories within the category collection
var categories = function(db, categoryCollection) {
  this.db = db;
  this.categoryCollection = categoryCollection;
};

//This is called when the route /categories is called, which just returns a list of categories that is found in the mongo database category collection
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

//exports the prototype
module.exports = categories;

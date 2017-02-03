var database = function(db) {
  this.db = db;
};

function getFiles(fileCollection, category) {

};


database.prototype.get = function(req, res) {
  var db = this.db;
  res.setHeader('Content-Type', 'application/json');
  res.write('hi');
  res.send();

}


module.exports = database;

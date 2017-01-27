function compareDB(a, b){
 var not_in_a=new Array;
 var j=0;
 for(var i=0; i<=a.length-1;i++){
  if(b.indexOf(a[i])==-1){
    not_in_a[j]=a[i];
    j++;
  }
 }
 if (not_in_a != "") {};
 return not_in_a
};

function categoriesAdded(verifiedCategories, categoriesDB) {
  var toAdd = compareDB(verifiedCategories, categoriesDB);
  return toAdd;
};

function categoriesRemoved(verifiedCategories, categoriesDB) {
  var toRemove = compareDB(categoriesDB, verifiedCategories);
  return toRemove;
};

function addtoDB(categories, db, categoryCollection) {
  for(var i = 0; i < categories.length; i++) {
    var obj = {
      Category: categories[i]
    }
    categoryCollection.insert(obj);
  }
};

function removefromDB(categories, db, categoryCollection) {
  for(var i = 0; i < categories.length; i++) {
    //IN THE FUTURE FOR MORE THAN ONE FIELD, JUST PASS IT THROUGH TO THIS FIELD OTHER THAN CATEGORY!
    categoryCollection.remove({ "Category" : categories[i] });
  }
};

function updateDatabase(verifiedCategories, categoriesDB, db, categoryCollection) {
  var removedCategories = categoriesRemoved(verifiedCategories, categoriesDB);
  var addedCategories = categoriesAdded(verifiedCategories, categoriesDB);
  addtoDB(addedCategories, db, categoryCollection);
  removefromDB(removedCategories, db, categoryCollection);
  //console.log("Category database up to date");
};

exports.updateDatabase = updateDatabase;

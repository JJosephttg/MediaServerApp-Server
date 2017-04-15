//function that takes one list and finds all categories in the other list that aren't in the first list
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

//Calls the function that finds missing categories and returns the list of categories that have been added.
function categoriesAdded(verifiedCategories, categoriesDB) {
  var toAdd = compareDB(verifiedCategories, categoriesDB);
  return toAdd;
};
//Does the same as above, but for finding removed categories
function categoriesRemoved(verifiedCategories, categoriesDB) {
  var toRemove = compareDB(categoriesDB, verifiedCategories);
  return toRemove;
};
//Function to add categories from above calculations to the database
function addtoDB(categories, categoryCollection) {
  for(var i = 0; i < categories.length; i++) {
    var obj = {
      Category: categories[i]
    }
    categoryCollection.insert(obj);
  }
};
//same for removed
function removefromDB(categories, categoryCollection) {
  for(var i = 0; i < categories.length; i++) {
    //IN THE FUTURE FOR MORE THAN ONE FIELD, JUST PASS IT THROUGH TO THIS FIELD OTHER THAN CATEGORY!
    categoryCollection.remove({ "Category" : categories[i] });
  }
};
//updates the database by removing categories that were physically removed, and adds to database the ones that were added
function updateDatabase(verifiedCategories, categoriesDB, categoryCollection) {
  var removedCategories = categoriesRemoved(verifiedCategories, categoriesDB);
  var addedCategories = categoriesAdded(verifiedCategories, categoriesDB);
  addtoDB(addedCategories, categoryCollection);
  removefromDB(removedCategories, categoryCollection);
  //console.log("Category database up to date");
};
//exports the main function ^ that handles updating the database.
exports.updateDatabase = updateDatabase;

//Things to figure out... Can't go through all the categories... I have to manually find all
//of the removed, and added categories (including rename (just add and remove operation))

//Var would be called removedCategories (lists all categories to mark for removal which means you have
//to make a function for each of the variables to find them)

//var for adding would be addedCategories

//something to think about... You could also (categories only) just replace the server DB with verified,
//categories.. (actually I take that back, maybe files (only on bootup))...
function compareDB(a, b){
 var not_in_a=new Array;
 var j=0;
 for(var i=0; i<=a.length-1;i++){
  if(b.indexOf(a[i])==-1){
    not_in_a[j]=a[i];
    j++;
  }
 }
 if (not_in_a != "") {console.log(not_in_a)};
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

//function addtoDB(categories, db, categoryCollection) {
//    for(var i = 1; i <= categories.length; i++) {
//      categoryCollection.findOne().toArray();
//    }
//};

//function removefromDB(removedCategories, db, categoryCollection) {

//};

function updateDatabase(verifiedCategories, categoriesDB, db, categoryCollection) {
  var removedCategories = categoriesRemoved(verifiedCategories, categoriesDB);
  var addedCategories = categoriesAdded(verifiedCategories, categoriesDB);
  //addtoDB(addedCategories, db, categoryCollection);
  //removefromDB(removedCategories, db, categoryCollection);
};

exports.updateDatabase = updateDatabase;

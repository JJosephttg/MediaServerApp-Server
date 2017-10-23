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

//function logic for process of validating categories
function validateCategories(categoryCollection, sv) {
  if (!sv) {
    getCategoryDB(categoryCollection);
  } else {
    categoryValidation(categoryCollection, sv);
    categoryList = [];
  }
};

//Gets the current categories from actual database
function getCategoryDB(categoryCollection) {
  categoryCollection.find({}, {"Category": 1, "_id":0}).toArray(function(err, categories) {
    //console.log('');
    //console.log("Current database categories are:");
    categories = categories.sort();
    for (var i = 0; i < categories.length; i++) {
      //console.log(categories[i].Category);
      categoryList.push(categories[i].Category);
    };
    validateCategories(categoryCollection, categoryList);
  });
};

//gets categories via actual folders in media location and validates against database
function categoryValidation(categoryCollection, categoriesDB) {
  fs.readdir(dirs.mediaDir, function (err, files) {
    if (err) {
        throw err;
    }
    var verifiedCategories = [];
    //console.log('Actual Categories are:');
    files.map(function (file) {
        return path.join(file);
    }).forEach(function (file) {
        if (path.extname(file) == '') {
          //console.log("%s", file);
          verifiedCategories.push(file);
        }
    });
    //Now to compare to the database...
    if (verifiedCategories.sort().length == categoriesDB.sort().length && verifiedCategories.sort().every(function(u, i) {
      return u === categoriesDB.sort()[i];
    })) {
      //console.log('No category changes necessary, database is up to date!');
    } else {
      //console.log('Category database not up to date, making database changes...');
      updateDatabase(verifiedCategories, categoriesDB, categoryCollection);
    }});
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
exports.validateCategories = validateCategories;

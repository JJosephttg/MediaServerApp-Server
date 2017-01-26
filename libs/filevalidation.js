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

function filesAdded(verifiedFiles, filesDB) {
  var toAdd = compareDB(verifiedFiles, FilesDB);
  return toAdd;
};

function filesRemoved(verifiedFiles, filesDB) {
  var toRemove = compareDB(filesDB, verifiedFiles);
  return toRemove;
};

function addtoDB(files, filepaths, db, fileCollection) {
  for(var i = 0; i < files.length; i++) {
    var obj = {
      Filename: files[i],
      Filepath: filepaths[i],
      Description: ''
    }
    fileCollection.insert(obj);
  }
};

function removefromDB(files, filepaths, db, fileCollection) {
  for(var i = 0; i < files.length; i++) {
    //IN THE FUTURE FOR MORE THAN ONE FIELD, JUST PASS IT THROUGH TO THIS FIELD OTHER THAN filename!
    fileCollection.remove({ "Filename" : files[i], "Path" : filespath[i] });
  }
};

function updateDatabase(verifiedFiles, filesDB, db, fileCollection) {
  var removedFiles = filesRemoved(verifiedFiles, filesDB);
  var addedFiles = filesAdded(verifiedFiles, filesDB);
  addtoDB(addedFiles, db, fileCollection);
  removefromDB(removedFiles, filepaths db, fileCollection);
  console.log("File database up to date");
};

exports.updateFDatabase = updateDatabase;

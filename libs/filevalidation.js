var _ = require('underscore');


function compareDB(a, b){
  //for files added: a = fileList being compared to b = filesDB
  //for files removed: a = filesDB being compared to b = fileList
  var c = _.pluck(b, 'path');
  //console.log(c);
  var not_in_a=new Array;
  var j=0;
  //Checks to see if database or files are empty...
  if(!a && !b) {return;}
  else if(!a) {return;}
  else if(!b) {return;}
  else {
    for(var i=0; i<=a.length-1;i++){
      if(c.indexOf(a[i].path)==-1){
        not_in_a[j]=a[i];
        j++;
      }
    }
    if (not_in_a != "") {};
    return not_in_a
  }
};

function filesAdded(fileList, filesDB, fileCollection) {
  var compare = compareDB(fileList, filesDB);
  return compare;
};

function filesRemoved(fileList, filesDB, fileCollection) {
  var compare = compareDB(filesDB, fileList);
  return compare;
};

function addtoDB(files, fileCollection) {
  for(var i = 0; i < files.length; i++) {
    var obj = {
      name: files[i].name,
      path: files[i].path,
      ext: files[i].ext,
      category: files[i].category,
    }
    fileCollection.insert(obj);
  }
};

function removefromDB(files, fileCollection) {
  for(var i = 0; i < files.length; i++) {
    fileCollection.remove({"path" : files[i].path });
  }
};

function updateDatabase(fileList, filesDB, fileCollection) {
  var removedFiles = filesRemoved(fileList, filesDB, fileCollection);
  var addedFiles = filesAdded(fileList, filesDB, fileCollection);
  if (fileList == '' && filesDB != '') {
    //delete all from collection
    fileCollection.remove({});
    console.log('No actual files exist, deleted file database');
  } else if (filesDB == '' && fileList != '') {
    //just add the files to database
    addtoDB(addedFiles, fileCollection);
    console.log("File database up to date");
  } else if (fileList != '' && filesDB != '') {
    //add and remove files
    if(removedFiles != '') {
      removefromDB(removedFiles, fileCollection);
    }
    if(addedFiles != '') {
      addtoDB(addedFiles, fileCollection);
    }
    if(addedFiles != '' && removedFiles != '') {
      console.log('File Database: Changes were made...');
    } else {
      console.log('File Database: No changes necessary..')
    }
  }
};

exports.updateDatabase = updateDatabase;

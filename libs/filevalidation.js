//rewrite modules
var _ = require('underscore');
var fs = require('fs');
var extractor = require('icon-extractor');

//Does same comparison as categories, however, there are some differences between categories and files...
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
    return not_in_a;
  }
};

//same as categories
function filesAdded(fileList, filesDB, fileCollection) {
  var compare = compareDB(fileList, filesDB);
  return compare;
};

//same as above but opposite way
function filesRemoved(fileList, filesDB, fileCollection) {
  var compare = compareDB(filesDB, fileList);
  return compare;
};

//Adds to file collection the files that need to be added to database
function addtoDB(files, fileCollection) {
  for(var i = 0; i < files.length; i++) {
    var obj = {
      name: files[i].name,
      path: files[i].path,
      ext: files[i].ext,
      category: files[i].category,
      imgLoc: files[i].imgLoc
    }
    fileCollection.insert(obj);
  }
};

//Same as above, but removing files
function removefromDB(files, fileCollection) {
  for(var i = 0; i < files.length; i++) {
    fileCollection.remove({"path" : files[i].path });
    var dirs = require('../app').dirs;
    var imgPath = dirs.mediaIMGLocBack + files[i].category + '-' + files[i].name + files[i].ext + '.bmp';
    fs.unlinkSync(imgPath);
  }
};

//Gets the thumbnail location and gives the signal to a powershell script that a file has been added and or removed and the powershell script deletes the removed file's icons, and retrieves the icon from added file..
function getThumbnail(fileCollection, addedFiles) {
  for(var i = 0; i < addedFiles.length; i++) {
    var item = xml.ele('file');
    console.log(addedFiles[i].name);
    item.att('name', addedFiles[i].name);
    item.att('category', addedFiles[i].category);
    item.att('path', addedFiles[i].path);
    item.att('ext', addedFiles[i].ext);
  }
  //needs to return this as json object array
//  name= $fileList.root.file[$i].name
  //category=$fileList.root.file[$i].category
  //path=$fileList.root.file[$i].path
  //ext=$fileList.root.file[$i].ext
  //imgLoc=$fileList.root.file[$i].imgLoc

  return fileIconList;

};

//function logic for process of validating files
function validateFiles(fileCollection, filePathDB) {
  if (!filePathDB) {
    getFileDB(fileCollection);
  } else {
    fileValidation(fileCollection, filePathDB);

  }
}

//Gets current files from database
function getFileDB(fileCollection) {
  fileCollection.find({}, {"name": 1, "_id" : 0, "path": 1, "ext": 1, "category": 1}).toArray(function(err, files) {
    files = files.sort();
    var filePathDB = [];
    for (var i = 0; i < files.length; i++) {
      fileListDB.push({
        name: files[i].name,
        path: files[i].path,
        ext: files[i].ext,
        category: files[i].category
      });
      filePathDB.push(files[i].path);
    }
    validateFiles(fileCollection, fileListDB, filePathDB);
  });
};

//gets files via folders in media location and validates the files to database
function fileValidation(fileCollection, filePathDB) {
  //Find files and fill appropriate items...
  //console.log('Actual Files are:');
  var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
      if (err) return done(err);
      var i = 0;
      (function next() {
        var file = list[i++];
        if (!file) return done(null, results);
        file = path.resolve(dir, file);
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
              walk(file, function(err, res) {
              results = results.concat(res);
              next();
            });
          } else {
            var dirValues = path.parse(file).dir.split(dirs.mediaDirBack);
            var category = dirValues[1];
            if(category) {
              results.push({
                name: path.parse(file).name,
                path: path.parse(file).dir + '\\' + path.parse(file).base,
                ext: path.parse(file).ext,
                category: category
              });
              //console.log(path.parse(file).name);
            }
            next();
          }
        });
      })();
    });
  };
  walk(dirs.mediaDir, function(err, results) {
    if (err) throw err;
    var fileList = results;
    var filePathList = [];
    for(var i = 0; i < results.length; i++) {
      filePathList.push(results[i].path);
    }
    console.log('Validating files, updating file database');
    updateDatabase(fileList, fileListDB, fileCollection, filePathDB, filePathList);

  });
};

//updates the database through the functions that add and remove files that it detects that weren't there before.. (This is the main function)
function updateDatabase(fileList, filesDB, fileCollection) {
  var dirs = require('../app').dirs;
  var removedFiles = filesRemoved(fileList, filesDB, fileCollection);
  var addedFiles = filesAdded(fileList, filesDB, fileCollection);
  if (fileList == '' && filesDB != '') {
    //delete all from collection
    fileCollection.remove({});
    fs.mkdirSync(dirs.rootBack + "delete");
    console.log('No actual files exist, deleted file database');
  } else if (filesDB == '' && fileList != '') {
    //just add the files to database

    addedFiles = getThumbnail(fileCollection, addedFiles);
    addtoDB(addedFiles, fileCollection);

  } else if (fileList != '' && filesDB != '') {
    //add and remove files
    if(removedFiles != '') {
      removefromDB(removedFiles, fileCollection);
    }
    if(addedFiles != '') {
      addedFiles = getThumbnail(fileCollection, addedFiles);
      addtoDB(addedFiles, fileCollection);
    }
    if(addedFiles != '' | removedFiles != '') {
      console.log('File Database: Changes were made...');
    } else {
      console.log('File Database: No changes necessary..')
    }
  }
  else if (fileList == '' && filesDB == '') {
    console.log('File Database: No changes necessary..');
  }
  console.log("File database up to date")
};

exports.validateFiles = validateFiles;

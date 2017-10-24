var _ = require('underscore');
var fs = require('fs');
var extractor = require('icon-extractor');
var path = require('path');

//function logic for process of validating files
function validateFiles(fileCollection, dirs, fileListDB) {
  if (!fileListDB) {
    getFileDB(fileCollection, dirs);
  } else {
    fileValidation(fileCollection, dirs, fileListDB);
  }
}


//Gets current files from database
function getFileDB(fileCollection, dirs) {
  fileCollection.find({}, {"name": 1, "_id" : 0, "path": 1, "ext": 1, "category": 1}).toArray(function(err, files) {
    files = files.sort();
    var fileListDB = [];
    for (var i = 0; i < files.length; i++) {
      fileListDB.push({
        name: files[i].name,
        path: files[i].path,
        ext: files[i].ext,
        category: files[i].category
      });
    }
    validateFiles(fileCollection, dirs, fileListDB);
  });
};

//gets files via folders in media location and validates the files to database
function fileValidation(fileCollection, dirs, fileListDB) {
  //Find files and fill appropriate items...
  console.log('Actual Files are:');
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
            results.push({
              name: path.parse(file).name,
              path: path.parse(file).dir + '\\' + path.parse(file).base,
              ext: path.parse(file).ext,
              category: category
            });
            console.log(path.parse(file).name);
            next();
          }
        });
      })();
    });
  };
  walk(dirs.mediaDirBack, function(err, results) {
    if (err) throw err;
    var fileList = results;
    console.log('Validating files, updating file database');
    updateDatabase(fileList, fileListDB, fileCollection, dirs);
  });
};

function fileDBDiff(a, b){
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

//Gets the thumbnail location and stores the icon from added file..
function getThumbnail(fileCollection, addedFiles, dirs) {
  var fileIconList = [];
  for(var i = 0; i < addedFiles.length; i++) {
    var imgPath = dirs.mediaIMGLocBack + addedFiles[i].category + '-' + addedFiles[i].name + addedFiles[i].ext + '.bmp';
    fileIconList.push({
      name: addedFiles[i].name,
      category: addedFiles[i].category,
      path: addedFiles[i].path,
      ext: addedFiles[i].ext,
      imgLoc: imgPath,
    });

    extractor.getIcon(imgPath, addedFiles[i].path);
  }
  return fileIconList;
};

extractor.emitter.on('icon', function(data) {
  fs.writeFileSync(data.Context, data.Base64ImageData, 'base64', function(err) {
    console.log(err);
  });
});

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
function removefromDB(files, fileCollection, dirs) {
  for(var i = 0; i < files.length; i++) {
    fileCollection.remove({"path" : files[i].path });
    var imgPath = dirs.mediaIMGLocBack + files[i].category + '-' + files[i].name + files[i].ext + '.bmp';
    try{fs.unlinkSync(imgPath);} catch(err) {
    }
  }
};

//updates the database through the functions that add and remove files that it detects that weren't there before.. (This is the main function)
function updateDatabase(fileList, filesDB, fileCollection, dirs) {
  var removedFiles = fileDBDiff(filesDB, fileList);
  var addedFiles = fileDBDiff(fileList, filesDB);
  if (fileList == '' && filesDB != '') {
    //delete all from collection
    fileCollection.remove({});
    console.log('No actual files exist, deleted file database');
  } else if (filesDB == '' && fileList != '') {
    //just add the files to database
    addedFiles = getThumbnail(fileCollection, addedFiles, dirs);
    console.log(addedFiles);
    addtoDB(addedFiles, fileCollection);

  } else if (fileList != '' && filesDB != '') {
    //add and remove files
    if(removedFiles != '') {
      removefromDB(removedFiles, fileCollection, dirs);
    }
    if(addedFiles != '') {
      addedFiles = getThumbnail(fileCollection, addedFiles, dirs);
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

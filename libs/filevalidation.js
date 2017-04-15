var _ = require('underscore');
var fs = require('fs');
var builder = require('xmlbuilder');

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
    return not_in_a
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
  var xml = builder.create('root');
  for(var i = 0; i < addedFiles.length; i++) {
    var item = xml.ele('file');
    console.log(addedFiles[i].name);
    item.att('name', addedFiles[i].name);
    item.att('category', addedFiles[i].category);
    item.att('path', addedFiles[i].path);
    item.att('ext', addedFiles[i].ext);
  }
  fs.writeFileSync('./scripts/info/NodeFileList.xml', xml);
  while(!fs.existsSync('./scripts/info/AddedFiles.json')) {
  }

  while(fs.existsSync('./scripts/info/AddedFiles.json')) {
    try {
      var fileIconList = JSON.parse(fs.readFileSync('./scripts/info/AddedFiles.json'));
      break;
    } catch (err) {console.log(err);}
  }
  fs.unlinkSync('./scripts/info/AddedFiles.json');

  return fileIconList;

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

exports.updateDatabase = updateDatabase;

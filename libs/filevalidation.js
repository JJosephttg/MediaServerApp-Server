var _ = require('underscore');
var fs = require('fs');
var builder = require('xmlbuilder');

var a = [{"name":"myfile1","path":"E:\\Media\\files\\myfile1.pdf","ext":".pdf","category":"files"},{"name":"myfile23","path":"E:\\Media\\files\\myfile23.txt","ext":".txt","category":"files"},{"name":"New Compressed (zipped) Folder","path":"E:\\Media\\files\\New Compressed (zipped) Folder.zip","ext":".zip","category":"files"},{"name":"New Rich Text Document","path":"E:\\Media\\files\\New Rich Text Document.rtf","ext":".rtf","category":"files"},{"name":"New Text Document","path":"E:\\Media\\files\\New Text Document.txt","ext":".txt","category":"files"},{"name":"New Text Document (2)","path":"E:\\Media\\movies\\New Text Document (2).txt","ext":".txt","category":"movies"},{"name":"New Text Document (3)","path":"E:\\Media\\movies\\New Text Document (3).txt","ext":".txt","category":"movies"}]


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
      imgString: files[i].imgString
    }
    fileCollection.insert(obj);
  }
};

function removefromDB(files, fileCollection) {
  for(var i = 0; i < files.length; i++) {
    fileCollection.remove({"path" : files[i].path });
  }
};

function convertIMGtoBase64(fileCollection, addedFiles, sv) {
  if (!sv) {
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
    while(!fs.existsSync('./scripts/info/IconFileList.xml')) {
    }
    var sv = true;
    convertIMGtoBase64(fileCollection, addedFiles, sv);
  } else if (sv == true) {
    var fileIconList = fs.readFileSync('./scripts/info/IconFileList.xml');


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
    addedFiles = convertIMGtoBase64(fileCollection, addedFiles);
    addtoDB(addedFiles, fileCollection);
    console.log("File database up to date");
  } else if (fileList != '' && filesDB != '') {
    //add and remove files
    if(removedFiles != '') {
      removefromDB(removedFiles, fileCollection);
    }
    if(addedFiles != '') {
      var imgString = convertIMGtoBase64(fileCollection, addedFiles);
      addtoDB(addedFiles, fileCollection, imgString);
    }
    if(addedFiles != '' | removedFiles != '') {
      console.log('File Database: Changes were made...');
    } else {
      console.log('File Database: No changes necessary..')
    }
  }
};

exports.updateDatabase = updateDatabase;

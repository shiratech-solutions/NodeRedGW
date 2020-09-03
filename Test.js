


const path = require('path');
const fs = require('fs');

var iCOMOXParser = require('./iCOMOXParser.js');
var parser = new iCOMOXParser();
	
//Convers files from input folder to output folder	
var convertFile = function(fileName, fileExt, print, save){
	var obj;
	
	if (fileExt == "json") 
		obj = parser.binaryMsgGet(require("./Input/" + fileName + "." + fileExt));	//Conversion of object to binary Example	
	else if(fileExt == "bin")
		obj = parser.objectGet(fs.readFileSync("Input/" + fileName + "." + fileExt, null));//Conversion of binary to object  Example
	else 
		return false;
	
	
	if (obj == null)
		return false;
	
	if (print)
		console.log(obj);	
	
	if (save != true)
		return true;
	
	//Write to file
	if (fileExt == "json")
		fs.writeFileSync("Output/" + fileName + ".bin", obj);	
	else
		fs.writeFileSync("Output/" + fileName + ".json" , JSON.stringify(obj));	
	
	return true;
}


//Searches /Input folder for .bin/.json to convert
var convertInputFolder = function(print, save){
	fs.readdir(path.join(__dirname, 'Input'), function (err, files) {
		if (err) {
			return console.log('Unable to scan \\Input folder: ' + err);
		} 
		
		files.forEach(function (file) {
			
			//Convert files
			var fileName = file.split('.');
			var fileExt=fileName[fileName.length-1];
			var fileName = fileName[0];
			
			if (convertFile(fileName, fileExt, print, save) == false)
				console.log("Could not parse file:" + file);
			else
				console.log("Parsed:" + file);

		});
	});
}


console.log("Test Start");
//Convert all file in the /Input folder
convertInputFolder(true,true);
console.log("Test End");


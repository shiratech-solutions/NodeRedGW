/*
Example code: This file contains examples of using the iCOMOX parser,
it parses all the example files (.bin and .json) in the Input folder and saves the data to the output folder
*/


const path = require('path');
const fs = require('fs');

var iCOMOXParser = require('../lib/iCOMOXParser.js');
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
	
	console.log("\n\nConverting files:\n");
	//fs.readdir(path.join(__dirname, 'Input'), function (err, files) {
	var files = fs.readdirSync(path.join(__dirname, 'Input'));
	if (!files)
		return console.log('Unable to scan \\Input folder: ' + err);
		 
		
	files.forEach(function (file) {
		
		//Convert files
		var fileName = file.split('.');
		var fileExt=fileName[fileName.length-1];
		var fileName = fileName[0];
		
		console.log("\n\nParsing:" + file);
		if (convertFile(fileName, fileExt, print, save) == false)
			console.log("Error: Could not parse file:" + file);
		
			

	});
	//});
}

var testExamples = function(){
	var obj;
	
	console.log("\n\nTest examples:");
	
	//Requests
	obj = parser.binaryMsgGet({"Type":"Hello"});	//Conversion of object to binary Example	
	console.log(obj);
	
	obj = parser.binaryMsgGet({"Type":"SetConfig", "Data":{"Enable":true,"Temp":true,"ACC1":true,"ACC2":false,"MAG":true,"MIC":false,"Interval":5, "Repetition":0}});	//Conversion of object to binary Example	
	console.log(obj);
	
	obj = parser.binaryMsgGet({"Type":"GetConfig"});	//Conversion of object to binary Example	
	console.log(obj);
		
	obj = parser.binaryMsgGet({"Type":"Reset", "Data":{"ResetType":"HW"}});	//Conversion of object to binary Example	
	console.log(obj);
	
	//Responses
	obj = parser.objectGet(Buffer.from([0x03, 0x00]));//Conversion of binary to object  Example (SetConfig response)
	console.log(obj);
	obj = parser.objectGet(Buffer.from([0x03, 0x01]));//Conversion of binary to object  Example (SetConfig response)
	console.log(obj);
	
	obj = parser.objectGet(Buffer.from([0x01]));//Conversion of binary to object  Example (Reset response)
	console.log(obj);
	
	console.log("\n\n");
}


console.log("Test Start, parser version:" + parser.VERSION);

//Convert all file in the /Input folder
convertInputFolder(true,true);

//Test examples
testExamples();


console.log("Test End");


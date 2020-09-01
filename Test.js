


console.log("Start");

var fs = require('fs');
var iCoMoXParser = require('./iCoMoXParser.js');



var testRun = function(){
	var parser = new iCoMoXParser();
	var obj;
	
	
	//Hello Message
	obj = (parser.binaryDataSet(fs.readFileSync("Messages/Hello.bin", null))).objectGet();
	console.log("Hello message:" + JSON.stringify(obj));

	//Report messages
	obj = (parser.binaryDataSet(fs.readFileSync("Messages/Report_ACC1_AXL362.bin", null))).objectGet();
	console.log("Report - ACC1:" + JSON.stringify(obj));
	
	obj = (parser.binaryDataSet(fs.readFileSync("Messages/Report_ACC2_AXL356.bin", null))).objectGet();
	console.log("Report - ACC12" + JSON.stringify(obj));

	obj = (parser.binaryDataSet(fs.readFileSync("Messages/Report_MAG_BMM150.bin", null))).objectGet();
	console.log("Report - Manetometer:" + JSON.stringify(obj));

	obj = (parser.binaryDataSet(fs.readFileSync("Messages/Report_Temp_ADT7410_1.bin", null))).objectGet();
	console.log("Report - Temperature:" + JSON.stringify(obj));

	obj = (parser.binaryDataSet(fs.readFileSync("Messages/Report_Temp_ADT7410_2.bin", null))).objectGet();
	console.log("Report - Temperature" + JSON.stringify(obj));

	obj = (parser.binaryDataSet(fs.readFileSync("Messages/Report_MIC_IM69D130.bin", null))).objectGet();
	console.log("Report - Microphone:" + JSON.stringify(obj));

}

console.log("Test Start");
testRun();
console.log("Test End");


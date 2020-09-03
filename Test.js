


console.log("Start");

var fs = require('fs');
var iCOMOXParser = require('./iCOMOXParser.js');
var parser = new iCOMOXParser();
	


var testBinToObjRun = function(){
	var obj;
	
	console.log("parser:");
	console.log(parser);
	console.log(JSON.stringify(parser));
	
	//Hello Message
	obj = parser.objectGet(fs.readFileSync("Messages/Hello.bin", null));
	console.log("Hello message:" + JSON.stringify(obj));

	//Report messages
	obj = parser.objectGet(fs.readFileSync("Messages/Report_ACC1_AXL362.bin", null));
	console.log("Report - ACC1:" + JSON.stringify(obj));
	
	obj = parser.objectGet(fs.readFileSync("Messages/Report_ACC2_AXL356.bin", null));
	console.log("Report - ACC12" + JSON.stringify(obj));

	obj = parser.objectGet(fs.readFileSync("Messages/Report_MAG_BMM150.bin", null));
	console.log("Report - Manetometer:" + JSON.stringify(obj));

	obj = parser.objectGet(fs.readFileSync("Messages/Report_Temp_ADT7410_1.bin", null));
	console.log("Report - Temperature:" + JSON.stringify(obj));

	obj = parser.objectGet(fs.readFileSync("Messages/Report_Temp_ADT7410_2.bin", null));
	console.log("Report - Temperature" + JSON.stringify(obj));

	obj = parser.objectGet(fs.readFileSync("Messages/Report_MIC_IM69D130.bin", null));
	console.log("Report - Microphone:" + JSON.stringify(obj));

}

var testObjToBinRun = function(){
	console.log(parser.binaryMsgGet("SetConfig", {"enable":true,"Temp":true,"ACC1":true,"ACC2":false,"MAG":true,"MIC":false,"Interval":5}));
	console.log(parser.binaryMsgGet("SetConfig", {"enable":false}));
	
	//Write a binary file example
	//fs.writeFileSync("SetConfig_enable.bin", parser.binaryMsgGet("SetConfig", {"enable":true,"Temp":true,"ACC1":true,"ACC2":false,"MAG":true,"MIC":false,"Interval":5}));
	
}
console.log("Test Start");
testBinToObjRun();
testObjToBinRun();

console.log("Test End");


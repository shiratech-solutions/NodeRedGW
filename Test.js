


console.log("Start");

var fs = require('fs');
var iCoMoXParser = require('./iCoMoXParser.js');



var test;

test = new iCoMoXParser(fs.readFileSync("Messages/Report_ACC1_AXL362.bin", null));
console.log("Object:" + JSON.stringify(test.objectGet()));

test = new iCoMoXParser(fs.readFileSync("Messages/Report_ACC2_AXL356.bin", null));
console.log("Object:" + JSON.stringify(test.objectGet()));

test = new iCoMoXParser(fs.readFileSync("Messages/Report_MAG_BMM150.bin", null));
console.log("Object:" + JSON.stringify(test.objectGet()));

test = new iCoMoXParser(fs.readFileSync("Messages/Report_Temp_ADT7410_1.bin", null));
console.log("Object:" + JSON.stringify(test.objectGet()));

test = new iCoMoXParser(fs.readFileSync("Messages/Report_Temp_ADT7410_2.bin", null));
console.log("Object:" + JSON.stringify(test.objectGet()));

test = new iCoMoXParser(fs.readFileSync("Messages/Report_MIC_IM69D130.bin", null));
console.log("Object:" + JSON.stringify(test.objectGet()));


console.log("End");
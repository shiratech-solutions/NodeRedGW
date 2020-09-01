module.exports = function iCoMoXParser(binaryData) {
	const VERSION = "0.0.2";
	
	const BOARD_TYPE = ["SMIP","NB_IOT","POE"];
	const FW_BRANCH = ["Kit","Suitcase"];
	
	const MESSAGE_TYPE = {
	  HELLO:0x00,
	  REPORT:0xFF
	  
	};

	const REPORT_TYPE = {
		ACCELEROMETER_1:0, 	//AXL362
		ACCELEROMETER_2:1, 	//ADXL362
		MAGNETOMETER:2,		//BMM150	
		TEMP:3,				//ADT7410
		MIC:4,			//IM69D130
		//ACCELEROMETER_3:5,	//ADXL1002
	};
	
	//Binary data set
	this.binaryDataSet = function(binaryData) {	
		if (Buffer.isBuffer(binaryData) == false){
			console.log("Error:Not a buffer");
			this.binaryData = null;
			return null;
		}	
		this.binaryData = binaryData;
		return this;		
	}
	this.messageTypeGet = function() {
		switch (this.binaryData[0]){
			//Report
			case MESSAGE_TYPE.REPORT:
				break;
			case MESSAGE_TYPE.HELLO:
				break;
			default:
				return null;
		}
		return this.binaryData[0];
	}
	
	//Hello message
	this.twoDigStr =  function(num){
		return ('0' + (num).toString(10)).slice(-2);
	}
	this.toHexStr =  function(num){
		return ('0' + (num).toString(16)).slice(-2);
	}
	
	this.helloMessageGet = function() {
		if (this.messageTypeGet()!=MESSAGE_TYPE.HELLO)
			return null;
		console.log("1");
		var res = {};
		if (this.binaryData[1] >= BOARD_TYPE.length)
			return null;
		console.log("2");
		if (this.binaryData[23] >= FW_BRANCH.length)
			return null;
		console.log("3");
		res["BoardType"] = BOARD_TYPE[this.binaryData[1]];
		res["Board ver"] = this.binaryData[2] + "." + this.binaryData[3];
		res["MCU Serial"]="";
		for (var i=0; i< 16; i++)
			res["MCU Serial"]+= this.toHexStr(this.binaryData[4+i]);   
		res["FW ver"] = this.binaryData[20] + "." + this.binaryData[21] + "." + this.binaryData[22] + FW_BRANCH[this.binaryData[23]];
		res["FW build"] = 	this.binaryData[27] + "."  + this.binaryData[26] + "." + this.binaryData.readInt16LE(24)  +   " " + this.binaryData[28] + ":" + this.twoDigStr(this.binaryData[29]) + ":" + this.twoDigStr(this.binaryData[30]);
		res["BIT status"] = "0x" + this.toHexStr(this.binaryData[31]);
		res["Part num"] = this.binaryData.slice(32,32+32).toString().replace(/\0[\s\S]*$/g,'');
		res["Serial"] = this.binaryData.slice(64,64+32).toString().replace(/\0[\s\S]*$/g,'');
		res["Name"] = this.binaryData.slice(96,96+32).toString().replace(/\0[\s\S]*$/g,'');
		
		return res;
	}
	//Reports
	this.reportTypeGet = function() {
		if (this.isReportMessage()==false)
			return null;
		return this.binaryData[1];
	}
	this.isReportMessage = function() {		
		return (this.messageTypeGet()==MESSAGE_TYPE.REPORT);
	}
	this.timestampGet = function() {
		if ((this.binaryData.length < 10) && (this.isReportMessage()==true))
			return null;		
		
		return new Date((Number(this.binaryData.readBigInt64LE(2) ) /32768) * 1000);
		
	}
	
	
	//Reports - Accelerometer 1	
	this.accelerometer1Get = function() {
		if  (this.reportTypeGet()!=REPORT_TYPE.ACCELEROMETER_1)
			return null;
		
		//Number of samples per axis
		var len = 	(this.binaryData.length - 10) / (3*2);	
		var res = {X:new Float32Array(len),Y:new Float32Array(len),Z:new Float32Array(len)};
		
		 
		for (var i=0; i < len; i++){
			res.X[i] = this.binaryData.readInt16LE(10 + i*6) / 1024;
			res.Y[i] = this.binaryData.readInt16LE(12 + i*6) / 1024;
			res.Z[i] = this.binaryData.readInt16LE(14 + i*6) / 1024;
		}
		
		return res;		
	}
	
	
	//Reports - Accelerometer 2	
	this.accelerometer2Get = function() {
		if  (this.reportTypeGet()!=REPORT_TYPE.ACCELEROMETER_2)
			return null;
		
		//Total number of samples
		var len = 	Math.floor(2 * (this.binaryData.length - 10) / 3);	
		var tempArr = [new Float32Array(len / 3),new Float32Array(len / 3),new Float32Array(len / 3)];
		
		var payloadIndex = 10;
		for (var i=0; i < len ; i = i+2){
			//Get Raw data
			tempArr[i  % 3][Math.floor(i / 3)] = ((this.binaryData[payloadIndex + 1] & 0x0F) << 8) | this.binaryData[payloadIndex];          
			tempArr[(i + 1) % 3][ Math.floor((i+1) / 3)] =  (this.binaryData[payloadIndex + 2] << 4) | (this.binaryData[payloadIndex + 1] >> 4 )
			payloadIndex = payloadIndex + 3;
		}
		
		//Convert to a/g		
		for (var j=0; j < tempArr.length ; j++){
			for (var i=0; i < tempArr[0].length ; i++){
				tempArr[j][i] = (tempArr[j][i] - 2048) * 1.8  / (4096 * 0.08) ;			
			}
		}
		
		return {X:tempArr[0], Y:tempArr[1], Z:tempArr[2]};
	}
	
	//Reports - Magnetometer
	this.magnetometerGet = function() {
		if  (this.reportTypeGet()!=REPORT_TYPE.MAGNETOMETER)
			return null;
		
		var len = 	Math.floor( (this.binaryData.length - 10) / 2);			
		var tempArr = [new Int32Array(len / 3),new Int32Array(len / 3),new Int32Array(len / 3)];
		
		for (var i=0; i < len  ; i++){
			tempArr[i  % 3][Math.floor(i / 3)] = 1000* this.binaryData.readInt16LE(10 + i*2) / 16;						
		}
		
		return {X:tempArr[0], Y:tempArr[1], Z:tempArr[2]};
		
		
	}
	
	
	//Reports - Temperature
	this.temperatureGet = function() {
		if  (this.reportTypeGet()!=REPORT_TYPE.TEMP)
			return null;
		return this.binaryData.readInt16LE(10)/128;
	}
	
	
	//Reports - MIC
	this.micGet = function() {
		if  (this.reportTypeGet()!=REPORT_TYPE.MIC)
			return null;
		
		var len = 	Math.floor( (this.binaryData.length - 10) / 2);			
		var res =  new Float32Array(len);
		
		for (var i=0; i < len  ; i++){
			res[i] = this.binaryData.readInt16LE(10 + i*2) * Math.pow(10, (130/20))/32768;						
		}
		
		return res;
	}
	
  
	
	
	
	//Get parsed object
	this.objectGet = function() {
		var res = {};
		
		//Parse only message type
		if (this.messageTypeGet() == null)
			return null;
		
		switch (this.messageTypeGet()){
			case MESSAGE_TYPE.REPORT:
				res.type = "Report";
				res.timestamp = this.timestampGet();
				switch (this.reportTypeGet()){
					case REPORT_TYPE.ACCELEROMETER_1:
						res.reportType = "ACC1";
						res[res.reportType] = this.accelerometer1Get();						
						break;
					case REPORT_TYPE.ACCELEROMETER_2:
						res.reportType = "ACC2";
						res[res.reportType] = this.accelerometer2Get();
						break;
					case REPORT_TYPE.MAGNETOMETER:
						res.reportType = "MAG";
						res[res.reportType] = this.magnetometerGet();
						break;
					case REPORT_TYPE.TEMP:
						res.reportType = "Temp";
						res[res.reportType] = this.temperatureGet();
						break;
					case REPORT_TYPE.MIC:
						res.reportType = "MIC";
						res[res.reportType] = this.micGet();
						break;
					default:
						return null;
				}
				break;
			case MESSAGE_TYPE.HELLO:				
				res = this.helloMessageGet();
				if (res == null)
					return null;
				res.type = "Hello";				
			break;			
			default:
				return null;
		}
		return res;
	}
	
	//Set data
	if (binaryData != undefined)
		this.binaryDataSet(binaryData);
	
};

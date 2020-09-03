var parser = function iCOMOXParser(binaryData) {
	const VERSION = "0.0.2";
	
	const BOARD_TYPE = ["SMIP","NB_IOT","POE"];
	const FW_BRANCH = ["Kit","Suitcase"];
	
	

	//Utility functions
	var twoDigStr =  function(num){
		return ('0' + (num).toString(10)).slice(-2);
	}
	var toHexStr =  function(num){
		return ('0' + (num).toString(16)).slice(-2);
	}
	
	//Message parsers - Hello
	var helloMessageObjGet = function(binaryData) {
		var res = {};
		if (binaryData[1] >= BOARD_TYPE.length)
			return null;
		if (binaryData[23] >= FW_BRANCH.length)
			return null;
		res["BoardType"] = BOARD_TYPE[binaryData[1]];
		res["BoardVer"] = binaryData[2] + "." + binaryData[3];
		res["MCUSerial"]="";
		for (var i=0; i< 16; i++)
			res["MCUSerial"]+= toHexStr(binaryData[4+i]);   
		res["FwVer"] = binaryData[20] + "." + binaryData[21] + "." + binaryData[22] + FW_BRANCH[binaryData[23]];
		res["FwBuild"] = 	binaryData[27] + "."  + binaryData[26] + "." + binaryData.readInt16LE(24)  +   " " + binaryData[28] + ":" + twoDigStr(binaryData[29]) + ":" + twoDigStr(binaryData[30]);
		res["BitStatus"] = "0x" + toHexStr(binaryData[31]);
		res["PartNum"] = binaryData.slice(32,32+32).toString().replace(/\0[\s\S]*$/g,'');
		res["Serial"] = binaryData.slice(64,64+32).toString().replace(/\0[\s\S]*$/g,'');
		res["Name"] = binaryData.slice(96,96+32).toString().replace(/\0[\s\S]*$/g,'');
		
		return res;
	}
	
	//Message parsers - Reports
	var timestampGet = function(binaryData) {
		if ((binaryData.length < 10) && (this.isReportMessage()==true))
			return null;		
		
		return new Date((Number(binaryData.readBigInt64LE(2) ) /32768) * 1000);
		
	}
	var reportMessageObjGet = function(binaryData) {
		var res = {};
		
		if (binaryData[1] >= REPORT_TYPE.length)
			return null;
		res.reportType = REPORT_TYPE[binaryData[1]].name;
		res[res.reportType] = REPORT_TYPE[binaryData[1]].func(binaryData);
		if (res[res.reportType] == null)
			return null;
		res.timestamp = timestampGet(binaryData);
		
		return res;
	}
	
	
	
	
	
	//Reports - Accelerometer 1	
	var accelerometer1ObjGet = function(binaryData) {
		//Number of samples per axis
		var len = 	(binaryData.length - 10) / (3*2);	
		var res = {X:new Float32Array(len),Y:new Float32Array(len),Z:new Float32Array(len)};
		
		 
		for (var i=0; i < len; i++){
			res.X[i] = binaryData.readInt16LE(10 + i*6) / 1024;
			res.Y[i] = binaryData.readInt16LE(12 + i*6) / 1024;
			res.Z[i] = binaryData.readInt16LE(14 + i*6) / 1024;
		}
		
		return res;		
	}
	
	
	//Reports - Accelerometer 2	
	var accelerometer2ObjGet = function(binaryData) {
		//Total number of samples
		var len = 	Math.floor(2 * (binaryData.length - 10) / 3);	
		var tempArr = [new Float32Array(len / 3),new Float32Array(len / 3),new Float32Array(len / 3)];
		
		var payloadIndex = 10;
		for (var i=0; i < len ; i = i+2){
			//Get Raw data
			tempArr[i  % 3][Math.floor(i / 3)] = ((binaryData[payloadIndex + 1] & 0x0F) << 8) | binaryData[payloadIndex];          
			tempArr[(i + 1) % 3][ Math.floor((i+1) / 3)] =  (binaryData[payloadIndex + 2] << 4) | (binaryData[payloadIndex + 1] >> 4 )
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
	var magnetometerObjGet = function(binaryData) {
		var len = 	Math.floor( (binaryData.length - 10) / 2);			
		var tempArr = [new Int32Array(len / 3),new Int32Array(len / 3),new Int32Array(len / 3)];
		
		for (var i=0; i < len  ; i++){
			tempArr[i  % 3][Math.floor(i / 3)] = 1000* binaryData.readInt16LE(10 + i*2) / 16;						
		}
		
		return {X:tempArr[0], Y:tempArr[1], Z:tempArr[2]};
	}
	
	
	//Reports - Temperature
	var temperatureObjGet = function(binaryData) {
		return binaryData.readInt16LE(10)/128;
	}	
	
	//Reports - MIC
	var micObjGet = function(binaryData) {
		var len = 	Math.floor( (binaryData.length - 10) / 2);			
		var res =  new Float32Array(len);
		
		for (var i=0; i < len  ; i++){
			res[i] = binaryData.readInt16LE(10 + i*2) * Math.pow(10, (130/20))/32768;						
		}
		
		return res;
	}
	
	
	//To binary - Example obj = {"enable":false,"Temp":false,"ACC1":false,"ACC2":false,"MAG":false,"MIC":false,"Interval":5}
	var setConfigBinGet = function(obj) {
		if (!obj)
			return null;
		var res = new Buffer.alloc(24);
		res[1] = 0x4 | 0x2; //Bitmask - Set activation period and common
		res[2] = 0x1; //Raw data
		res[3] = 0x40 | 0x1;//Common (Aux channel) and transmit on
		res.writeUInt16LE(obj["Interval"] != undefined?obj["Interval"]:1, 12); //Interval in minutes
		res[14] = 0; //Transmit repitition (1+Value)		
		res[15] = (obj["enable"] == true)?0x1:0;//Active modules - Raw data
		
		res[16] = 0;//(obj["enable"] == true)?0x1F:0; //Active Sensors - enable/disable		
		for (var i=0; i<REPORT_TYPE.length;i++){
			if (obj[REPORT_TYPE[i].name] == true){
				res[16] |= (1 << i);
			}
		}
		
		
		return res;
	}
	
	
	
	//Parsing map
	const MESSAGE_TYPE = {
	  HELLO:	 {code:0x00, name:"Hello",  	toObjFunc:helloMessageObjGet },
	  RESET:	 {code:0x01, name:"Reset",  	/*toObjFunc:helloMessageGet*/ },
	  GET_CONFIG:{code:0x02, name:"GetConfig",  /*toObjFunc:helloMessageGet*/ },
	  SET_CONFIG:{code:0x03, name:"SetConfig",  /*toObjFunc:helloMessageGet,*/ toBinFunc:setConfigBinGet },
	  REPORT:	 {code:0xFF, name:"Report",  	toObjFunc:reportMessageObjGet}
	  
	};

	const REPORT_TYPE = [
		{name:"ACC1", 	func:accelerometer1ObjGet} ,	//AXL362
		{name:"ACC2", 	func:accelerometer2ObjGet} , 	//ADXL362
		{name:"MAG", 	func:magnetometerObjGet} ,	//BMM150	
		{name:"Temp", 	func:temperatureObjGet} ,		//ADT7410
		{name:"MIC", 	func:micObjGet} ,				//IM69D130
	];
	
	
	//Get parsed object
	this.objectGet = function(binaryData) {
		var res;
		
		if ((Buffer.isBuffer(binaryData) == false) || (binaryData.length < 1))
			return null;
		var msgType;
		switch (binaryData[0]){ //Message type
			case MESSAGE_TYPE.REPORT.code:
				msgType = MESSAGE_TYPE.REPORT;
				break;
			case MESSAGE_TYPE.HELLO.code:
				msgType = MESSAGE_TYPE.HELLO;
				break;
			default:
				return null;
		}
		
		res = msgType.toObjFunc(binaryData);
		if (res == null)
			return null;
		res["type"] = msgType.name;
		return res;		
	}
	
	//Get parsed object
	this.binaryMsgGet = function(obj) {
		var msgType;
		console.log(obj);
		if ((!obj) || (!obj.type))
			return null;
		
		switch (obj.type){
			case MESSAGE_TYPE.SET_CONFIG.name:
				msgType = MESSAGE_TYPE.SET_CONFIG;				
				break;
			default:
				return null;		
		}
		res = msgType.toBinFunc(obj.data);		
		if (res == null)
			return null;
		res[0] = msgType.code;
		return res;		
	}	
	
};


module.exports = parser;
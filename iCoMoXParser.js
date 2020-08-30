const VERSION = "0.0.1";

const MESSAGE_TYPE = {
  REPORT:0xFF
  
};

const REPORT_TYPE = {
	ACCELEROMETER_1:0, 	//AXL362
	ACCELEROMETER_2:1, 	//ADXL362
	MAGNOMETER:2,		//BMM150	
	TEMP:3,				//ADT7410
	MIC:4,			//IM69D130
	//ACCELEROMETER_3:5,	//ADXL1002
};


module.exports = function iCoMoXParser(binaryData) {
	if (Buffer.isBuffer(binaryData) == false){
		console.log("Not a buffer");
		return null;
	}
	//Binary data
	this.binaryData = binaryData;
	
	
	this.messageTypeGet = function() {
		switch (binaryData[0]){
			//Report
			case MESSAGE_TYPE.REPORT:
				break;
			default:
				return null;
		}
		return this.binaryData[0];
	}
	this.reportTypeGet = function() {
		return this.binaryData[1];
	}
	
	//Reports
	this.isReportMessage = function() {
		return (this.messageTypeGet()==MESSAGE_TYPE.REPORT);
	}
	this.timestampGet = function() {
		if ((binaryData.length < 10) && (this.isReportMessage()==true))
			return null;		
		//return this.binaryData.readBigInt64LE(2);
		return new Date((Number(this.binaryData.readBigInt64LE(2) ) /32768) * 1000);
		
	}
	
	
	//Reports - Accelerometer 1	
	this.accelerometer1Get = function() {
		if ((this.isReportMessage()==false) || (this.reportTypeGet()!=REPORT_TYPE.ACCELEROMETER_1))
			return null;
		
		//Number of samples per axis
		var len = 	(binaryData.length - 10) / (3*2);	
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
		if ((this.isReportMessage()==false) || (this.reportTypeGet()!=REPORT_TYPE.ACCELEROMETER_2))
			return null;
		
		//Total number of samples
		var len = 	Math.floor(2 * (binaryData.length - 10) / 3);	
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
		if ((this.isReportMessage()==false) || (this.reportTypeGet()!=REPORT_TYPE.MAGNOMETER))
			return null;
		
		var len = 	Math.floor( (binaryData.length - 10) / 2);			
		var tempArr = [new Int32Array(len / 3),new Int32Array(len / 3),new Int32Array(len / 3)];
		
		for (var i=0; i < len  ; i++){
			tempArr[i  % 3][Math.floor(i / 3)] = 1000* this.binaryData.readInt16LE(10 + i*2) / 16;						
		}
		
		return {X:tempArr[0], Y:tempArr[1], Z:tempArr[2]};
		
		
	}
	
	
	//Reports - Temperature
	this.temperatureGet = function() {
		if ((this.isReportMessage()==false) || (this.reportTypeGet()!=REPORT_TYPE.TEMP))
			return null;		
		return this.binaryData.readInt16LE(10)/128;
	}
	
	
	//Reports - MIC
	this.micGet = function() {
		if ((this.isReportMessage()==false) || (this.reportTypeGet()!=REPORT_TYPE.MIC))
			return null;		
		
		var len = 	Math.floor( (binaryData.length - 10) / 2);			
		var res =  new Float32Array(len);
		
		for (var i=0; i < len  ; i++){
			res[i] = this.binaryData.readInt16LE(10 + i*2) * Math.pow(10, (130/20))/32768;						
		}
		
		return res;
	}
	
  
	//Parse only message type
	if (this.messageTypeGet() == null)
		return null;
	
	
	//Get parsed object
	this.objectGet = function() {
		var res = {};
		
		switch (this.messageTypeGet()){
			case MESSAGE_TYPE.REPORT:
				res.type = "Report";
				res.timestamp = this.timestampGet();
				switch (this.reportTypeGet()){
					case REPORT_TYPE.ACCELEROMETER_1:
						res.reportType = "ACC1";
						res.data = this.accelerometer1Get();						
						break;
					case REPORT_TYPE.ACCELEROMETER_2:
						res.reportType = "ACC2";
						res.data = this.accelerometer2Get();
						break;
					case REPORT_TYPE.MAGNOMETER:
						res.reportType = "MAG";
						res.data = this.magnetometerGet();
						break;
					case REPORT_TYPE.TEMP:
						res.reportType = "Temp";
						res.data = this.temperatureGet();
						break;
					case REPORT_TYPE.MIC:
						res.reportType = "MIC";
						res.data = this.micGet();
						break;
					default:
						return null;
				}
				break;
			default:
				return null;
		}
		return res;
	}
};

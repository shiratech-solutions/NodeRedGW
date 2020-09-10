var iCOMOXParser = require('./lib/iCOMOXParser.js');
var parser = new iCOMOXParser();

if (!parser)
	console.log("iCOMOX Parser init error");
else
	console.log("iCOMOX Parser init");

module.exports = function(RED) {
    function iCOMOXParserNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
			if (Buffer.isBuffer(msg.payload) == true){
				msg.payload = parser.objectGet(msg.payload);//Conversion of binary to object
				
				//Get device id from topic
				if ((msg.topic) && (!msg.DeviceID)){
					var tempTopic = msg.topic.split('/');
					if ((tempTopic.length ==3) && (tempTopic[0]=="iCOMOX") && (tempTopic[2] == "IN"))
						msg.DeviceID = tempTopic[1];
				}
			}
			else{
				msg.payload = parser.binaryMsgGet(msg.payload);	//Conversion of object to binary
				//Set topic from DeviceID
				if ((!msg.topic) && (msg.DeviceID)){
					msg.topic = "iCOMOX/" + msg.DeviceID + "/OUT";
					delete msg.DeviceID;
				}
			}
			
			if (msg.payload == null)
				return null;
			
			node.send(msg);
        });
    }
    RED.nodes.registerType("iCOMOX Parser",iCOMOXParserNode);
}
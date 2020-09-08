This project contains a javascript parser for the binary data sent/received from the iCOMOX.
The parser node registers an instance of the parser in the global context as "iCOMOX",
See comments on how to use in iCOMOXParser.js file/iCOMOXParser.json



Prerequisites:
1 - NPM installed
2 - NodeJS installed (Tested on v12.18.3)
3 - Mosquitto broker (More information in the iCOMOX user manual)
4 - iCOMOX with FW version 2.8.3 and up (To send data)
5 - Node Red installed (To install using npm: npm install -g --unsafe-perm node-red )
6 - For IoT Central exmaple, Install:
	IoT Central bridge: 	npm install node-red-contrib-azure-iotc-bridge
	Azure IoT central node: npm install node-red-contrib-azure-iot-central
	
To run node-red:
1 - Run from command line: node-red
2 - Connect using browser: http://127.0.0.1:1880/


To test mosquitto:
1 - run mosquitto server: from windows services or command line: mosquitto
2 - subscribe to a topic: mosquitto_sub.exe -v -t 'test/topic'
3 - publish topic: mosquitto_pub -t 'test/topic' -m 'helloWorld'

*Note: Make sure the mosquitto app is not blocked by a firewall


Package contents:
- Flows folder :
	iCoMoXIoTCentralFlow.json - Entire IoT Central flow, requires configuration of nodes with credentials.		
	iCOMOXParser.json - The iCOMOX parser node

- Input folder:
	.bin files - binary messages examples (iCOMOX -> Cloud)
	.json files - JSON messages examples (Cloud -> iCOMOX)

- Output folder:
	.json files - Parsed binary messages  (iCOMOX -> Cloud)
	.bin files - Parsed binary messages examples (Cloud -> iCOMOX)

- Batch folder : 
	Development batch files used to send sample data (From Input/Output folders) to the MQTT broker
	
- iCOMOXParser.js - The parser javascript code
- Test.js - Code to test the parser code, parses all file in /Input folder to /Output folder
- Test.bat - Runs Test.js



To use the flow example:
Import iCoMoXIoTCentralFlow.json to your NodeRed project.

Azure IoT Central node - fill in ScopeID, Device ID and Primary Key.
	This node receives commands from the Cloud, converts to binary format and sends to a specific iCOMOX with the device ID.
azure-iotc-bridge node - fill in ID Scope and SAS Token (Aplication token)
	This node receives binary data from the iCOMOX and sends to the cloud, 
	the control route sends back a configuration message to the iCOMOX when a "Hello" message is received.




Parser Version 0.0.3:
- Supports Hello/Reset/SetConfig/GetConfig/Report messages
- Currently Anomaly detection is not supported

This project contains a NodeRed node for parsing the iCOMOX binary data sent/received from the iCOMOX.

If you require a standalone javascript file,  use parser in lib/iCOMOXParser.js (Instrcutions in file comments and Test.js file)


Prerequisites:
1 - NPM installed
2 - NodeJS installed (Tested on v12.18.3)
3 - Mosquitto broker (More information in the iCOMOX user manual)
	*Note: Make sure the mosquitto app is not blocked by a firewall
4 - iCOMOX with FW version 2.8.3 and up (To send data)
5 - Node Red installed (To install using npm: npm install -g --unsafe-perm node-red )


To run node-red:
1 - Run from command line: node-red
2 - Connect using browser: http://127.0.0.1:1880/



Installing the iCOMOX-Parser node
1 - Install node to .node-red folder
	In Windows: C:%HOMEPATH%\.node-red  (Can run install.bat file)
	In Linux: ~/.node-red  
2 - Restart node-red - You should see the node added under the "Shiratech" category
3 - To use - simply connect the node to an incoming iCOMOX binary message or outgoing JSON message, see Examples folder.



Examples:

iCOMOX simple Example:
1 - Import Examples/iCOMOX_Example.json
The Example shows all different JSON inputs to the parser and outputs from the iCOMOX


IoT Central Example:
1 - Install IoT Central bridge: 	npm install node-red-contrib-azure-iotc-bridge
2 - Install Azure IoT central node: npm install node-red-contrib-azure-iot-central
3 - Import Examples/iCOMOX_IoT_Central.json
4 - In Azure IoT central node - fill in ScopeID, Device ID and Primary Key.
5 - In IoT Central bridge -  fill in ID Scope and SAS Token (Application token)
The example sends reports information to IoT Central and receives commands for one device.

Note: A device with the correct JSON format should be created in the IoT central cloud.
	

Mindsphere Example:
1 - install Mindconnect node : npm install @mindconnect/node-red-contrib-mindconnect
2 - Import Examples/iCOMOX_Mindsphere.json
3 - In Mindconnect node - fill in Shared secret field.
4 - Update the conversion table according to your DataPointID
Note: A device with the correct JSON format should be created in the Mindsphere cloud.



To test mosquitto:
1 - run mosquitto server: from windows services or command line: mosquitto
2 - subscribe to a topic: mosquitto_sub.exe -v -t 'test/topic'
3 - publish topic: mosquitto_pub -t 'test/topic' -m 'helloWorld'


Version 0.0.5
- Fixed Acc conversion formula

Version 0.0.4:
- Set config bug fix


Version 0.0.3:
- Supports Hello/Reset/SetConfig/GetConfig/Report messages
- Currently Anomaly detection is not supported



Install:
1 - Node
2 - Mosquitto broker
3 - Node-Red : npm install -g --unsafe-perm node-red


To run node-red:
1 - Install using npm: npm install -g --unsafe-perm node-red
2 - Run from command line: node-red
3 - Connect using browser: http://127.0.0.1:1880/

Install IoTCentral: npm install node-red-contrib-azure-iot-central


To test mosquitto:
run mosquitto server: from windows services or command line: mosquitto
subscribe to a topic: mosquitto_sub.exe -v -t 'test/topic'
publish topic: mosquitto_pub -t 'test/topic' -m 'helloWorld'

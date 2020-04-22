'use strict';
require('dotenv').config();
var connectionString = process.env.deviceConnectionString;
var Protocol = require('azure-iot-device-mqtt').MqttWs;
var DeviceClient = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;

var internval = 2000; //milliseconds
var client = DeviceClient.fromConnectionString(connectionString, Protocol);
console.log('Realtime Simulated PLC Started: ');
var index = 0;
setInterval(function () {
    var msg = {
        timestamp: new Date().toString(),
        value: (Math.random() > 0.5 ? 1.0 : -1.0) * Math.round(Math.random() * 100)
    };
    var message = new Message(JSON.stringify(msg));
    console.log('Sending message: ' + message.getData());
    client.sendEvent(message, function (err) {
        if (err) {
            console.error('send error: ' + err.toString());
        } else {
            console.log('message sent');
        }
    });
    index++;
}, internval);

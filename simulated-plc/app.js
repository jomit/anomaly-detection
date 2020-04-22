'use strict';
require('dotenv').config();
var connectionString = process.env.deviceConnectionString;
//var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Protocol = require('azure-iot-device-mqtt').MqttWs;
var DeviceClient = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;
const fs = require('fs');
const parse = require("csv-parse/lib/sync");

let CSV_FILE = './data/alldata.csv';
let points = [];
let skiprow = true;
function readFile() {
    let input = fs.readFileSync(CSV_FILE).toString();
    let parsed = parse(input, { skip_empty_lines: true });
    parsed.forEach(function (e) {
        if (!skiprow) {
            points.push({ timestamp: new Date(e[0]), value: parseFloat(e[1]) });
            //console.log("Date => " + Date(e[0]) + " , Value => " + parseFloat(e[1]))
        }
        skiprow = !skiprow
    });
}

readFile();
//points = points.slice(0,8640);

var internval = 5000; //milliseconds
var client = DeviceClient.fromConnectionString(connectionString, Protocol);
console.log('Simulated PLC Started: ');
var index = 0;
setInterval(function () {
    var msgArray = [];
    for(var i = index; i<(index+30); i++){  //need minimum 12 data points for stream anomaly detection but sending 30 for now
        msgArray.push({
            timestamp: points[i].timestamp,
            value: points[i].value
        });
    }
    var message = new Message(JSON.stringify(msgArray));
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

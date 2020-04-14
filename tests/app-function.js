'use strict'
const https = require('https');
const fs = require('fs');
const AnomalyDetector = require('@azure/cognitiveservices-anomalydetector');
const msRest = require('@azure/ms-rest-js');
require('dotenv').config();

let key = process.env.anomalydetector_key;
let endpoint = process.env.anomalydetector_endpoint;
let credentials = new msRest.ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } });
let anomalyDetectorClient = new AnomalyDetector.AnomalyDetectorClient(credentials, endpoint);
let data = [];

function addInitialData(data) {
    // Need 12 points before we can start anomaly detection for stream dataset
    // Hard coding the values for now
    data.push({ timestamp: new Date('2020-02-04 00:00:00'), value: 0.013668295 });
    data.push({ timestamp: new Date('2020-02-04 00:01:00'), value: 0.01469345 });
    data.push({ timestamp: new Date('2020-02-04 00:02:00'), value: 0.012023285 });
    data.push({ timestamp: new Date('2020-02-04 00:03:00'), value: 0.013062124 });
    data.push({ timestamp: new Date('2020-02-04 00:04:00'), value: 0.01232112 });
    data.push({ timestamp: new Date('2020-02-04 00:05:00'), value: 0.015018398 });
    data.push({ timestamp: new Date('2020-02-04 00:06:00'), value: 0.012311363 });
    data.push({ timestamp: new Date('2020-02-04 00:07:00'), value: 0.013543963999999999 });
    data.push({ timestamp: new Date('2020-02-04 00:08:00'), value: 0.016764971 });
    data.push({ timestamp: new Date('2020-02-04 00:09:00'), value: 0.014324403999999999 });
    data.push({ timestamp: new Date('2020-02-04 00:10:00'), value: 0.011507092 });
    data.push({ timestamp: new Date('2020-02-04 00:11:00'), value: 0.014147788 });

    return data;
}

async function detectAnomaly(data, detectionClient) {
    //let body = { series: data, granularity: 'minutely' }
    let body = JSON.stringify({ series: data, granularity: 'minutely' })
    const options = {
        host: process.env.anomalydetector_host,
        path: '/anomalydetector/v1.0/timeseries/last/detect',
        method: 'POST',
        port: '443',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': body.length,
            'Ocp-Apim-Subscription-Key': process.env.anomalydetector_key
        },
        agent: false
    }
    const req = https.request(options, res => {
        var result = "";
        res.on("data", function (d) {
            result += d;
        });
        res.on("end", function () {
            result = JSON.parse(result);
            console.log(result.isAnomaly);
        });
    })
    req.on('error', error => {
        console.error(error)
    })
    req.write(body)
    req.end()

    // await detectionClient.lastDetect(body)
    //     .then((response) => {
    //         console.log("Anomaly detection started:")
    //         if (response.isAnomaly) {
    //             console.log("The latest point, [" + data[data.length-1].value + "], is detected as an anomaly.")
    //         } else {
    //             console.log("The latest point, [" + data[data.length-1].value + "], is NOT detected as an anomaly.")
    //         }
    //     }).catch((error) => {
    //         console.log(error)
    //     })


}
data = addInitialData(data);
// get this data from the message. Hard coding for now to test
let lastDataPoint = { timestamp: new Date('2020-02-04 00:12:00'), value: parseFloat(0.014147788) };
//let lastDataPoint = { timestamp: new Date('2020-02-04 00:12:00'), value: parseFloat(0.22) };
data.push(lastDataPoint);
detectAnomaly(data, anomalyDetectorClient);
const https = require('https');
const fs = require('fs');
const AnomalyDetector = require('@azure/cognitiveservices-anomalydetector');
const msRest = require('@azure/ms-rest-js');
module.exports = function (context, IoTHubMessages) {

    let key = process.env.anomalydetector_key;
    let endpoint = process.env.anomalydetector_endpoint;
    let credentials = new msRest.ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } });
    let anomalyDetectorClient = new AnomalyDetector.AnomalyDetectorClient(credentials, endpoint);
    IoTHubMessages.forEach((message) => {
        var msg = JSON.parse(message);
        let anomalyData = { series: msg, granularity: 'minutely', maxAnomalyRatio:0.25,sensitivity:90 };
        detectAnomaly(context, anomalyData, anomalyDetectorClient);
        context.log(msg);
    });
};

async function detectAnomaly(context, body, detectionClient) {
    //context.log(body)
    await detectionClient.lastDetect(body)
        .then((response) => {
            context.log(response)
            if (response.isAnomaly) {
                context.log("The latest point, [" + response.expectedValue + "], is detected as an anomaly. Sending Email...")
                sendEmail();
            } else {
                //context.log("The latest point, [" + response.expectedValue + "], is NOT detected as an anomaly.")
            }
            context.done();
        }).catch((error) => {
            context.log(error)
        });
}

function sendEmail() {
    https.get({
        host: 'prod-107.westus.logic.azure.com',
        path: '/workflows/...',
        method: 'POST',
        port: '443',
        headers: {
            'Content-Type': 'application/json'
        },
        agent: false
    }, (res) => {
        context.log(`STATUS: ${res.statusCode}`);
    });
}
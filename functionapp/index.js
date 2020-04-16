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
        let anomalyBody = { series: msg, granularity: 'minutely', maxAnomalyRatio:0.25,sensitivity:90 };
        detectAnomaly(context, anomalyBody, anomalyDetectorClient);
        //context.log(msg);
    });
};

async function detectAnomaly(context, body, detectionClient) {
    //context.log(body)
    await detectionClient.lastDetect(body)
        .then((response) => {
            if (response.isAnomaly) {
                context.log(response)
                var lastDataPoint = body.series[body.series.length-1]
                context.log("Anomaly detected for " + JSON.stringify(lastDataPoint)  + "sending email...")
                sendEmail(lastDataPoint);
            } else {
                //context.log("The latest point, [" + response.expectedValue + "], is NOT detected as an anomaly.")
            }
            context.done();
        }).catch((error) => {
            context.log(error)
        });
}

function sendEmail(responseText) {
    var emailText = encodeURIComponent(JSON.stringify(responseText));
    var logicAppWorkflowPath = '/workflows/...';
    https.get({
        host: 'prod-107.westus.logic.azure.com',
        path: logicAppWorkflowPath + '&anomalydata=' + emailText,
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
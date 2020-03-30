const https = require('https');
module.exports = async function (context, IoTHubMessages) {
    IoTHubMessages.forEach(async (message) => {
        context.log(`Received message: ${message}`);
        https.get({
            host: 'prod-107.westus.logic.azure.com',
            path: '/workflows/....',
            method: 'POST',
            port: '443',
            headers: {
                'Content-Type': 'application/json'
            },
            agent: false
        }, (res) => {
            context.log(`STATUS: ${res.statusCode}`);
        });
    });
    context.done();
};
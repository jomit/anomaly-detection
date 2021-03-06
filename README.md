# Serverless Anomaly Detection using Azure

![Architecture](img/architecture.png)

### High Level Components
- Simulated PLC
    - Generates sensor reading data and sends it to IoT Hub

- Function App
    - Triggers when IoT Hub receives a new message
    - Sends the message to <a href="https://docs.microsoft.com/en-us/azure/cognitive-services/anomaly-detector/quickstarts/detect-data-anomalies-nodejs-sdk?tabs=windows" target="_blank">Anomaly Detector API (Cognitive Services)</a>
    - If Anomaly is detected, calls a Logic App

- Logic App
    - Fetches the email content from query string
    - Sends the email using Send Grid

- (Optional) [Real time Dashboard](https://github.com/jomit/anomaly-detection/tree/master/real-time-dashboard)

### High Level Deployment Steps

#### IoT Hub
- Create a new IoT Hub Device and copy the connection string.

#### Logic App
- Create a new [Send Grid Account](https://signup.sendgrid.com/).
- Create a logic app using `logicapp\template.json` as guidance

#### Anomaly Detector API
- Create the [Anomaly Detector](https://ms.portal.azure.com/#create/Microsoft.CognitiveServicesAnomalyDetector) cognitive service resource in Azure.
- Copy the key and endpoint from the Quick Start section.

#### Function App
- Create a NodeJS Function App.
- Add following Application Settings:
    - Name: `anomalydetector_endpoint` | Value: `<Anomaly Detector API key>`
    - Name: `anomalydetector_key` | Value: `<Anomaly Detector API endpoint>`
- Create a new Function with IoT Hub as trigger and connect it to the IoT Hub created above.
- Use the function `Console` to install following npm packages in `D:\home\site\wwwroot` directory:
    - `npm install @azure/cognitiveservices-anomalydetector`
    - `npm install @azure/ms-rest-js`
- Update the index.js file code with `function\index.js`
- Update the `logicAppWorkflowPath` variable in `sendEmail` method with the logic app workflow path

#### Simulated PLC
- Clone the repo
- Install [Nodejs](https://nodejs.org/en/)
- Goto `simulated-plc` folder in command line
- Run `npm install`
- Create `.env` file and add following variables:
    - `deviceConnectionString='<Your IoT Hub Device Connection String>'`
- Run `node .`

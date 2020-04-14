# Anomaly Detection Quick Demo

![Architecture](https://github.com/jomit/anomaly-detection/blob/master/architecture.png)

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
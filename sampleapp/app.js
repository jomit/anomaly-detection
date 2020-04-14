'use strict'
const fs = require('fs')
const parse = require("csv-parse/lib/sync");
const AnomalyDetector = require('@azure/cognitiveservices-anomalydetector')
const msRest = require('@azure/ms-rest-js')
require('dotenv').config()

let CSV_FILE = './data/alldata.csv'

let key = process.env.anomalydetector_key
let endpoint = process.env.anomalydetector_endpoint
let credentials = new msRest.ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } })
let points = []
let skiprow = true
let anomalyDetectorClient = new AnomalyDetector.AnomalyDetectorClient(credentials, endpoint)

function readFile() {
    let input = fs.readFileSync(CSV_FILE).toString();
    let parsed = parse(input, { skip_empty_lines: true });
    parsed.forEach(function (e) {
        if(!skiprow){
            points.push({ timestamp: new Date(e[0]), value: parseFloat(e[1]) });
            //console.log("Date => " + Date(e[0]) + " , Value => " + parseFloat(e[1]))
            //console.log("data.push({ timestamp: new Date('" + e[0] + "') , value: " + parseFloat(e[1]) + " });")
        }
        skiprow = !skiprow
    });

}

async function batchCall() {
    let body = { series: points, granularity: 'minutely' }
    await anomalyDetectorClient.entireDetect(body)
        .then((response) => {
            console.log("Batch (entire) anomaly detection):")
            for (let item = 0; item < response.isAnomaly.length; item++) {
                if (response.isAnomaly[item]) {
                    console.log("An anomaly was detected from the series, at row " + item)
                    console.log(parseFloat(points[item].value))
                }
            }
        }).catch((error) => {
            console.log(error)
        })
}

async function lastDetection(){
    let body = { series: [], granularity: 'minutely' }
        await anomalyDetectorClient.lastDetect(body)
            .then((response) => {
                console.log("Latest point anomaly detection:")
                if (response.isAnomaly) {
                    console.log("The latest point, in row " + points.length + ", is detected as an anomaly.")
                } else {
                    console.log("The latest point, in row " + points.length + ", is not detected as an anomaly.")
                }
            }).catch((error) => {
                console.log(error)
            })  
}

readFile()
points = points.slice(0,8640)
batchCall()
//lastDetection()
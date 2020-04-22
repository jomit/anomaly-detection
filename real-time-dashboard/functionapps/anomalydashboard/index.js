module.exports = function (context, IoTHubMessages) {
    context.log(`Received data : ${IoTHubMessages}`);
    context.bindings.signalRMessages = [{
        "target": "newMessage",
        "arguments": IoTHubMessages
    }];
    context.done();
};
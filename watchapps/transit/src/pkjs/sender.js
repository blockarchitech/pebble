function sendStop(name, time, destination, color, highlight) {
    console.log("Sending stop: " + name + " in " + time + " minutes to " + destination + " with color " + color + " and highlight " + highlight);
    Pebble.sendAppMessage({"Stop_Name": name, "Stop_Next_Time_Minutes": time, "Stop_Destination": destination, "Stop_Color": color, "Stop_Highlight": highlight},
        function(e) {
            console.log("Sent message with transactionId = " + e.data.transactionId);
        },
        function(e) {
            console.log("Failed to send message with transactionId = " + e.data.transactionId + " Error is: " + e.error.message);
        }
    );
}

function sendMultiStop(stops) {
    for (var i = 0; i < stops.length; i++) {
        sendStop(stops[i].name, stops[i].time, stops[i].destination, stops[i].color, stops[i].highlight);
        setTimeout(function() {
            console.log("Sent stop " + i);
        }, 100); // just enough time for the pebble to not get overwhelmed
    }
}

module.exports = {
    sendStop: sendStop,
    sendMultiStop: sendMultiStop
};
function sendStop(name, time, destination, color, highlight, send_refresh) {
    console.log("Sending stop: " + name + " in " + time + " minutes to " + destination + " with color " + color + " and highlight " + highlight);
    Pebble.sendAppMessage({"Stop_Name": name, "Stop_Next_Time_Minutes": time, "Stop_Destination": destination, "Stop_Color": color, "Stop_Highlight": highlight},
        function(e) {
            console.log("Sent message with transactionId = " + e.data.transactionId);
        },
        function(e) {
            console.log("Failed to send message with transactionId = " + e.data.transactionId + " Error is: " + e.error.message);
        }
    );

    if (send_refresh) {
        sendRefreshMenu();
    }
}

function sendRefreshMenu() {
    console.log("Sending refresh menu");
    Pebble.sendAppMessage({"RefreshMenu": 1},
        function(e) {
            console.log("Sent message with transactionId = " + e.data.transactionId);
        },
        function(e) {
            console.log("Failed to send message with transactionId = " + e.data.transactionId + " Error is: " + e.error.message);
        }
    );
}

function sendMultiStop(stops) {
    console.log(JSON.stringify(stops));
    console.log(typeof stops)
    // stops = JSON.parse(stops);
    for (var i = 0; i < stops.length; i++) {
        console.log(JSON.stringify(stops[i]));
        sendStop(stops[i].name, stops[i].time, stops[i].destination, stops[i].color, stops[i].highlight, false);
        console.log("Sent stop " + i);
    }
    sendRefreshMenu();

}

module.exports = {
    sendStop: sendStop,
    sendMultiStop: sendMultiStop
};
// send appmessages with stops
var sender = require("./sender")

Pebble.addEventListener("ready",
    function(e) {
        console.log("Hello world! - Sent from your javascript application.");
        // send a dummy stop with name, next time minutes, destination, color and color highlight
        // message keys are Stop_Name, Stop_Next_Time_Minutes, Stop_Destination, Stop_Color, Stop_Color_Highlight
        var multistop_test = [
            {"name": "Test Stop 1", "time": 5, "destination": "Test Destination 1", "color": 0xAAAAAA, "highlight": 0xFFFFFF},
            {"name": "Test Stop 2", "time": 10, "destination": "Test Destination 2", "color": 0xAAAAAA, "highlight": 0xFFFFFF},
            {"name": "Test Stop 3", "time": 15, "destination": "Test Destination 3", "color": 0xAAAAAA, "highlight": 0xFFFFFF}
        ];
        sender.sendMultiStop(multistop_test);
        

    }
);

Pebble.addEventListener("appmessage",
    function(e) {
        console.log("Received message: " + JSON.stringify(e.payload));
    });


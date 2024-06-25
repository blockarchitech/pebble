// send appmessages with stops
var sender = require("./sender");
var transit = require("./transit");

Pebble.addEventListener("ready",
    function(e) {
        
        transit.data().then(function(data) {
            sender.sendMultiStop(data);
        }).catch(function(err) {
            console.log("Error: " + err);
        });

    }
);

Pebble.addEventListener("appmessage",
    function(e) {
        console.log("Received message: " + JSON.stringify(e.payload));
    });


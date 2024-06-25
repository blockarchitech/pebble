var Promise = require('bluebird');

// Variables
var root = "https://external.transitapp.com/v3";
var api_key = "";
var lat = 38.8977; // TOTALLY not the White House
var lng = -77.0365;

function convertHex(hex) {
    // Convert hex color code (#RRGGBB) to integer (0xRRGGBB)
    return parseInt(hex.substring(1), 16);
}

function hexToRGB(hex) {
    // Convert hex color code to RGB
    var r = parseInt(hex.substring(1, 3), 16);
    var g = parseInt(hex.substring(3, 5), 16);
    var b = parseInt(hex.substring(5, 7), 16);
    return [r, g, b];
}

function RGBToHex(r, g, b) {
    // Convert RGB to hex color code
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}


function darkenColor(color) {
    // Darken color by 20%
    var r = (color >> 16) & 0xFF;
    var g = (color >> 8) & 0xFF;
    var b = color & 0xFF;
    r = Math.round(r * 0.8);
    g = Math.round(g * 0.8);
    b = Math.round(b * 0.8);
    return (r << 16) | (g << 8) | b;
}

function unixToMinutes(unix) {
    // Convert Unix time to minutes
    var date = new Date(unix * 1000);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    return hours * 60 + minutes;
}

// Function to get data and print it
function data() {
    return new Promise(function(resolve, reject) {
        var url = root + "/public/nearby_routes?lat=" + lat + "&lon=" + lng + "&max_distance=500";
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader("apiKey", api_key);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                console.log(data);
                var pebble = [];
                // Iterate through the routes and print the required details
                for (var i = 0; i < data.routes.length; i++) {
                    // if departure time is undefined, skip this route
                    try {
                        if (data.routes[i].itineraries[0].schedule_items[0].departure_time === undefined) {
                            continue;
                        }
                    } catch (e) {
                        continue;
                    }
                    var route_short_name = data.routes[i].route_short_name ? data.routes[i].route_short_name : "N/A";
                    var mode_name = data.routes[i].mode_name;
                    var headsign = data.routes[i].itineraries[0].merged_headsign;
                    var departure_time = data.routes[i].itineraries[0].schedule_items[0].departure_time ? data.routes[i].itineraries[0].schedule_items[0].departure_time : 0;
                    var stop_name = data.routes[i].itineraries[0].closest_stop.stop_name;
                    var route_color = data.routes[i].route_color;
                    var route_highlight = darkenColor(hexToRGB(route_color));
                    route_highlight = RGBToHex(route_highlight[0], route_highlight[1], route_highlight[2]);
                    console.log("Route: " + route_short_name + ", Mode: " + mode_name + ", Destination: " + headsign + ", Departure Time: " + departure_time + ", Stop: " + stop_name);
                    // Convert to data useful for Pebble

                    // are we black and white?
                    if (Pebble.getActiveWatchInfo) {
                        var watch = Pebble.getActiveWatchInfo();
                        if (watch.platform === "aplite" || watch.platform === "diorite") {
                            route_color = "#AAAAAA";
                            route_highlight = "#FFFFFF";
                        }
                    }

                    console.log(unixToMinutes(departure_time));

                    pebble.push({
                        "name": route_short_name,
                        "time": unixToMinutes(departure_time),
                        "destination": headsign,
                        "color": convertHex(route_color),
                        "highlight": convertHex(route_highlight)
                    });
                }

                resolve(pebble);
            } else {
                console.log("State: " + xhr.readyState)
                console.log("Resp. Text: " + xhr.responseText)
                console.log("Status: " + xhr.status)
                console.log("Error: " + xhr.statusText);
            }
        };

        xhr.onerror = function () {
            reject(this.statusText);
        };
        xhr.send();
    });
}

module.exports = {
    data: data
};
// Switch the device the player is playing on using the /v1/me/player endpoint.
var { Promise } = require('bluebird');

function switchPlayerDevice(deviceID, token) {
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open("PUT", `https://api.spotify.com/v1/me/player`, true);
		xhr.onload = function () {
			if (xhr.readyState === 4) {
				if (xhr.status === 204) {
					resolve(true);
				} else {
					console.error(xhr.statusText);
					reject(xhr.statusText);
				}
			}
		}
		xhr.setRequestHeader("Authorization", "Bearer " + token);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.send(JSON.stringify({
			"device_ids": [deviceID]
		})); // *theoretically* this should also allow for multiple devices to be played on at once, but I haven't tested it
	});
}

module.exports = switchPlayerDevice;

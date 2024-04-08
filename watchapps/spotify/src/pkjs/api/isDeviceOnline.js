// Check if a device is online from spotify. Forbid starting the app if not. (return false)
var { Promise } = require('bluebird');

function isDeviceOnline(token) {
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', `https://api.spotify.com/v1/me/player/devices`, true);
		xhr.onload = function () {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					var data = JSON.parse(xhr.responseText);
					if (data.devices.length > 0) {
						resolve(true);
					} else {
						resolve(false);
					}
				} else {
					console.error(xhr.statusText);
					reject(xhr.statusText);
				}
			}
		}
	});
}
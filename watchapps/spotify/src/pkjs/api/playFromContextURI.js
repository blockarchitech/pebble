// Play Spotify from a context URI (album, playlist, etc.)
var { Promise } = require('bluebird');
var isDeviceOnline = require('./isDeviceOnline');

function playFromContextURI(contextURI, token) {
	return new Promise(function (resolve, reject) {
		isDeviceOnline(token).then(function (isOnline) {
			if (isOnline) {
				// Device is online, so we can play from the context URI
				var xhr = new XMLHttpRequest();
				xhr.open("PUT", `https://api.spotify.com/v1/me/player/play`, true);
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
					"context_uri": contextURI
				}));
			} else {
				reject("No device online");
			}
		});
	});
}

module.exports = playFromContextURI;


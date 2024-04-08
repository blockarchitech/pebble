// Change the state of the Spotify player (play, pause, next, previous, etc.)
var { Promise } = require('bluebird');

function changeSpotifyPlayerState(state, token) {
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest(); // using XHR for PUT and status code validation
		xhr.open("PUT", `https://api.spotify.com/v1/me/player/${state}`, true);
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
		xhr.send();
	});
}

module.exports = changeSpotifyPlayerState;
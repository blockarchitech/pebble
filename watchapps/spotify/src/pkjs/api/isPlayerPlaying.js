// Check /v1/me/player endpoint to see if user is playing a song
var { Promise } = require('bluebird');

function isPlayerPlaying(token) {
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', `https://api.spotify.com/v1/me/player`, true);
		xhr.onload = function () {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					var data = JSON.parse(xhr.responseText);
					resolve(data.is_playing);
				} else {
					console.error(xhr.statusText);
					reject(xhr.statusText);
				}
			}
		}
		xhr.setRequestHeader("Authorization", "Bearer " + token);
		xhr.send();
	});
}

module.exports = isPlayerPlaying;


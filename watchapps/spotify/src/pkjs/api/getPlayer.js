// Get "Now Playing" track from the player.
var { Promise } = require('bluebird');

function getPlayer(token) {
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', `https://api.spotify.com/v1/me/player`, true);
		xhr.onload = function () {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					var data = JSON.parse(xhr.responseText);
					resolve(data);
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

module.exports = getPlayer;
// Get the user's playlists
var { Promise } = require('bluebird');

function getUserPlaylists(token, uid) {
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', `https://api.spotify.com/v1/users/${uid}/playlists`, true);
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

module.exports = getUserPlaylists;

// Get tracks from a playlist
var { Promise } = require('bluebird');

function getTracksFromPlaylist(token, playlistID) {
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', `https://api.spotify.com/v1/playlists/${playlistID}/tracks`, true);
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
	});
}

module.exports = getTracksFromPlaylist;

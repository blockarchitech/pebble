// Get a refresh token.
var { Promise } = require('bluebird');

function refresh(token, refresh_token, created_date, client_id) {
	return new Promise(function (resolve, reject) {
		// Check if it has been 3600 (1 hour) seconds since the token was created.
		var current_date = new Date().getTime();
		console.log(`Current date: ${current_date}`);
		console.log(`Created date: ${created_date}`);
		var seconds = (current_date - created_date) / 1000;
		// round seconds to nearest 100
		seconds = Math.round(seconds / 100) * 100;
		console.log(`Seconds: ${seconds}`);
		if (seconds < 3300) {
			console.log(`Token is still valid.`);
			resolve(token);
		} else {
			// Get a new token.
			console.log(`Token is expired.`);
			var xhr = new XMLHttpRequest();
			xhr.open('POST', `https://accounts.spotify.com/api/token`, true);
			xhr.onload = function () {
				console.log(JSON.stringify(xhr));
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						var data = JSON.parse(xhr.responseText);
						resolve(data.access_token);
					} else {
						console.log(JSON.stringify(xhr));
						var data = JSON.parse(xhr.responseText);

						console.log(JSON.stringify(data));
						console.error(xhr.statusText);
						reject(JSON.stringify(data));
					}
				}
			}
			xhr.setRequestHeader("Authorization", "Basic " + token);
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.send(`grant_type=refresh_token&refresh_token=${refresh_token}&client_id=${client_id}`);
		}
	});
}

module.exports = refresh;
// Get a refresh token.
var { Promise } = require('bluebird');

function refresh(token, refresh_token, created_date) {
	return new Promise(function (resolve, reject) {
		// Check if it has been 3600 (1 hour) seconds since the token was created.
		var current_date = new Date();
		console.log(`Current date: ${current_date}`);
		console.log(`Created date: ${created_date}`);
		var seconds = (current_date.toUTCString() - created_date) / 1000;
		if (seconds > 3300) {
			resolve(token);
		} else {
			// Get a new token.
			var xhr = new XMLHttpRequest();
			xhr.open('POST', `https://accounts.spotify.com/api/token`, true);
			xhr.onload = function () {
				console.log(JSON.stringify(xhr));
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						var data = JSON.parse(xhr.responseText);
						resolve(data.access_token);
					} else {
						console.log(JSON.stringify(data));
						console.error(xhr.statusText);
						reject(data);
					}
				}
			}
			xhr.setRequestHeader("Authorization", "Basic " + token);
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.send(`grant_type=refresh_token&refresh_token=${refresh_token}`);
		}
	});
}

module.exports = refresh;
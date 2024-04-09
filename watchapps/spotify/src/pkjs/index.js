require("pebblejs");
var UI = require("pebblejs/dist/js/ui");
var Settings = require("pebblejs/settings");
var feature = require("pebblejs/dist/js/platform/feature");
var voice = require("pebblejs/dist/js/ui/voice");
var { Promise } = require("bluebird");
var playFromContextURI = require("./api/playFromContextURI");
var playTrackOffsetInPlaylist = require("./api/playTrackOffsetInPlaylist");
var getTracksFromPlaylist = require("./api/getTracksFromPlaylist");
var getDevices = require("./api/getDevices");
var switchPlayerDevice = require("./api/switchPlayerDevice");
var isPlayerPlaying = require("./api/isPlayerPlaying");
var changeSpotifyPlayerState = require("./api/changeSpotifyPlayerState");
var getUserPlaylists = require("./api/getUserPlaylists");
var getPlayer = require("./api/getPlayer");
var search = require("./api/search");
const refresh = require("./api/refresh");
var donotrun = false;
var devmode = {
	"enabled": false,
	"IP": "192.168.183.58",
	"port": "3000",
	"rooturl": "my_url"
}




Pebble.addEventListener("showConfiguration", function (e) {
	var last4TTN = Pebble.getWatchToken();
	var watchModel = Pebble.getActiveWatchInfo().model;
	if (devmode.enabled) {
		var url = `https://pebble.blockarchitech.com/api/v1/spotify/config`
		Pebble.openURL(url);
	} else {
		// var url = `https://${rooturl}/config?last4TTN=${last4TTN}&watchModel=${watchModel}`;
		var url = `https://pebble.blockarchitech.com/api/v1/spotify/config`
		Pebble.openURL(url);

	}
});

Pebble.addEventListener("webviewclosed", function (e) {
	if (e && !e.response) {
		return;
	}
	var dict = decodeURIComponent(e.response);
	settings = dict
	localStorage.setItem("clay-settings", settings);
	console.log("NEW SETTINGS: " + settings);
	Settings.option(dict);

	// Send analytics ping
	var xhr = new XMLHttpRequest();
	xhr.open("PUT", "https://pebble.blockarchitech.com/api/v1/spotify/analytics", true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(JSON.stringify({
		"watchModel": Pebble.getActiveWatchInfo().model,
		"appVersion": "1.0",
		"platform": Pebble.getActiveWatchInfo().platform,
		"timestamp": new Date().toISOString(),
		"watchToken": Pebble.getWatchToken()
	}));

	
});



Pebble.addEventListener("ready", function (e) {
	// Get the initial configuration
	settings = JSON.parse(localStorage.getItem("clay-settings")) || {};

	// Check if the user set sttings
	if (Object.keys(settings).length === 0) {
		// No settings found, show "Configure me!" message
		var card = new UI.Card({
			title: "Configure me!",
			body: "Please open the Pebble app on your phone and set your settings.",
			scrollable: true,
			backgroundColor: "black",
			titleColor: "green",
			bodyColor: "white",
			icon: "images/next.png"
		});
		card.show();
	} else {

		// Get a refresh token (if needed)
		var wait = new UI.Card({
			title: "Please wait",
			body: "Getting a refresh token...",
			scrollable: false,
			backgroundColor: "black",
			titleColor: "green",
			bodyColor: "white",
		});
		wait.show();
		refresh(settings.token, settings.refresh_token, settings.date, settings.client_id).then(data => {
			settings.token = data.access_token;
			settings.date = new Date();
			localStorage.setItem("clay-settings", settings);
			Settings.option(settings);
			wait.hide();

			getUserPlaylists(settings.token).then(data => {
				return;
			}).catch(err => {
				console.log(err)
				var errorCard = new UI.Card({
					title: "API Error",
					subtitle: `Error: ${JSON.stringify(err)}`,
					scrollable: true,
					backgroundColor: "black",
					titleColor: "white",
					subtitleColor: "white",
					bodyColor: "white",
				});
				errorCard.show();
				splashCard.hide();
				donotrun = true;
			});


		}).catch(err => {
			wait.hide();
			console.log(err)
			var errorCard = new UI.Card({
				title: "API Error",
				subtitle: `Couldn't refresh token: ${err}`,
				scrollable: true,
				backgroundColor: "black",
				titleColor: "white",
				subtitleColor: "white",
				bodyColor: "white",
			});
			errorCard.show();
			splashCard.hide();
			donotrun = true;
		});





		// Show splash screen while waiting for data
		var splashCard = new UI.Card({
			title: "Loading...",
			subtitle: "Fetching data from the server",
			scrollable: false,
			backgroundColor: "black",
			titleColor: "white",
			bodyColor: "white",
		});

		splashCard.show();




		// Make request to server
		var last4TTN = Pebble.getWatchToken();
		var watchModel = Pebble.getActiveWatchInfo().model;
		// show main menu
		var mm = new UI.Menu({
			sections: [{
				title: "Hi, " + settings.user_name + "!",
				items: [{
					title: "Playlists",
					subtitle: "Show your playlists"
				}, {
					title: "Devices",
					subtitle: "Show your devices"
				}, {
					title: "Now Playing",
					subtitle: "Control the player"
				}
				]
			}],
			backgroundColor: "black",
			highlightBackgroundColor: "green",
			textColor: "white",
		});
		if (feature.microphone) {
			// add search menu item
			mm.item(0, 3, {
				title: "Search",
				subtitle: "Search for a song"
			});
		}
		if (donotrun == false) {
			mm.hide();
		} else {
			mm.show();
			splashCard.hide();
		}
		mm.on("select", function (e) {
			console.log("Selected item #" + e.itemIndex + " of section #" + e.sectionIndex);
			if (e == null) {
				return;
			}
			if (e.itemIndex == 0) {
				// show playlists
				getUserPlaylists(settings.token).then(data => {
					// Create an array of Menu items
					var menuItems = [];
					for (var i = 0; i < data.items.length; i++) {
						var playlist = data.items[i];
						menuItems.push({
							title: playlist.name,
							subtitle: playlist.description,
							playlistid: playlist.id,
							playlistname: playlist.name
						});
					}

					// Construct Menu to show to user
					var resultsMenu = new UI.Menu({
						sections: [{
							title: `${settings.user_name}'s Playlists`,
							items: menuItems
						}],
						backgroundColor: "black",
						highlightBackgroundColor: "green",
						textColor: "white",
					});

					// On click, tell spotify to play the playlist
					resultsMenu.on("select", function (e) {
						var playlistid = e.item.playlistid;
						var playlistname = e.item.playlistname;
						// Make request to server
						playFromContextURI(`spotify:playlist:${playlistid}`, settings.token).then(function () {
							if (xhr.readyState === 4) {
								if (xhr.status === 204) {
									console.log("Success");
									var card = new UI.Card({
										title: "Now Playing",
										body: `'${playlistname}'`,
										scrollable: true,
										backgroundColor: "black",
										titleColor: "white",
										bodyColor: "white",
									});
									card.show();
									setTimeout(function () {
										card.hide();
									}, 3000);
								} else {
									console.error(xhr.statusText);
									var card = new UI.Card({
										title: "Oh no!",
										subtitle: "Something went wrong",
										body: `${xhr.responseText}`,
										scrollable: true,
										backgroundColor: "black",
										titleColor: "white",
										bodyColor: "white",
									});
									card.show();
								}
							}
						}).catch(function (err) {
							console.error(xhr.statusText);
							var card = new UI.Card({
								title: "Oh no!",
								subtitle: "Something went wrong",
								body: `${err}`,
								scrollable: true,
								backgroundColor: "black",
								titleColor: "white",
								bodyColor: "white",
							});
							card.show();
						});
					});
					// If held, show the tracks in the playlist
					resultsMenu.on("longSelect", function (e) {
						var playlistid = e.item.playlistid;
						var playlistname = e.item.playlistname;
						getTracksFromPlaylist(playlistid, settings.token).then(function (data) {
							// Create an array of Menu items
							var menuItems = [];
							for (var i = 0; i < data.items.length; i++) {
								var track = data.items[i].track;
								menuItems.push({
									title: track.name,
									subtitle: track.artists[0].name,
									trackid: track.id,
									trackname: track.name
								});
							}

							// Construct Menu to show to user
							var resultsMenu = new UI.Menu({
								sections: [{
									title: `${playlistname}`,
									items: menuItems
								}],
								backgroundColor: "black",
								highlightBackgroundColor: "green",
								textColor: "white",
							});

							// On click, tell spotify to play the track
							resultsMenu.on("select", function (e) {
								// Make request to server
								playTrackOffsetInPlaylist(`spotify:playlist:${playlistid}`, e.itemIndex, settings.token).then(function () {
									console.log("Success");
									var card = new UI.Card({
										title: "Now Playing",
										body: `'${e.item.trackname}'`,
										scrollable: true,
										backgroundColor: "black",
										titleColor: "white",
										bodyColor: "white",
									});
									card.show();
									setTimeout(function () {
										card.hide();
									}, 3000);
								}).catch(function (err) {
									console.error(xhr.statusText);
									var card = new UI.Card({
										title: "Oh no!",
										subtitle: "Something went wrong",
										body: `${err}`,
										scrollable: true,
										backgroundColor: "black",
										titleColor: "white",
										bodyColor: "white",
									});
									card.show();
								});
							});
							resultsMenu.show();
							splashCard.hide();
						}).catch(function (err) {
							console.error(xhr.statusText);
							var card = new UI.Card({
								title: "Oh no!",
								subtitle: "Something went wrong",
								body: `${err}`,
								scrollable: true,
								backgroundColor: "black",
								titleColor: "white",
								bodyColor: "white",
							});
							card.show();
						});
					});
					resultsMenu.show();
					splashCard.hide();
				}).catch(err => {
					var errorCard = new UI.Card({
						title: "Oh no!",
						subtitle: "Something went wrong",
						body: `${err}`,
						scrollable: true,
						backgroundColor: "black",
						titleColor: "white",
						bodyColor: "white",
					});
					errorCard.show();
					setTimeout(function () {
						errorCard.hide();
					}, 3000);
				});
			} else if (e.itemIndex == 1) {
				// show devices
				getDevices(settings.token).then(data => {
					// Create an array of Menu items
					var menuItems = [];
					for (var i = 0; i < data.devices.length; i++) {
						var device = data.devices[i];
						menuItems.push({
							title: device.name,
							subtitle: device.type,
							deviceid: device.id,
							devicename: device.name
						});
					}

					// Construct Menu to show to user
					var resultsMenu = new UI.Menu({
						sections: [{
							title: `${settings.user_name}'s Devices`,
							items: menuItems
						}],
						backgroundColor: "black",
						highlightBackgroundColor: "green",
						textColor: "white",
					});
					resultsMenu.on("select", function (e) {
						var deviceid = e.item.deviceid;
						var devicename = e.item.devicename;
						switchPlayerDevice(deviceid, settings.token).then(function () {
							console.log("Success");
							var card = new UI.Card({
								title: "Device Changed",
								body: `'${devicename}'`,
								backgroundColor: "black",
								titleColor: "white",
								bodyColor: "white",
							});
							card.show();
							setTimeout(function () {
								card.hide();
							}, 3000);

						}).catch(function (err) {
							console.error(xhr.statusText);
							var card = new UI.Card({
								title: "Oh no!",
								subtitle: "Something went wrong",
								body: `${err}`,
								scrollable: true,
								backgroundColor: "black",
								titleColor: "white",
								bodyColor: "white",
							});
							card.show();
						});
					});
					// Show the Menu, hide the splash
					resultsMenu.show();
					splashCard.hide();

				}).catch(err => {
					var errorCard = new UI.Card({
						title: "Oh no!",
						subtitle: "Something went wrong",
						body: `${err}`,
						scrollable: true,
						backgroundColor: "black",
						titleColor: "white",
						bodyColor: "white",
					});
					errorCard.show();
					setTimeout(function () {
						errorCard.hide();
					}, 3000);
				});
			} else if (e.itemIndex == 2) {
				// show now playing
				getPlayer(settings.token).then(data => {
					// Create an array of Menu items
					var menuItems = [];
					var card = new UI.Card({
						title: `${data.item.name}`,
						subtitle: `${data.item.name} by ${data.item.artists[0].name}`,
						scrollable: false,
						backgroundColor: "black",
						titleColor: "white",
						bodyColor: "white",
					});

					card.action({
						up: "images/prev.png",
						select: "images/pause.png",
						down: "images/next.png"
					});

					card.on("click", "up", function (e) {
						changeSpotifyPlayerState("previous", settings.token);
						// Refresh the card
						getPlayer(settings.token).then(function (data) {
							card.title(data.item.name);
							card.body(`by ${data.item.artists[0].name}`);
						})
					});

					card.on("click", "select", function (e) {
						isPlayerPlaying(settings.token).then(function (isPlaying) {
							if (isPlaying) {
								changeSpotifyPlayerState("pause", settings.token);
							} else {
								changeSpotifyPlayerState("play", settings.token);
							}
						});
					});

					card.on("click", "down", function (e) {
						changeSpotifyPlayerState("next", settings.token);
						getPlayer(settings.token).then(function (data) {
							card.body(`${data.item.name} by ${data.item.artists[0].name}`);
						})
					});
					card.show();
				}).catch(err => {
					var errorCard = new UI.Card({
						title: "Oh no!",
						subtitle: "Something went wrong",
						body: `${err}`,
						scrollable: true,
						backgroundColor: "black",
						titleColor: "white",
						bodyColor: "white",
					});
					errorCard.show();
					setTimeout(function () {
						errorCard.hide();
					}, 3000);
				});
			} else if (e.itemIndex == 3) {
				// show search
				// start voice search
				voice.dictate("start", true, function (e) {
					if (e.err) {
						console.log("Error: " + e.err);
						var voice_error = new UI.Card({
							title: "Error",
							subtitle: "Voice search failed",
							body: e.err,
							scrollable: true,
							backgroundColor: "black",
							titleColor: "white",
							bodyColor: "white",
						});
						voice_error.show();
						setTimeout(function () {
							voice_error.hide();
						}
							, 3000);
						return;
					}
					var search_term = e.transcription;
					// search for song
					search(search_term, settings.token).then(data => {
						// Create an array of Menu items
						var menuItems = [];
						for (var i = 0; i < data.tracks.items.length; i++) {
							var track = data.tracks.items[i];
							menuItems.push({
								title: track.name,
								subtitle: track.artists[0].name,
								trackid: track.id,
								trackname: track.name
							});
						}

						// Construct Menu to show to user
						var resultsMenu = new UI.Menu({
							sections: [{
								title: `Search results for '${search_term}'`,
								items: menuItems
							}],
							backgroundColor: "black",
							highlightBackgroundColor: "green",
							textColor: "white",
						});

						// On click, tell spotify to play the track
						resultsMenu.on("select", function (e) {
							// Make request to server
							playFromContextURI(`spotify:track:${e.item.trackid}`, settings.token).then(function () {
								console.log("Success");
								var card = new UI.Card({
									title: "Now Playing",
									body: `'${e.item.trackname}'`,
									scrollable: true,
									backgroundColor: "black",
									titleColor: "white",
									bodyColor: "white",
								});
								card.show();
								setTimeout(function () {
									card.hide();
								}, 3000);
							}).catch(function (err) {
								var card = new UI.Card({
									title: "Oh no!",
									subtitle: "Something went wrong",
									body: `${err}`,
									scrollable: true,
									backgroundColor: "black",
									titleColor: "white",
									bodyColor: "white",
								});
								card.show();
							});
						});
						// Show the Menu, hide the splash
						resultsMenu.show();
					}
					).catch(err => {
						var card = new UI.Card({
							title: "Oh no!",
							subtitle: "Something went wrong",
							body: `${err}`,
							scrollable: true,
							backgroundColor: "black",
							titleColor: "white",
							bodyColor: "white",
						});
						card.show();
					});
				});
			} else {
				console.log("Error: Unknown itemIndex");
			}
		});
	}
});

// Required scopes for this shenanigans: user-read-playback-state, user-modify-playback-state, user-read-currently-playing, user-read-private, playlist-read-private, playlist-read-collaborative

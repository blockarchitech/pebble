require("pebblejs");
var UI = require("pebblejs/dist/js/ui");
var ajax = require("pebblejs/dist/js/lib/ajax");
var Settings = require("pebblejs/settings");
const getServices = require("./libs/getServices");
const confirm = require("./libs/confirm");
const decline = require("./libs/decline");



function checkConf(thing) {
  if (thing == "C") {
    return "Confirmed";
  } else if (thing == "U") {
    return "Unconfirmed";
  }
}

Pebble.addEventListener("showConfiguration", function (e) {
  var url = `https://pebble.blockarchitech.com/api/v1/services/config`;
  Pebble.openURL(url);
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
		"appVersion": "2.1",
		"platform": Pebble.getActiveWatchInfo().platform,
		"timestamp": new Date().toISOString(),
		"watchToken": Pebble.getWatchToken()
	}));
});

Pebble.addEventListener("ready", function (e) {
  // Get the initial configuration
  settings = JSON.parse(localStorage.getItem("clay-settings")) || {};

  // Check if the user set sttings
  if (Object.keys(settings).length === 0 || !settings.appId || !settings.appToken || !settings.userId || settings.appId === "" || settings.appToken === "" || settings.userId === "" || settings.appId === "1234567890" || settings.appToken === "1234567890" || settings.userId === "1234567890") {
	// No settings found, show "Configure me!" message
	var card = new UI.Card({
		title: "Configure me!",
		body: "Please open the Pebble app on your phone and set your settings."
	});
	card.show();
  }

  // Main menu
  var today = [];
  var confirmedPlans = [];
  var unconfirmedPlans = [];
  var master = [];
  var menu = new UI.Menu({
    highlightBackgroundColor: "blue",
    sections: [
      {
        title: "Today",
        items: today
      },
      {
        title: "Upcoming",
        items: confirmedPlans
      },
      {
        title: "Unconfirmed",
        items: unconfirmedPlans
      }
    ]
  });

  // Create menu items
  getServices(settings.appId, settings.appToken, settings.userId)
    .then((data) => {
      console.log("Got data! ");
      json = JSON.parse(data);
      arrt = json.data;
      arrt.sort(function (a, b) {
        var keyA = new Date(a.attributes.dates);
        var keyB = new Date(b.attributes.dates);
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      });
      var i = 0;
      while (i < arrt.length) {
        var j = i + 1;
        while (j < arrt.length) {
          if (
            arrt[i].attributes.dates == arrt[j].attributes.dates &&
            arrt[i].attributes.service_type_name ==
              arrt[j].attributes.service_type_name
          ) {
            arrt[i].attributes.team_position_name =
              arrt[i].attributes.team_position_name +
              ", " +
              arrt[j].attributes.team_position_name;
            arrt.splice(j, 1);
          } else {
            j++;
          }
        }
        i++;
      }
      var tdindex = 0;
      arrt.forEach((v) => {
        master.push(v);
        if (v.attributes.status == "C") {
          confirmedPlans.push({
            title: v.attributes.dates,
            subtitle: `${v.attributes.team_position_name} - ${v.attributes.service_type_name}`
          });
        } else if (v.attributes.status == "U") {
          unconfirmedPlans.push({
            title: v.attributes.dates,
            subtitle: `${v.attributes.team_position_name} - ${v.attributes.service_type_name}`
          });
        }
        var todayDate = new Date();
        var planDate = new Date(v.attributes.dates);
        if (tdindex == 0) {
          if (
            todayDate.getDate() == planDate.getDate() &&
            todayDate.getMonth() == planDate.getMonth() &&
            todayDate.getFullYear() == planDate.getFullYear()
          ) {
            today.push(v);
            tdindex++;
          } else {
            today.push({
              title: "No plans today",
              subtitle: "Woot!"
            });
            tdindex++;
          }
        } else {
          // do nothing
        }
      });
      console.log("Menu created");
      // menu.items(0, itemList);
      menu.show();
    })
    .catch((error) => {
      console.log("Error: " + error);
      var caller_line = error.stack.split("\n")[4];
      var index = caller_line.indexOf("at ");
      var clean = caller_line.slice(index + 2, caller_line.length);
      console.log("at " + clean);
    });

  // Selected item
  var sel_position = "";
  var sel_dates = "";
  var sel_id = "";
  var sel_service_type_name = "";
  var sel_status = "";
  var sel_team_pos_name = "";
  var sel_org_name = "";
  var sel_short_date = "";

  menu.on("select", function (e) {
    console.log("Selected plan #" + e.itemIndex);
    ajax(
      {
        url: `https://api.planningcenteronline.com/services/v2/people/${settings.userId}/schedules`,
        headers: {
          Authorization:
            `Basic ` + btoa(`${settings.appId}:${settings.appToken}`)
        }
      },
      function (data) {
        json = JSON.parse(data);
        arrt = json.data;
        arrt.forEach((v) => {
          if (`${v.attributes.dates}` == `${e.item.title}`) {
            console.log("match found");
            sel_position = v.attributes.team_position_name;
            sel_dates = v.attributes.dates;
            sel_id = v.id;
            sel_org_name = v.attributes.organization_name;
            sel_team_pos_name = v.attributes.team_name;
            sel_status = v.attributes.status;
            sel_service_type_name = v.attributes.service_type_name;
            sel_short_date = v.attributes.short_dates;
            if (sel_status == "C") {
              var selectedItemView = new UI.Card({
                title: `${sel_short_date}`,
                subtitle: `${sel_service_type_name}`,
                body: `${sel_position}\n${checkConf(sel_status)}`,
                scrollable: true
              });
            } else {
              var selectedItemView = new UI.Card({
                title: `${sel_short_date}`,
                subtitle: `${sel_service_type_name}`,
                body: `${sel_position}\n${checkConf(sel_status)}`,
                scrollable: true,
                action: {
                  select: "images/menu.png"
                }
              });
            }

            setTimeout(() => {
              selectedItemView.show();
              selectedItemView.on("click", "select", function (e) {
                console.log("select button clicked");
                selectedItemView.action({
                  up: "images/check.png",
                  down: "images/x.png",
                  select: ""
                });
              });
              selectedItemView.on("click", "up", function (e) {
                console.log("Confirming plan");
                confirm(config, sel_id).then(() => {
                  console.log("Plan confirmed");
                  selectedItemView.action({
                    up: "images/check.png",
                    select: "",
                    down: ""
                  });
                });
              });
              selectedItemView.on("click", "down", function (e) {
                console.log("Declining plan");
                decline(config, sel_id).then(() => {
                  console.log("Plan declined");
                  selectedItemView.action({
                    up: "",
                    select: "",
                    down: "images/x.png"
                  });
                });
              });
            }, 100);
          }
        });
      },
      function (data) {
        console.log(data);
      }
    );
  });
});

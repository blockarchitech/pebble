// Confirm planning center plan.
var ajax = require("pebblejs/dist/js/lib/ajax");
var Promise = require("bluebird");

function confirm(config, planid) {
  return new Promise(function (resolve, reject) {
    var url = `https://api.planningcenteronline.com/services/v2/people/${config.userId}/schedules/${planid}/accept`;
    console.log("Accepting ALL TIMES for planid: " + planid);
    ajax(
      {
        url: url,
        method: "POST",
        type: "json",
        headers: {
          Authorization: `Basic ` + btoa(`${config.appId}:${config.appToken}`)
        }
      },
      function (data) {
        console.log("Success: " + JSON.stringify(data));
        resolve(JSON.stringify(data));
      }
    );
  });
}

module.exports = confirm;

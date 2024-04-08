// Decline planning center plan.
var ajax = require("pebblejs/dist/js/lib/ajax");
var Promise = require("bluebird");

function decline(config, planid) {
  return new Promise(function (resolve, reject) {
    var url = `https://api.planningcenteronline.com/services/v2/people/${config.userId}/schedules/${planid}/decline`;
    var data = {
      data: {
        type: "ScheduleDecline",
        attributes: {
          reason: config.declineReason
        },
        relationships: null
      }
    };
    console.log("Declining ALL TIMES for planid: " + planid);
    ajax(
      {
        url: url,
        method: "POST",
        type: "json",
        headers: {
          Authorization: `Basic ` + btoa(`${config.appId}:${config.appToken}`)
        },
        data: data
      },
      function (data) {
        console.log("Success: " + JSON.stringify(data));
        resolve(JSON.stringify(data));
      }
    );
  });
}

module.exports = decline;

var ajax = require('pebblejs/dist/js/lib/ajax');
var Promise = require('bluebird');

function getServices(appId, appToken, userID) {
  return new Promise(function(resolve, reject) {
    ajax(
      {
        url: `https://api.planningcenteronline.com/services/v2/people/${userID}/schedules`,
        headers: {
          Authorization: `Basic ` + btoa(`${appId}:${appToken}`),
        },
        type: 'json',
      },
      function(data) {
        resolve(JSON.stringify(data));
      },
      function(error) {
        reject(error);
      }
    );
  });
}

module.exports = getServices;
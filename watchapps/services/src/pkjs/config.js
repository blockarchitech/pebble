module.exports = [
  { type: "heading", defaultValue: "Services for Pebble" },
  { type: "text", defaultValue: "Configuration page" },
  {
    type: "section",
    items: [
      { type: "heading", defaultValue: "PCO Configuration" },
      { type: "input", messageKey: "appId", label: "PCO App ID" },
      {
        type: "input",
        messageKey: "appToken",
        label: "PCO App Secret",
        description:
          "Your application ID and Secret. Create a new app at https://api.planningcenteronline.com/oauth/applications and creating a new Personal Access Token."
      },
      {
        type: "input",
        messageKey: "userId",
        label: "PCO User ID",
        description:
          "Your PCO account user ID. You can find this in your Planning Center App by tapping your profile icon, scrolling to the bottom and reading your Role/ID like so 'Administrator | YourUserID' or by going to the website, scroll down, find the number that starts with P, remove the P and put it here."
      },
      {
        type: "input",
        messageKey: "declineReason",
        label: "Decline Reason",
        description:
          "The reason you are declining the plan. This will be sent to your team leader when you decline a plan."
      }
    ]
  },
  { type: "submit", defaultValue: "Save Settings" }
];

const camelCase = require('camelcase');
const BASE_URL = process.env.BASE_URL;
const ROOT_PATH = './src/api';
const fs = require('fs');

const API_LIST = [
  'AuthorizationSettings',
  'BulkSms',
  'CheckList',
  'CheckListItem',
  'Clickatell',
  'EmailSender',
  'Form',
  'Ldap',
  'Maintenance',
  'MobileDevice',
  'Notification',
  'NotificationMessage',
  'NotificationTemplate',
  'Otp',
  'OtpAuditItem',
  'Person',
  'PushNotifiers',
  'PushSettings',
  'ReferenceList',
  'ReferenceListItem',
  'ScheduledJob',
  'ScheduledJobExecution',
  'ScheduledJobTrigger',
  'SmsGateways',
  'SmsPortal',
  'SmsSettings',
  'User',
  'Xml2Sms',
];

const onlyUpdateExisting = false;

function generateFetcher() {
  let apiObj = {};

  API_LIST.forEach((key) => {
    const camelCasedName = camelCase(key);

    const url = `${BASE_URL}/swagger/service:${key}/swagger.json`;
    const fileName = `${ROOT_PATH}/${camelCasedName}.tsx`;
    const apiName = `${camelCasedName}Api`;

    if (!onlyUpdateExisting || fs.existsSync(fileName)) {
      apiObj[apiName] = {
        output: fileName,
        url: url,
      };
    }
  });
  return apiObj;
}

module.exports = {
  ...generateFetcher(),
};

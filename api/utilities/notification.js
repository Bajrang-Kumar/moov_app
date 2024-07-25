var node_push = require("node-pushnotifications");
var GLOBALS = require('../config/constants');
var common = require('../config/common');
const { t }     = require('localizify');
class notification {
    /**
    * notification configuration
    */
    constructor() {
    }

    /**
    * This function is used to send notification 
    */
    send_push(notification ,device_type ,device_token ,callback) {

        var message = t(notification.notification_tag,notification.content);
        notification.content = JSON.stringify(notification.content);

        if (notification.notification_tag != 'sendmessage') {
            common.insertNotification(notification,function(){});   
        }

        if (device_token != '0' && device_token != "") {
            
            const registrationIds = [];
            registrationIds.push(device_token);

            var pushPayload = {
                topic: GLOBALS.BUNDLE_ID,
                alert: {
                    title: GLOBALS.APP_NAME,
                    body: message,
                },
                sound: 'default',
                custom: {
                    title    : GLOBALS.APP_NAME,
                    body     : message,
                    primary_id : notification.primary_id,
                    secondary_id : notification.secondary_id,
                    sender_id  : notification.sender_id,
                    tag      : notification.notification_tag
                }
            };

            if (device_type == "A") {
                delete pushPayload['sound'];
                delete pushPayload['badge'];
            }

            const configuration = {
                gcm: {
                    id: GLOBALS.PUSH_KEY,
                },
                apn: {
                    token: {
                        key: GLOBALS.P8_CERTIFICATE_NAME,
                        keyId: GLOBALS.KEY_ID,
                        teamId: GLOBALS.TEAM_ID,
                    },
                    // production: true
                },
                isAlwaysUseFCM: false
            }

            var push = new node_push(configuration);
            push.send(registrationIds, pushPayload, (err, result) => {
                if (err) {
                    console.log("Error Push");
                } else {
                    console.log("Success Push");
                }
                callback(true);
            });
               
        } else {
            console.log("Device token blank");
            callback(true);
        } 
    }
};

module.exports = new notification();
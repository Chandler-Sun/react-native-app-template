import Notification from 'react-native-push-notification'
import ServiceConfig from '../Config/ServiceConfig'

export default {
     setup: function(onNotification) {
         return new Promise((resolve, reject)=>{
            Notification.configure({

                // (optional) Called when Token is generated (iOS and Android)
                onRegister: (deviceToken)=>{
                    console.tron.display({
                        name: "RECEIVED DEVICE TOKEN",
                        value: deviceToken
                    })
                    resolve && resolve(deviceToken)
                },

                // (required) Called when a remote or local notification is opened or received
                onNotification: (notification)=> {
                    console.tron.log("onNotification")
                    onNotification(notification)
                },

                // ANDROID ONLY: GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications) 
                // senderID: "YOUR GCM SENDER ID",

                // ANDROID ONLY: Baidu Push Key
                baiduPushKey: ServiceConfig.ANDROID_BAIDU_PUSH_KEY,
                
                // IOS ONLY (optional): default: all - Permissions to register.
                permissions: {
                    alert: true,
                    badge: true,
                    sound: true
                },

                // Should the initial notification be popped automatically
                // default: true
                popInitialNotification: true,

                /**
                 * (optional) default: true
                 * - Specified if permissions (ios) and token (android and ios) will requested or not,
                 * - if not, you must call PushNotificationsHandler.requestPermissions() later
                 */
                requestPermissions: true,
            });
         })
    },

    sendLocalNotificationSchedule: function(message, date) {
        Notification.localNotificationSchedule({
            message: message,
            date: date
        });
    },
    
    setApplicationIconBadgeNumber(number) {
      Notification.setApplicationIconBadgeNumber(number)
    }

}
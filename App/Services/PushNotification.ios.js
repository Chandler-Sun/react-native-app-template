import NotificationsIOS, { NotificationAction, NotificationCategory } from 'react-native-notifications';
import ServiceConfig from '../Config/ServiceConfig'
import I18n from 'react-native-i18n'

let onPushRegistered = ()=>{}
let onPushRegistrationFailed = ()=>{}
let onNotificationReceivedForeground = ()=>{}
let onNotificationReceivedBackground = ()=>{}
let onNotificationOpened = ()=>{}

const prepareActions = (onInteractiveActionReceived) => {

  let addToAction = new NotificationAction({
    activationMode: "foreground",
    title: I18n.t('iosAction.addToCollection'),
    identifier: "instashot://singleImage/addTo"
  }, (action, completed) => {
    console.tron.log("ACTION RECEIVED");
    console.tron.log(JSON.stringify(action));

    onInteractiveActionReceived && onInteractiveActionReceived(action)
    completed();
  });

  let shareAction = new NotificationAction({
    activationMode: "foreground",
    title: I18n.t('iosAction.share'),
    identifier: "instashot://singleImage/share"
  }, (action, completed) => {
    console.tron.log("ACTION RECEIVED");
    console.tron.log(action);
    onInteractiveActionReceived && onInteractiveActionReceived(action)
    completed();
  });

  let scanAction = new NotificationAction({
    activationMode: "foreground",
    title: I18n.t('iosAction.scan'),
    authenticationRequired: true,
    identifier: "instashot://singleImage/scan"
  }, (action, completed) => {
    console.tron.log("ACTION RECEIVED");
    console.tron.log(action);
    onInteractiveActionReceived && onInteractiveActionReceived(action)
    completed();
  });

  let screenshotTakenCategory = new NotificationCategory({
    identifier: "screenshotTaken",
    actions: [addToAction, shareAction, scanAction],
    context: "default"
  });
  return [screenshotTakenCategory]
}

const prepare = (onInteractiveActionReceived) => {
  NotificationsIOS.requestPermissions(prepareActions(onInteractiveActionReceived));
  NotificationsIOS.consumeBackgroundQueue();
}

const setup = (onNotification) => {
  return new Promise((resolve, reject)=>{
    onPushRegistered = (deviceToken)=>{
        console.tron.display({
            name: "RECEIVED DEVICE TOKEN",
            value: deviceToken
        })
        onPushRegistered = resolve
        resolve && resolve({token:deviceToken, platform:'ios'})
    }
    onPushRegistrationFailed = (error)=>{
      console.tron.display({
            name: "REGISTER DEVICE TOKEN FAILED",
            value: error
        })
        reject && reject(error)
    }
    onNotificationReceivedForeground = (notification)=>{
      notification.foreground = true
      notification.data = notification.getData()
      notification.category = notification.getCategory()
      onNotification && onNotification(notification)
    }
    onNotificationReceivedBackground = (notification)=>{
      notification.foreground = false
      notification.data = notification.getData()
      notification.category = notification.getCategory()
      onNotification && onNotification(notification)
    }
    onNotificationOpened = (notification)=>{
      notification.userInteraction = true
      notification.data = notification.getData()
      notification.category = notification.getCategory()
      onNotification && onNotification(notification)
    }
    NotificationsIOS.addEventListener('remoteNotificationsRegistered', onPushRegistered);
    NotificationsIOS.addEventListener('remoteNotificationsRegistrationFailed', onPushRegistrationFailed);

    NotificationsIOS.addEventListener('notificationReceivedForeground', onNotificationReceivedForeground);
    NotificationsIOS.addEventListener('notificationReceivedBackground', onNotificationReceivedBackground);
    NotificationsIOS.addEventListener('notificationOpened', onNotificationOpened);
  })
}

const unload = () => {
  NotificationsIOS.removeEventListener('remoteNotificationsRegistered', onPushRegistered);
  NotificationsIOS.removeEventListener('remoteNotificationsRegistrationFailed', onPushRegistrationFailed);
  NotificationsIOS.removeEventListener('notificationReceivedForeground', onNotificationReceivedForeground);
  NotificationsIOS.removeEventListener('notificationReceivedBackground', onNotificationReceivedBackground);
  NotificationsIOS.removeEventListener('notificationOpened', onNotificationOpened);
}

const sendLocalNotification = (options) => {
  NotificationsIOS.localNotification(options)
}

const setApplicationIconBadgeNumber = (number) => {
  NotificationsIOS.setBadgesCount(number);
}

export default {
  prepare,
  setup,
  unload,
  sendLocalNotification,
  setApplicationIconBadgeNumber
}
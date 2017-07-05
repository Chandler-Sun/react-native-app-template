import { call, put } from 'redux-saga/effects'
import Immutable from 'seamless-immutable'
import PushNotification from '../../Services/PushNotification'
import AppActions from '../App'
import MixPanel from 'react-native-mixpanel'
import DeviceInfo from 'react-native-device-info'
import {Buffer} from 'buffer'

const SETTING_TUTORIAL_VIEWED = '@Settings:viewed:tutorial'
export function * startup (api, action) {
  console.tron.display({
    name: 'App Initiated!',
    preview: 'Important Messages',
    value: {
      '💃': '🙃'
    }
  })
  const {token} = action
  if(token){
    api.apiInstance.addRequestTransform((request) => {
      request.headers['Authorization'] = 'Bearer ' + token
    })
  }
  MixPanel.registerSuperProperties({
    source:'app',
    version:DeviceInfo.getReadableVersion(),
    device:DeviceInfo.getModel()
  })
  yield put(UserAuthActions.resetStatus())
  yield put(ScreenshotListActions.resetStatus())
  yield put(AppActions.endWorking())
}
export function * registerNotification(api, {deviceToken}) {
  const hexToken = new Buffer(deviceToken.token, 'hex')
  MixPanel.addPushDeviceToken(hexToken.toString('ascii'))//The native api accepts NSData only, it converts string to NSData directly.
}
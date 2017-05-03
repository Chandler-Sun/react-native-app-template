import { call, put } from 'redux-saga/effects'
import Immutable from 'seamless-immutable'
import { Actions as NavigationActions, ActionConst } from 'react-native-router-flux'
import PushNotification from '../../Services/PushNotification'
import UserAuthActions from '../UserAuth'
import MixPanel from 'react-native-mixpanel'
import DeviceInfo from 'react-native-device-info'

export function * startup (api, action) {
  console.tron.display({
    name: 'App Initiated!',
    preview: 'Important Messages',
    value: {
      '💃': '🙃'
    }
  })

  let redirectView = 'splashView'
  const {token, user, options = {}} = action
  if(token){
    redirectView = 'homeView'
    api.apiInstance.addRequestTransform((request) => {
      request.headers['Authorization'] = 'bearer ' + token
    })
    var guessFirstname = user.fullname.split(' ')[0]
  }
  MixPanel.registerSuperProperties({
    source:'app',
    version:DeviceInfo.getReadableVersion(),
    device:DeviceInfo.getModel()
  })
  const mergedOptions = {type: ActionConst.RESET, ...options}
  yield call(NavigationActions[redirectView], mergedOptions)
  if(token){
    yield put(UserAuthActions.registerNotification())
    //TODO: fetch list.
  }
}
import { call, put } from 'redux-saga/effects'
import UserAuthActions from '../UserAuth'
import Immutable from 'seamless-immutable'
import StartupActions from '../Startup'
import { needLogout, isResponseOK } from '../../Utils/ErrorHandler'
import MixPanel from 'react-native-mixpanel'
import TrackEvent from '../../Config/TrackEvent'

export function* registerNotification(api, {deviceToken}) {
  const response = yield call(api.registerDevice, deviceToken)
  if (isResponseOK(response)) {
    yield put(UserAuthActions.registerNotificationSuccess())
  } else {
    yield put(UserAuthActions.authFailure(response.data ? response.data.message : 'Network Error'))
  }
}

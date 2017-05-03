import { takeLatest, takeEvery } from 'redux-saga/effects'
import API from '../../Services/API'

import { ActionTypes as StartupTypes } from '../Startup'
import { ActionTypes as UserAuthTypes } from '../UserAuth'
import { startup } from './StartupSagas'
import { registerNotification } from './UserAuthSagas'
const api = API.createAPIClient()

/* ------------- Connect Types To Sagas ------------- */

export default function * root () {
  yield [
    takeLatest(StartupTypes.STARTUP, startup, api),
    takeLatest(UserAuthTypes.REQUEST_DEVICE_TOKEN_SUCCESS, registerNotification, api),
  ]
}

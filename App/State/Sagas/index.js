import { takeLatest, takeEvery } from 'redux-saga/effects'
import API from '../../Services/API'

import { ActionTypes as AppActionTypes } from '../App'
import { startup, registerNotification } from './AppSagas'


const sharedAPIClient = API.createAPIClient()

export const api = sharedAPIClient

/* ------------- Connect Types To Sagas ------------- */

export default function * root () {
  yield [
    takeLatest(AppActionTypes.STARTUP, startup, api),
    takeLatest(UserAuthActionTypes.REQUEST_DEVICE_TOKEN_SUCCESS, registerNotification, api),
  ]
}

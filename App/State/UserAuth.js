import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  requestDeviceTokenSuccess: ['deviceToken'],
  registerNotificationSuccess: ['deviceToken'],
  registerNotification: null,
  didReceiveNotification: ['notification'],
  didConsumeLastNotification: null,
  authFailure: ['error','code'],
})

export const ActionTypes = Types

//export action creators as default for easy usage. 
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  user: null,
  token: null,
  error: null,
  fetching: false,
  deviceToken: null,
  lastNotification: null,
})

/* ------------- Reducers ------------- */

export const requestDeviceTokenSuccess = (state, {deviceToken}) => {
  return state.merge({deviceToken})
}

export const registerNotification = (state) => {
  return state
}

export const registerNotificationSuccess = (state) => {
  return state
}

export const didReceiveNotification = (state, {notification}) => {
  console.tron.display({
    name: "DID RECEIVE NOTIFICATION",
    value: notification
  })
  return state.merge({lastNotification: notification})
}

export const didConsumeLastNotification = (state) => {
  return state.merge({lastNotification: null})
}

export const authFailure = (state, { error,code }) =>{
  let newState = { fetching: false, error }
  return state.merge(newState)
}
/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.REQUEST_DEVICE_TOKEN_SUCCESS]: requestDeviceTokenSuccess,
  [Types.REGISTER_NOTIFICATION]: registerNotification,
  [Types.REGISTER_NOTIFICATION_SUCCESS]: registerNotificationSuccess,
  [Types.DID_RECEIVE_NOTIFICATION]: didReceiveNotification,
  [Types.DID_CONSUME_LAST_NOTIFICATION]: didConsumeLastNotification,
  [Types.AUTH_FAILURE]: authFailure,
})

/* ------------- Selectors ------------- */

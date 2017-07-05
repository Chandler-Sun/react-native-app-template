import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import { Settings } from 'react-native'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  startup: ['user','token'],
  startWorking:['workingJobName','workingProgressData'],
  endWorking:null,
  updateSettings: ['key', 'value'],
  deviceToken: null,
  lastNotification: null,
  clearSettings:null,
  connectivityChanged: ['networkReach']
})

export const ActionTypes = Types

//export action creators as default for easy usage.
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  working: false,
  workingJobName: '',
  workingProgressData:{
    total:0,
    progress:0
  },
  networkReach:'unknown', //wifi, cell, none 
  started: false,
  settings: {
    tooltipViewedStage:0
  }
})

/* ------------- Reducers ------------- */
export const startup = (state = INITIAL_STATE) => {
  return state.merge({started:true})
}

export const connectivityChanged = (state = INITIAL_STATE, {networkReach}) => {
  return state.merge({networkReach})
}
export const startWorking = (state, {workingJobName, workingProgressData}) => {
  return state.merge({ working: true , workingJobName, workingProgressData})
}

export const endWorking = (state = INITIAL_STATE) => {
  return state.merge({ working: false , workingJobName:'', workingProgressData:''})
}

export const updateSettings = (state, {key, value}) => {
  let settings = Immutable.set(state.settings||{}, key, value)
  return state.merge({settings})
}
export const clearSettings = (state) => {
  Settings.set({
    reactotronHost:undefined,
  })
  return state.merge({settings: INITIAL_STATE.settings})
}

export const requestDeviceTokenSuccess = (state, {deviceToken}) => {
  return state.merge({deviceToken})
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

export const registerNotification = (state) => {
  return state
}

export const registerNotificationSuccess = (state) => {
  return state
}

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.REQUEST_DEVICE_TOKEN_SUCCESS]: requestDeviceTokenSuccess,
  [Types.REGISTER_NOTIFICATION]: registerNotification,
  [Types.REGISTER_NOTIFICATION_SUCCESS]: registerNotificationSuccess,
  [Types.DID_RECEIVE_NOTIFICATION]: didReceiveNotification,
  [Types.DID_CONSUME_LAST_NOTIFICATION]: didConsumeLastNotification,
  [Types.START_WORKING]: startWorking,
  [Types.END_WORKING]: endWorking,
  [Types.UPDATE_SETTINGS]: updateSettings,
  [Types.STARTUP]: startup,
  [Types.CONNECTIVITY_CHANGED]: connectivityChanged,
  [Types.CLEAR_SETTINGS]: clearSettings,
})

/* ------------- Selectors ------------- */

import MixPanel from 'react-native-mixpanel'
import ServiceConfig from '../../Config/ServiceConfig'
import _ from 'lodash'
import { ActionTypes as AppActionTypes } from '../App'

const DATA_INIT = 'persist/REHYDRATE'
export function createMixpanelMiddleware({
  token,
  selectDistinctId = () => null,
  selectUserProfileData = () => null,
  selectUserProfileDataOnce = () => null,
  selectEventName = (action) => action.type,
  selectProperties = () => null,
  ignoreAction = (action) => false,
}) {

  MixPanel.sharedInstanceWithToken(token)

  return store => next => action => {
    // Don't track falsy actions or actions that should be ignored
    if (!action.type || ignoreAction(action)) {
      return next(action)
    }

    // Get store state; select distinct id for action & state
    const state = store.getState()
    const distinctId = selectDistinctId(action, state)
    const eventName = selectEventName(action, state)
    const properties = selectProperties(action, state)

    if(distinctId){
      MixPanel.identify(distinctId)
    }
    // Track action event with Mixpanel
    MixPanel.trackWithProperties(eventName, properties)

    // Select user profile data for action; if it selects truthy data,
    // update user profile on Mixpanel
    const userProfileData = selectUserProfileData(action, state)
    const userProfileDataOnce = selectUserProfileDataOnce(action, state)
    if (userProfileData) {
      MixPanel.set(userProfileData)
    }
    if (userProfileDataOnce) {
      MixPanel.setOnce(userProfileDataOnce)
    }

    return next(action)
  }
}

// define a blacklist to be used in the ignoreAction filter
const blacklist = [
  AppActionTypes.START_WORKING,
  AppActionTypes.UPDATE_SETTINGS,
  AppActionTypes.END_WORKING,
]

export default createMixpanelMiddleware({

  // add ignore action filter
  ignoreAction: (action) => {
    return blacklist.indexOf(action.type) > -1 || action.type.indexOf('Navigation') > -1;
  },

  // Mixpanel Token
  token: ServiceConfig.MIXPANEL_TOKEN,

  // derive Mixpanel event name from action and/or state
  selectEventName: (action, state) => _.startCase(action.type),

  selectProperties: (action, state) => {
    let properties = {}
    if(action.photos){
      properties['photosCount'] = action.photos.length
    }
    return properties
  },

  // Per-action selector: Mixpanel event `distinct_id`
  selectDistinctId: (action, state) => {
    
  },

  // Per-action selector: Mixpanel Engage user profile data
  selectUserProfileData: (action, state) => {
    const user = action.user

    // Only update user profile data on UserAuthActionTypes.LOGIN_SUCCESS action type
    if (user) {
      // User data to `$set` via Mixpanel Engage request
      const userProfileData = {
        '$first_name': user.name,
        '$last_name': user.name,
        '$name': user.name,
        '$created': user.created_at,
      }
      return userProfileData
    }
  },

  // Per-action selector: Mixpanel Engage user profile set data once
  selectUserProfileDataOnce: (action, state) => {
    const user = action.user

    // Only update user profile data on UserAuthActionTypes.LOGIN_SUCCESS action type
    if (user) {
      // User data to `$set_once` via Mixpanel Engage request
      return {
        'Has Logged In': true,
      }
    }
  }
})
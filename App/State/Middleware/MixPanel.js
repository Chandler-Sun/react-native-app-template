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
  ScreenshotListActionTypes.SYNC_BATCH_SUCCESS,
  ScreenshotListActionTypes.SYNC_BATCH_FROM_LOCAL,
  ScreenshotListActionTypes.UPDATE_PHOTOS,
  ScreenshotListActionTypes.RESET_STATUS,
  AppActionTypes.START_WORKING,
  AppActionTypes.UPDATE_SETTINGS,
  AppActionTypes.END_WORKING,
  UserAuthActionTypes.RESET_STATUS,
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
    if(action.selectedPhotos){
      properties['selectedPhotosCount'] = action.selectedPhotos.length
    }
    if(action.collections){
      properties['collectionsCount'] = action.collections.length
    }
    if(action.selectedCollection){
      properties['selectedCollection'] = action.selectedCollection.name
    }
    if(action.targetCollection){
      properties['targetCollection'] = action.targetCollection.name
    }
    if(action.sourceCollection){
      properties['sourceCollection'] = action.sourceCollection.name
    }
    if(action.nameOrNewCollection){
      properties['nameOrNewCollection'] = action.nameOrNewCollection.name || action.nameOrNewCollection
    }
    return properties
  },

  // Per-action selector: Mixpanel event `distinct_id`
  selectDistinctId: (action, state) => {
    if (state.userAuth && state.userAuth.user) {
      return state.userAuth.user.uid
    } else if (UserAuthActionTypes.LOGIN_SUCCESS === action.type && action.user) {
      return action.user.uid
    }
  },

  // Per-action selector: Mixpanel Engage user profile data
  selectUserProfileData: (action, state) => {
    const user = action.user

    // Only update user profile data on UserAuthActionTypes.LOGIN_SUCCESS action type
    if ((UserAuthActionTypes.LOGIN_SUCCESS === action.type||UserAuthActionTypes.UPDATE_PROFILE === action.type) && user) {
      // User data to `$set` via Mixpanel Engage request
      const userProfileData = {
        '$first_name': user.name,
        '$last_name': user.name,
        '$name': user.name,
        '$created': user.created_at,
      }
      return userProfileData
    }
    if(DATA_INIT === action.type && action.payload && action.payload.screenshotList){
      const userData = action.payload.screenshotList
      const userProfileData = {
        'totalPhotos': userData.photos.length,
        'deletedPhotos': _.filter(userData.photos, (p)=>p.deleted).length,
        'totalCollection': userData.collections.length - 1, //exclude trash.
        'collections': JSON.stringify(_.map(userData.collections,(c)=>{return {name: c.name, count: c.photos.length}}))
      }
      return userProfileData
    }
  },

  // Per-action selector: Mixpanel Engage user profile set data once
  selectUserProfileDataOnce: (action, state) => {
    const user = action.user

    // Only update user profile data on UserAuthActionTypes.LOGIN_SUCCESS action type
    if (UserAuthActionTypes.LOGIN_SUCCESS === action.type && user) {
      // User data to `$set_once` via Mixpanel Engage request
      return {
        'Has Logged In': true,
      }
    }
  }
})
import { combineReducers } from 'redux'
import createStore from './CreateStore'
import rootSaga from './Sagas'
import {INITIAL_STATE as APP_INITIAL_STATE} from './App'

export const rootReducer = combineReducers({
    app: require('./App').reducer,
    nav: require('./Routes').reducer,
  })
export const initState = {
  app: APP_INITIAL_STATE,
}
export default () => {
  return createStore(rootReducer, rootSaga)
}

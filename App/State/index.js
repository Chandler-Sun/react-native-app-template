import { combineReducers } from 'redux'
import createStore from './CreateStore'
import rootSaga from './Sagas'

export default () => {
  const rootReducer = combineReducers({
    // routes: require('./Routes').reducer,
    userAuth: require('./UserAuth').reducer,
  })

  return createStore(rootReducer, rootSaga)
}

// integrate Redux-Saga, Reactotron, Redux-logger, ReduxPersist with Redux Store.
// Store: dispatch actions(action type and data) to reducers, then get the next state and save to store.
import { createStore, applyMiddleware, compose } from 'redux'
import AppConfig from '../Config/AppConfig'
import createLogger from 'redux-logger'
import createSagaMiddleware from 'redux-saga'
import { autoRehydrate } from 'redux-persist'
import StorePersistConfig from '../Config/StorePersistConfig'
import StorePersistService from '../Services/StorePersistService'
import mixpanelMiddleware from './Middleware/MixPanel'
import Manifest from './Manifest'
import {initState} from './'

export default (rootReducer, rootSaga) => {

  const middleware = []
  const enhancers = []

  //saga integration with Reactotron
  const sagaMonitor = AppConfig.enableReactotron ? console.tron.createSagaMonitor() : null
  //saga middleware for Redux
  const sagaMiddleware = createSagaMiddleware({ sagaMonitor })
  // const cloudSyncMiddleware = createCloudSyncMiddleware({sagaRunner:sagaMiddleware})

  middleware.push(sagaMiddleware)
  // middleware.push(cloudSyncMiddleware)
  middleware.push(mixpanelMiddleware)
  
  //redux logger
  if (AppConfig.enableReduxLogging) {
    const logger = createLogger()
  // logger should be the last item in the middleware. 
  // Due to the composing pattern, the last function will be excuted firstly so it shouldn't be able to log the event of sagaMiddleware.
    middleware.push(logger)
  }
  enhancers.push(applyMiddleware(...middleware))

  // redux store persistent
  let reducerKey = 'app'
  const migration = StorePersistService.createMigration(
    Manifest,reducerKey
  )
  enhancers.push(migration)
  enhancers.push(autoRehydrate())

  // use Reactotron to create the store.
  const createAppropriateStore = AppConfig.enableReactotron ? console.tron.createStore : createStore
  const store = createAppropriateStore(rootReducer, initState, compose(...enhancers))

  // configure persistStore and check reducer version number
  if (StorePersistConfig.enabled) {
    StorePersistService.updateReducers(store)
  }
  // kick off root saga
  sagaMiddleware.run(rootSaga)

  return store
}
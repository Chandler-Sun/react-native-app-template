import StorePersistConfig from '../Config/StorePersistConfig'
import { AsyncStorage } from 'react-native'
import { persistStore } from 'redux-persist'
import AppActions from '../State/App'
import Immutable from 'seamless-immutable'

import { REHYDRATE } from 'redux-persist/constants'

const processKey = (key) => {
  let int = parseInt(key)
  if (isNaN(int)) throw new Error('redux-persist-migrate: migrations must be keyed with integer values')
  return int
}

const createMigration = (manifest, versionSelector, versionSetter) => {
  if (typeof versionSelector === 'string') {
    let reducerKey = versionSelector
    versionSelector = (state) => state && state[reducerKey] && state[reducerKey].version
    versionSetter = (state, version) => {
      if (['undefined', 'object'].indexOf(typeof state[reducerKey]) === -1) {
        console.error('redux-persist-migrate: state for versionSetter key must be an object or undefined')
        return state
      }
      state[reducerKey] = state[reducerKey] || {}
      state[reducerKey] = Immutable.set(state[reducerKey],'version', version)
      return state
    }
  }

  const versionKeys = Object.keys(manifest).map(processKey).sort((a, b) => a - b)
  let currentVersion = versionKeys[versionKeys.length - 1]
  if (!currentVersion) currentVersion = -1

  const migrationDispatch = (next) => (action) => {
    if (action.type === REHYDRATE) {
      const incomingState = action.payload
      let incomingVersion = parseInt(versionSelector(incomingState))
      if (isNaN(incomingVersion)) incomingVersion = null

      if (incomingVersion !== currentVersion) {
        const migratedState = migrate(incomingState, incomingVersion)
        action.payload = migratedState
        console.tron.display({
          name: 'MIGRATED',
          value: {
            'Old Version:': incomingVersion,
            'New Version:': currentVersion
          },
          preview: 'State Manifest Migrated',
          important: true
        })
      }
    }
    return next(action)
  }

  const migrate = (state, version) => {
    if (version != null) {
      versionKeys
        .filter((v) => v > version)
        .forEach((v) => { state = manifest[v](state) })
    }
    state = versionSetter(state, currentVersion)
    return state
  }

  return (next) => (reducer, initialState, enhancer) => {
    var store = next(reducer, initialState, enhancer)
    return {
      ...store,
      dispatch: migrationDispatch(store.dispatch)
    }
  }
}

export const updateReducers = (store) => {
  const reducerVersion = StorePersistConfig.reducerVersion
  const config = StorePersistConfig.storeConfig
  const startup = (err, restoredState) => {
    const { user, token } = restoredState.userAuth || {}
    store.dispatch(AppActions.startup(user, token))
  }

  // Check to ensure latest reducer version
  AsyncStorage.getItem('reducerVersion').then((localVersion) => {
    if (localVersion !== reducerVersion) {
      console.tron.display({
        name: 'PURGE',
        value: {
          'Old Version:': localVersion,
          'New Version:': reducerVersion
        },
        preview: 'Reducer Version Change Detected',
        important: true
      })
      // Purge store
      persistStore(store, config, startup).purge()
      AsyncStorage.setItem('reducerVersion', reducerVersion)
    } else {
      persistStore(store, config, startup)
    }
  }).catch(() => {
    persistStore(store, config, startup)
    AsyncStorage.setItem('reducerVersion', reducerVersion)
  })
}

export default {
  createMigration,
  updateReducers
}
import StorePersistConfig from '../Config/StorePersistConfig'
import { AsyncStorage } from 'react-native'
import { persistStore } from 'redux-persist'
import StartupActions from '../State/Startup'

const updateReducers = (store) => {
  const reducerVersion = StorePersistConfig.reducerVersion
  const config = StorePersistConfig.storeConfig
  const startup = (err, restoredState) => {
    const {token,user} = restoredState.userAuth || {}
    store.dispatch(StartupActions.startup(token, user))
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

export default {updateReducers}

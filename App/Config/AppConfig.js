import { RNConfig } from 'NativeModules'
import { Settings } from 'react-native'

const BUILD_ENV = RNConfig.buildEnvironment || 'Release'

const SETTINGS = {
  useMockData: false,
  enableReduxLogging: false,
  enableReactotron: __DEV__ || !!Settings.get('reactotronHost'),
  appName: 'apptemplate',
  appstoreId: 'xxxxxxxx',
  BUILD_ENV
}

export default SETTINGS

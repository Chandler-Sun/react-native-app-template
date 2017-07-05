import AppConfig from './AppConfig';

const defaultSettings = {
  MIXPANEL_TOKEN: "<placeholder>",
  ANDROID_BAIDU_PUSH_KEY:  "<placeholder>",
  WECHAT_APP_KEY: '<placeholder>',
}

const Release = defaultSettings

const Staging = Object.assign(defaultSettings, {
  MIXPANEL_TOKEN: "<placeholder>",
})

const Debug = Object.assign(Staging, {

})

const SettingsPerEnv = {
  Debug,
  Staging,
  Release,
}


const getSettings = () => {
  return SettingsPerEnv[AppConfig.BUILD_ENV]
}

const SERVICE_SETTINGS = getSettings()

export default SERVICE_SETTINGS
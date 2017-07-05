import {Settings} from 'react-native'
import {KEY_REACTOTRON_HOST} from './UserSettings'
const Host = 'localhost'
// const Host = '192.168.31.79'
// const Host = '192.168.1.103'
// const Host = '192.168.5.128'
const Port = ':1338'
const reactotronHost = Settings.get(KEY_REACTOTRON_HOST) || Host
let baseURL = `http://${Host}${Port}`
let baseAPIDomain = baseURL

export default {
  baseURL,
  baseAPIDomain,
  reactotronHost,
}

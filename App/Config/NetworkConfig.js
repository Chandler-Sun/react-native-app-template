import {Settings} from 'react-native'
const Host = 'localhost'
// const Host = '192.168.31.174'
// const Host = '192.168.1.123'
// const Host = '10.140.231.131'
const Port = ':1338'
const reactotronHost = Host
let baseURL = `http://${Host}${Port}`
let baseAPIDomain = baseURL
if(!__DEV__){
  baseURL = 'https://www.example.com'
  baseAPIDomain = 'https://api.example.com'
}
export default {
  // baseURL: 'https://www.skrap.it',
  // baseAPIDomain: 'https://api.skrap.it',
  baseURL,
  baseAPIDomain,
  reactotronHost
}
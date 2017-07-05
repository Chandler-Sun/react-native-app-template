import apisauce from 'apisauce'
import NetworkConfig from '../Config/NetworkConfig'
import AppConfig from '../Config/AppConfig'
import DeviceInfo from 'react-native-device-info'

const createAPIClient = (baseURL = NetworkConfig.baseAPIDomain) => {

  const api = apisauce.create({
    baseURL,
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type':'application/json',
      'App-Version': DeviceInfo.getReadableVersion()
    },
    timeout: 30000
  })

  if (AppConfig.enableReactotron && console.tron) {
    api.addMonitor(console.tron.apisauce)
    // if you just wanted to track on 500's
    // api.addMonitor(response => {
    //   if (response.problem === 'SERVER_ERROR')
    //     Reactotron.apisauce(response)
    // })
  }

/**
 * Get token of the CDN for each image we need to upload
 * @param {Array} keys
 */
  const getUploadTokens = (keys) => api.post('/cdn/uploader/tokens', {
    keys
  })
  /**
   * Get token of the CDN for each image we need to upload
   * @param {Array} keys
   */
  const getDownloadTokens = (keys) => api.post('/cdn/downloader/tokens', {
    keys
  })

  const registerDevice = (token) => api.post('/bookmark/message/sub', {
    deviceToken: token
  })

  return {
    registerDevice,
    getUploadTokens,
    apiInstance:api,
    getDownloadTokens,
  }
}

// let's return back our create method as the default.
export default {
  createAPIClient
}

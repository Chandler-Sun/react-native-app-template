import Immutable from 'seamless-immutable'
const Reactotron = require('reactotron-react-native').default
const errorPlugin = require('reactotron-react-native').trackGlobalErrors
const apisaucePlugin = require('reactotron-apisauce')
const { reactotronRedux } = require('reactotron-redux')
const sagaPlugin = require('reactotron-redux-saga')
import AppConfig from './AppConfig'
import NetworkConfig from './NetworkConfig'

/**
 * inject Reactotron to console.tron so you can use console.tron.log(...) anywhere.
 */
export default () => {
  if (AppConfig.enableReactotron) {
    Reactotron
    /*
      Defaut Config: {
        io: null, // the socket.io function to create a socket
        host: 'localhost', // the server to connect (required)
        port: 9090, // the port to connect (required)
        name: 'reactotron-core-client', // some human-friendly session name
        secure: false, // use wss instead of ws
        plugins: CorePlugins, // needed to make society function
        safeRecursion: true, // when on, it ensures objects are safe for transport (at the cost of CPU)
        onCommand: function onCommand(cmd) {
          return null;
        }, // the function called when we receive a command
        onConnect: function onConnect() {
          return null;
        }, // fires when we connect
        onDisconnect: function onDisconnect() {
          return null;
        } // fires when we disconnect
      }
      */
      .configure({
        name: AppConfig.appName,
        host: NetworkConfig.reactotronHost
      })
      // forward all errors to Reactotron
      .use(errorPlugin({
        // ignore all error frames from react-native
        veto: (frame) =>
          frame.fileName.indexOf('/node_modules/react-native/') >= 0
      }))

      // register apisauce so we can install a monitor later
      .use(apisaucePlugin())

      // setup the redux integration with Reactotron
      .use(reactotronRedux({
        // you can flag some of your actions as important by returning true here
        // isActionImportant: action => action.type === StartupTypes.STARTUP,

        // you can flag to exclude certain types too... especially the chatty ones
        // except: ['EFFECT_TRIGGERED', 'EFFECT_RESOLVED', 'EFFECT_REJECTED', 'persist/REHYDRATE'],

        // Fires when Reactotron uploads a new copy of the state tree.  Since our reducers are
        // immutable with `seamless-immutable`, we ensure we convert to that format.
        onRestore: state => Immutable(state)
      }))

      // register the redux-saga plugin so we can use the monitor in CreateStore.js
      .use(sagaPlugin())

      // let's connect!
      .connect()

    // Let's clear Reactotron on every time we load the app
    Reactotron.clear()

    // Totally hacky, but this allows you to not both importing reactotron-react-native
    // on every file.  This is just DEV mode, so no big deal.
    console.tron = Reactotron
  } else {
    // a mock version should you decide to leave console.tron in your codebase
    console.tron = {
      log: () => false,
      warn: () => false,
      error: () => false,
      display: () => false,
      image: () => false
    }
  }
}
// @flow
// make sure apply settings by importing this module.
import ConfigSettings from '../Config'

import React, { Component } from 'react'
import { Provider } from 'react-redux'
import '../I18n/I18n' // keep before root container
import RootContainer from './RootContainer'
import createStore from '../State'


const store = createStore()

/**
 * Provides an entry point into our application.  Both index.ios.js and index.android.js
 * call this component first.
 *2
 * We create our Redux store here, put it into a provider and then bring in our
 * RootContainer.
 *
 * We separate like this to play nice with React Native's hot reloading.
 */
class App extends Component {
  render () {
    return (
      <Provider store={store}>
        <RootContainer />
      </Provider>
    )
  }
}

export default App

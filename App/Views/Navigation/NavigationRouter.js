import {Scene, Actions, Reducer, Router, Modal} from 'react-native-router-flux';
import React, { Component,PropTypes } from 'react';
import {Navigator} from 'react-native'
import Immutable from 'seamless-immutable'

import HomeView from '../HomeView'
import SettingView from '../SettingView'
import SplashView from '../SplashView'

import {customAnimationUpDown} from '../../Utils/Animations'

//Wrap the router default reducer to log the event.
const createReducer = params=>{
    const defaultReducer = Reducer(params);
    return (state, action)=>{
        let { key, type, scene } = action
        if (scene) {
          let { sceneKey, name, parent } = scene || {}
          console.tron.display({
            name: 'NAVIGATION',
            value: { key, type, sceneKey, name, parent},
            preview: sceneKey || key,
          })
        }
        return defaultReducer(state, action);
    }
};


class NavigationRouter extends Component {
  render () {
    return (
      <Router createReducer={createReducer}>
        <Scene key="root">
          <Scene initial key="splashView" hideNavBar component={SplashView} />
          <Scene key="homeView" direction="horizontal" component={HomeView}/>
          <Scene key="settingView" component={SettingView} />
        </Scene>
      </Router>
    )
  }
}

export default NavigationRouter

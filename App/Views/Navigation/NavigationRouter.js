import React, { Component,PropTypes } from 'react';
import {Settings, View, Text, Animated, Easing, Platform} from 'react-native'
import Immutable from 'seamless-immutable'
import I18n from 'react-native-i18n'

import TestView from '../TestView'
import renderIf from '../../Utils/Visibility'
import { Icon } from 'native-base'
import { TabNavigator, StackNavigator, NavigationActions, TabBarBottom } from "react-navigation"
import TransitionInterpolator from './TransitionInterpolator'

const tabsSettings = (navigation) => {
  let {params = {} } = navigation.state
  return  [{
    tabBarLabel: I18n.t('Screenshot'),
    tabBarIcon: ({ tintColor, focused }) => (
      <Icon
        name={focused ? 'ios-photos' : 'ios-photos-outline'}
        style={{ color: tintColor }}
      />
    ),
    tabBarVisible: params.tabBarVisible
  },
  {
    tabBarLabel: I18n.t('Collection'),
    tabBarIcon: ({ tintColor, focused }) => (
      <Icon
        name={focused ? 'ios-albums' : 'ios-albums-outline'}
        style={{ color: tintColor }}
      />
    ),
    tabBarVisible: params.tabBarVisible
  }
]}

export default AppNavigator = StackNavigator({
  test: { 
    screen: TestView, 
    navigationOptions: { header: null }  
  },
}, 
//navigator options
{
  cardStyle: {backgroundColor:'#fff'},
  transitionConfig: ()=>{
    return {
      screenInterpolator: TransitionInterpolator.forVertical
    }
  }
});

const navigateOnce = (getStateForAction) => (action, state) => {
  const {type, routeName} = action;
  return (
    state &&
    type === NavigationActions.NAVIGATE &&
    routeName === state.routes[state.routes.length - 1].routeName
  ) ? null : getStateForAction(action, state);
};

AppNavigator.router.getStateForAction = navigateOnce(AppNavigator.router.getStateForAction);
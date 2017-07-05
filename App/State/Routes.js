/**
 * Not In Use
 */

import { NavigationActions } from 'react-navigation'
import Immutable from 'seamless-immutable'
import { createReducer, createActions } from 'reduxsauce'
import AppNavigator from '../Views/Navigation/NavigationRouter'


export const INITIAL_STATE = {

}

export default Creators = NavigationActions

export const reducer = (state, action) => {
  const nextState = AppNavigator.router.getStateForAction(action, state);

  // Simply return the original `state` if `nextState` is null or undefined.
  return nextState || state;
};
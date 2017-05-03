/**
 * Not In Use
 */

import { Actions as NavigationActions, ActionConst } from 'react-native-router-flux';
import Immutable from 'seamless-immutable'
import { createReducer, createActions } from 'reduxsauce'

const INITIAL_STATE = Immutable({
  scene: {},
})

export default Creators = NavigationActions

export const ActionTypes = ActionConst

export const defaultTransition = (state, action) => 
  state.merge({ scene: action.scene })

export const reducer = createReducer(INITIAL_STATE, {
  [ActionConst.JUMP]: defaultTransition,
  [ActionConst.PUSH]: defaultTransition,
  [ActionConst.REPLACE]: defaultTransition,
  [ActionConst.BACK]: defaultTransition,
  [ActionConst.BACK_ACTION]: defaultTransition,
  [ActionConst.POP_AND_REPLACE]: defaultTransition,
  [ActionConst.POP_TO]: defaultTransition,
  [ActionConst.REFRESH]: defaultTransition,
  [ActionConst.RESET]: defaultTransition,
  [ActionConst.FOCUS]: defaultTransition
})

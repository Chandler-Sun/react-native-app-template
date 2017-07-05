import Immutable from 'seamless-immutable'

export const INITIAL_STATE = Immutable({
  userAuth: {},
  screenshotList: {},
  app: {}
})

const STATE_MANIFEST = {
 1: (state) => {
   return {...state, app: { version: 1, settings: {} }}
 },
 2: (state) => {
   //convert collections to be keyed collections?
   return {...state}
 }
}

export default STATE_MANIFEST
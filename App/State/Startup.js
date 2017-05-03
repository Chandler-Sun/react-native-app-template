import { createActions } from 'reduxsauce'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  startup: ['token','user','options']
})

export const ActionTypes = Types
export default Creators

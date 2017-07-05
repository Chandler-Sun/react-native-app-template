import immutablePersistenceTransform from '../Services/ImmutablePersistenceTransform'
import { AsyncStorage } from 'react-native'

const STORE_PERSIST = {
  enabled: true,
  reducerVersion: '1.0.0',
  storeConfig: {
    storage: AsyncStorage,
    blacklist: ["nav"], // reducer keys that you do NOT want stored to persistence here
    // whitelist: [], Optionally, just specify the keys you DO want stored to
    // persistence. An empty array means 'don't store any reducers' -> infinitered/ignite#409
    transforms: [immutablePersistenceTransform]
  }
}

export default STORE_PERSIST

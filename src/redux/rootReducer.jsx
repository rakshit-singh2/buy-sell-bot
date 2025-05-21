import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/auth';
import chainReducer from './slices/chain';

// ----------------------------------------------------------------------

const rootPersistConfig = {
  key: 'root',
  storage,
  keyPrefix: 'redux-',
};

const rootReducer = combineReducers({
  auth: authReducer,
  chain: chainReducer,
});

export { rootPersistConfig, rootReducer };

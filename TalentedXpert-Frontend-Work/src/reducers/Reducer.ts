import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './AuthSlice';
import userReducer from './UserSlice';
import accessReducer from './AccessSlice';
import threadReducer from './ThreadSlice'
import countriesReducer from './CountriesSlice'
import loadingReducer from './LoadingSlice';
import callReducer from './CallSlice';


const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  access: accessReducer,
  thread: threadReducer,
  countries: countriesReducer,
  loadingRoute: loadingReducer,
  call: callReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
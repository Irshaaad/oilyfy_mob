import {combineReducers} from '@reduxjs/toolkit';
import {authApis} from '../apis/auth';
import generalSlice from './generalSlice';
import userSlice from './userSlice';
import { schedulesApis } from '../apis/schedules';

export const allReducers = combineReducers({
  generalSlice,
  userSlice,
  [authApis.reducerPath]: authApis.reducer,
  [schedulesApis.reducerPath]: schedulesApis.reducer,
});

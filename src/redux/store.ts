import {configureStore} from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import {allReducers} from './reducers';
import persistStore from 'redux-persist/es/persistStore';
import {authApis} from './apis/auth';
import {reduxPersistStorage} from './mmkv-middleware';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {schedulesApis} from './apis/schedules';

const persistConfig = {
  key: 'root',
  storage: reduxPersistStorage,
  whitelist: ['user', 'userSlice', 'generalSlice'],
};
const rootReducer = (state: any, action: any) => {
  if (action.type === 'LOGOUT') {
    return allReducers(undefined, action);
  }

  return allReducers(state, action);
};

export const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(authApis.middleware)
      .concat(schedulesApis.middleware),
});

export const persistor = persistStore(store);

export default persistedReducer;

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

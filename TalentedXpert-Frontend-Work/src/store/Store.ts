
import { configureStore } from '@reduxjs/toolkit';
import Reducer from '../reducers/Reducer';
import { useDispatch } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist'
import storage from './storage';

let store:any;

const persistConfig = { // configuration object for redux-persist
  key: 'root',
  storage, // define which storage to use
}

const persistedReducer = persistReducer(persistConfig, Reducer)

store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

(store as any).__PERSISTOR = persistStore(store);

type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export {store};

export type RootState = ReturnType<typeof store.getState>
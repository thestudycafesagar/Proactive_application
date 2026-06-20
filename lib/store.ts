import { configureStore } from '@reduxjs/toolkit';
import { applicationApi } from './services/api';

export const store = configureStore({
  reducer: {
    [applicationApi.reducerPath]: applicationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(applicationApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

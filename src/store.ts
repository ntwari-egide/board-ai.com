import { configureStore } from '@reduxjs/toolkit';

import genAI from './features/gen-ai';

export const store = configureStore({
  reducer: {
    // Add your feature reducers here
    genAI: genAI,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { configureStore } from '@reduxjs/toolkit';

import genAI from './features/gen-ai';
import authReducer from './store/slices/authSlice';
import personaReducer from './store/slices/personaSlice';
import conversationReducer from './store/slices/conversationSlice';

export const store = configureStore({
  reducer: {
    // Add your feature reducers here
    genAI: genAI,
    auth: authReducer,
    persona: personaReducer,
    conversation: conversationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

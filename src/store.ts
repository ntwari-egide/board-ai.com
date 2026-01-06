import { configureStore } from '@reduxjs/toolkit';

import authReducer from './store/slices/authSlice';
import conversationReducer from './store/slices/conversationSlice';
import personaReducer from './store/slices/personaSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    persona: personaReducer,
    conversation: conversationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

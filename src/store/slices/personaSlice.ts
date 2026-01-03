import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import personaService from '@/services/personaService';

import { Persona } from '@/types/api';

interface PersonaState {
  personas: Persona[];
  selectedPersonas: string[];
  loading: boolean;
  error: string | null;
}

const initialState: PersonaState = {
  personas: [],
  selectedPersonas: ['pm', 'developer', 'marketing', 'ux', 'qa'],
  loading: false,
  error: null,
};

// Async thunks
export const fetchPersonas = createAsyncThunk(
  'persona/fetchPersonas',
  async (_, { rejectWithValue }) => {
    try {
      const personas = await personaService.getAllPersonas();
      return personas;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch personas'
      );
    }
  }
);

export const fetchPersonaById = createAsyncThunk(
  'persona/fetchPersonaById',
  async (id: string, { rejectWithValue }) => {
    try {
      const persona = await personaService.getPersonaById(id);
      return persona;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch persona'
      );
    }
  }
);

// Slice
const personaSlice = createSlice({
  name: 'persona',
  initialState,
  reducers: {
    togglePersona: (state, action: PayloadAction<string>) => {
      const personaId = action.payload;
      const index = state.selectedPersonas.indexOf(personaId);

      if (index > -1) {
        state.selectedPersonas.splice(index, 1);
      } else {
        state.selectedPersonas.push(personaId);
      }
    },
    setSelectedPersonas: (state, action: PayloadAction<string[]>) => {
      state.selectedPersonas = action.payload;
    },
    clearSelectedPersonas: (state) => {
      state.selectedPersonas = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all personas
    builder
      .addCase(fetchPersonas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPersonas.fulfilled,
        (state, action: PayloadAction<Persona[]>) => {
          state.loading = false;
          state.personas = action.payload;
        }
      )
      .addCase(fetchPersonas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch persona by ID
    builder
      .addCase(fetchPersonaById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPersonaById.fulfilled,
        (state, action: PayloadAction<Persona>) => {
          state.loading = false;
          const existingIndex = state.personas.findIndex(
            (p) => p.id === action.payload.id
          );
          if (existingIndex > -1) {
            state.personas[existingIndex] = action.payload;
          } else {
            state.personas.push(action.payload);
          }
        }
      )
      .addCase(fetchPersonaById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  togglePersona,
  setSelectedPersonas,
  clearSelectedPersonas,
  clearError,
} = personaSlice.actions;

export default personaSlice.reducer;

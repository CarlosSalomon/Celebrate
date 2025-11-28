import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, 
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false; 
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.error = action.payload;
      state.isLoading = false; 
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false; 
    },
    // --- NUEVA ACCIÓN AGREGADA ---
    updateUserProfile: (state, action) => {
        // action.payload traerá algo como { displayName: 'Nuevo Nombre', photoURL: '...' }
        if (state.user) {
            state.user = { ...state.user, ...action.payload };
        }
    }
    // -----------------------------
  },
});

// Exportamos la nueva acción para poder usarla
export const { setLoading, loginSuccess, loginFailure, logout, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
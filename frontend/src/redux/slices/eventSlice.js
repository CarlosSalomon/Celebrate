import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  events: [],       // Aquí se guardará la lista de eventos
  loading: false,   // Para mostrar el circulito de carga
  error: null,
};

export const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    // Acción para indicar que empezó a cargar
    setEventsLoading: (state) => {
      state.loading = true;
    },
    // Acción para guardar los eventos que vinieron de Firebase
    setEvents: (state, action) => {
      state.events = action.payload;
      state.loading = false;
      state.error = null;
    },
    // Acción opcional por si agregamos uno manualmente
    addEventSuccess: (state, action) => {
      state.events.push(action.payload);
      state.loading = false;
    },
    // Acción para guardar un error
    eventsFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  },
});


export const { setEventsLoading, setEvents, addEventSuccess, eventsFailure } = eventSlice.actions;


export default eventSlice.reducer;
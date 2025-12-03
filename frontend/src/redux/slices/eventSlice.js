import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  events: [],       
  loading: false,   
  error: null,
};

export const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    
    setEventsLoading: (state) => {
      state.loading = true;
    },
    
    setEvents: (state, action) => {
      state.events = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    addEventSuccess: (state, action) => {
      state.events.push(action.payload);
      state.loading = false;
    },
    
    eventsFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  },
});


export const { setEventsLoading, setEvents, addEventSuccess, eventsFailure } = eventSlice.actions;


export default eventSlice.reducer;
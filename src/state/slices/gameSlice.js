import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API_URL,
});

axiosInstance.interceptors.request.use(
    (config)=>{
        const token = sessionStorage.getItem('token');
        if(token)
            config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
)

// Thunk to fetch games by date range
export const fetchGamesByDateRange = createAsyncThunk(
  'games/fetchGamesByDateRange',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
        const params = {};

        if (startDate) params.start_date = startDate.toISOString();
        else params.start_date = null;
  
        if (endDate) params.end_date = endDate.toISOString();
        else params.end_date = null;
  
       
        const response = await axiosInstance.get('/games/by_date_range/', {
          params, // ✅ CORRECT PLACE
        });
      return response.data;
    } catch (err) {
      console.error('Fetch games error:', err.response?.data);
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch games');
    }
  }
);

// Redux slice
const gamesSlice = createSlice({
  name: 'games',
  initialState: {
    games: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearGames: (state) => {
      state.games = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGamesByDateRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGamesByDateRange.fulfilled, (state, action) => {
        state.loading = false;
        state.games = action.payload;
      })
      .addCase(fetchGamesByDateRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch games';
        state.games = [];
      });
  },
});

export const { clearGames } = gamesSlice.actions;
export default gamesSlice.reducer;
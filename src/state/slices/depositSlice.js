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

export const fetchSantimDepositsByDateRange = createAsyncThunk(
  'santimDeposits/fetchSantimDepositsByDateRange',
  async ({ startDate, endDate, skip = 0, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = { skip, limit };
      if (startDate) params.start_date = startDate.toISOString();
      if (endDate) params.end_date = endDate.toISOString();

      const response = await axiosInstance.get('/santim_deposit/request/by_date_range/', {
        params,
      });
      return response.data;
    } catch (err) {
      console.error('Fetch santim deposits error:', err.response?.data);
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch deposits');
    }
  }
);

export const fetchSantimDepositStatusesByDateRange = createAsyncThunk(
  'santimDepositStatuses/fetchSantimDepositStatusesByDateRange',
  async ({ startDate, endDate, skip = 0, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = { skip, limit };
      if (startDate) params.start_date = startDate.toISOString();
      if (endDate) params.end_date = endDate.toISOString();

      const response = await axiosInstance.get('/santim_deposit/status/by_date_range/', {
        params,
      });
      return response.data;
    } catch (err) {
      console.error('Fetch santim deposit statuses error:', err.response?.data);
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch deposit statuses');
    }
  }
);

const santimDepositSlice = createSlice({
  name: 'santimDeposits',
  initialState: {
    depositRequests: [],
    depositStatuses: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearDeposits: (state) => {
      state.depositRequests = [];
      state.depositStatuses = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSantimDepositsByDateRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSantimDepositsByDateRange.fulfilled, (state, action) => {
        state.loading = false;
        state.depositRequests = action.payload;
      })
      .addCase(fetchSantimDepositsByDateRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch deposits';
        state.depositRequests = [];
      })
      .addCase(fetchSantimDepositStatusesByDateRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSantimDepositStatusesByDateRange.fulfilled, (state, action) => {
        state.loading = false;
        state.depositStatuses = action.payload;
      })
      .addCase(fetchSantimDepositStatusesByDateRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch deposit statuses';
        state.depositStatuses = [];
      });
  },
});

export const { clearDeposits } = santimDepositSlice.actions;
export default santimDepositSlice.reducer;
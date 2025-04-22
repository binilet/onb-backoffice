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


export const fetchSantimWithdrawalsByDateRange = createAsyncThunk(
  'santimWithdrawals/fetchSantimWithdrawalsByDateRange',
  async ({ startDate, endDate, skip = 0, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = { skip, limit };
      if (startDate) params.start_date = startDate.toISOString();
      if (endDate) params.end_date = endDate.toISOString();

      const response = await axiosInstance.get('/santim_withdrawals/requests/by_date_range/', {
        params,
      });
      return response.data;
    } catch (err) {
      console.error('Fetch santim withdrawals error:', err.response?.data);
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch withdrawals');
    }
  }
);

export const fetchSantimWithdrawalStatusesByDateRange = createAsyncThunk(
  'santimWithdrawals/fetchSantimWithdrawalStatusesByDateRange',
  async ({ startDate, endDate, skip = 0, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = { skip, limit };
      if (startDate) params.start_date = startDate.toISOString();
      if (endDate) params.end_date = endDate.toISOString();

      const response = await axiosInstance.get('/santim_withdrawals/statuses/by_date_range/', {
        params,
      });
      return response.data;
    } catch (err) {
      console.error('Fetch santim withdrawal statuses error:', err.response?.data);
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch withdrawal statuses');
    }
  }
);

const santimWithdrawalSlice = createSlice({
  name: 'santimWithdrawals',
  initialState: {
    withdrawals: {
      data: [],
      loading: false,
      error: null,
    },
    statuses: {
      data: [],
      loading: false,
      error: null,
    },
  },
  reducers: {
    clearWithdrawals: (state) => {
      state.withdrawals.data = [];
      state.withdrawals.error = null;
      state.withdrawals.loading = false;
    },
    clearStatuses: (state) => {
      state.statuses.data = [];
      state.statuses.error = null;
      state.statuses.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSantimWithdrawalsByDateRange.pending, (state) => {
        state.withdrawals.loading = true;
        state.withdrawals.error = null;
      })
      .addCase(fetchSantimWithdrawalsByDateRange.fulfilled, (state, action) => {
        state.withdrawals.loading = false;
        state.withdrawals.data = action.payload;
      })
      .addCase(fetchSantimWithdrawalsByDateRange.rejected, (state, action) => {
        state.withdrawals.loading = false;
        state.withdrawals.error = action.payload || 'Failed to fetch withdrawals';
        state.withdrawals.data = [];
      })
      .addCase(fetchSantimWithdrawalStatusesByDateRange.pending, (state) => {
        state.statuses.loading = true;
        state.statuses.error = null;
      })
      .addCase(fetchSantimWithdrawalStatusesByDateRange.fulfilled, (state, action) => {
        state.statuses.loading = false;
        state.statuses.data = action.payload;
      })
      .addCase(fetchSantimWithdrawalStatusesByDateRange.rejected, (state, action) => {
        state.statuses.loading = false;
        state.statuses.error = action.payload || 'Failed to fetch withdrawal statuses';
        state.statuses.data = [];
      });
  },
});

export const { clearWithdrawals, clearStatuses } = santimWithdrawalSlice.actions;
export default santimWithdrawalSlice.reducer;
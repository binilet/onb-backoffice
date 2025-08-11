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

axios.interceptors.response.use(
    (response) => { 
      if (response.status === 401) {
        sessionStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject({ message: 'Unauthorized' });
      }
      return response;
    });


export const fetchWithdrawalRequestByDateRange = createAsyncThunk(
  'withdrawals/fetchWithdrawalsByDateRange',
  async ({ startDate, endDate, skip = 0, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = { skip, limit };
      if (startDate) params.start_date = startDate.toISOString();
      if (endDate) params.end_date = endDate.toISOString();

      //santim_withdrawals/requests/by_date_range/
      // const response = await axiosInstance.get('/santim_withdrawals/requests/by_date_range/', {
      //   params,
      // });

      //addispay
      const response = await axiosInstance.get('/addispay_withdraw/request/by_date_range/', {
        params,
      });
      return response.data;
    } catch (err) {
      console.error('Fetch santim withdrawals error:', err.response?.data);
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch withdrawals');
    }
  }
);

export const fetchWithdrawalCallbackByDateRange = createAsyncThunk(
  'withdrawals/fetchWithdrawalCallbackByDateRange',
  async ({ startDate, endDate, skip = 0, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = { skip, limit };
      if (startDate) params.start_date = startDate.toISOString();
      if (endDate) params.end_date = endDate.toISOString();


      // const response = await axiosInstance.get('/santim_withdrawals/statuses/by_date_range/', {
      //   params,
      // });
      const response = await axiosInstance.get('/addispay_withdraw/callback/by_date_range/', {
        params,
      });
      return response.data;
    } catch (err) {
      console.error('Fetch santim withdrawal statuses error:', err.response?.data);
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch withdrawal statuses');
    }
  }
);

export const fetchWithdrawalResponseByDateRange = createAsyncThunk(
  'withdrawals/fetchWithdrawalResponseByDateRange',
  async ({ startDate, endDate, skip = 0, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = { skip, limit };
      if (startDate) params.start_date = startDate.toISOString();
      if (endDate) params.end_date = endDate.toISOString();

      const response = await axiosInstance.get('/addispay_withdraw/response/by_date_range/', {
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
    responses: {
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
    clearResponses: (state) => {
      state.responses.data = [];
      state.responses.error = null;
      state.responses.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWithdrawalRequestByDateRange.pending, (state) => {
        state.withdrawals.loading = true;
        state.withdrawals.error = null;
      })
      .addCase(fetchWithdrawalRequestByDateRange.fulfilled, (state, action) => {
        state.withdrawals.loading = false;
        state.withdrawals.data = action.payload;
      })
      .addCase(fetchWithdrawalRequestByDateRange.rejected, (state, action) => {
        state.withdrawals.loading = false;
        state.withdrawals.error = action.payload || 'Failed to fetch withdrawals';
        state.withdrawals.data = [];
      })
      .addCase(fetchWithdrawalCallbackByDateRange.pending, (state) => {
        state.statuses.loading = true;
        state.statuses.error = null;
      })
      .addCase(fetchWithdrawalCallbackByDateRange.fulfilled, (state, action) => {
        state.statuses.loading = false;
        state.statuses.data = action.payload;
      })
      .addCase(fetchWithdrawalCallbackByDateRange.rejected, (state, action) => {
        state.statuses.loading = false;
        state.statuses.error = action.payload || 'Failed to fetch withdrawal statuses';
        state.statuses.data = [];
      })
      .addCase(fetchWithdrawalResponseByDateRange.pending, (state) => {
        state.responses.loading = true;
        state.responses.error = null;
      })
      .addCase(fetchWithdrawalResponseByDateRange.fulfilled, (state, action) => {
        state.responses.loading = false;
        state.responses.data = action.payload;
      })
      .addCase(fetchWithdrawalResponseByDateRange.rejected, (state, action) => {
        state.responses.loading = false;
        state.responses.error = action.payload || 'Failed to fetch withdrawal statuses';
        state.responses.data = [];
      });
  },
});

export const { clearWithdrawals, clearStatuses,clearResponses } = santimWithdrawalSlice.actions;
export default santimWithdrawalSlice.reducer;
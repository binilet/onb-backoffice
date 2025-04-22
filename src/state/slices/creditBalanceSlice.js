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

export const fetchCreditBalancesByDateRange = createAsyncThunk(
  'creditBalances/fetchCreditBalancesByDateRange',
  async ({ startDate, endDate, skip = 0, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = { skip, limit };
      if (startDate) params.start_date = startDate.toISOString();
      if (endDate) params.end_date = endDate.toISOString();

      const response = await axiosInstance.get('/credit_balances/by_date_range/', {
        params,
      });
      return response.data;
    } catch (err) {
      console.error('Fetch credit balances error:', err.response?.data);
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch credit balances');
    }
  }
);

const creditBalanceSlice = createSlice({
  name: 'creditBalances',
  initialState: {
    balances: {
      data: [],
      loading: false,
      error: null,
    },
  },
  reducers: {
    clearBalances: (state) => {
      state.balances.data = [];
      state.balances.error = null;
      state.balances.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCreditBalancesByDateRange.pending, (state) => {
        state.balances.loading = true;
        state.balances.error = null;
      })
      .addCase(fetchCreditBalancesByDateRange.fulfilled, (state, action) => {
        state.balances.loading = false;
        state.balances.data = action.payload;
      })
      .addCase(fetchCreditBalancesByDateRange.rejected, (state, action) => {
        state.balances.loading = false;
        state.balances.error = action.payload || 'Failed to fetch credit balances';
        state.balances.data = [];
      });
  },
});

export const { clearBalances } = creditBalanceSlice.actions;
export default creditBalanceSlice.reducer;
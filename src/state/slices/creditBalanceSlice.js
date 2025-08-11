import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API_URL,
});

axios.interceptors.response.use(
    (response) => { 
      if (response.status === 401) {
        sessionStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject({ message: 'Unauthorized' });
      }
      return response;
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


export const fetchCreditBalancesByPhoneNumber = createAsyncThunk(
  'creditBalances/fetchCreditBalancesByPhoneNumber',
  async ({ phone }, { rejectWithValue }) => {
    try {
      const params = { phone };
      const response = await axiosInstance.get('/credit_balances/by_phone_number/', {
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
    balanceByPhone:{
      data: null,
      loading: false,
      error: null,
    }
  },
  reducers: {
    clearBalances: (state) => {
      state.balances.data = [];
      state.balances.error = null;
      state.balances.loading = false;
    },
    clearBalanceByPhone: (state) => {
      state.balanceByPhone.data = null;
      state.balanceByPhone.error = null;
      state.balanceByPhone.loading = false;
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
      })
      .addCase(fetchCreditBalancesByPhoneNumber.pending, (state) => {
        state.balanceByPhone.loading = true;
        state.balanceByPhone.error = null;
      }).addCase(fetchCreditBalancesByPhoneNumber.fulfilled, (state, action) => {
        state.balanceByPhone.loading = false;
        state.balanceByPhone.data = action.payload;
      })
      .addCase(fetchCreditBalancesByPhoneNumber.rejected, (state, action) =>  {
        state.balanceByPhone.loading = false;
        state.balanceByPhone.error = action.payload || 'Failed to fetch credit balances by phone number';
        state.balanceByPhone.data = null;
      })
  },
});

export const { clearBalances,clearBalanceByPhone} = creditBalanceSlice.actions;
export default creditBalanceSlice.reducer;
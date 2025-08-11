import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
  }
);

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token)
      config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Async thunk for fetching transactions
export const fetchManualWithdrawRequests = createAsyncThunk(
  'manualWithdrawl/fetchManualWithdrawRequests',
  async (filters = {}, { rejectWithValue }) => {
    try {
      // Build query parameters from filters
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.phone) queryParams.append('phone', filters.phone);
        const params = {startDate:filters.startDate,endDate:filters.endDate,phone:filters.phone}

      const response = await axiosInstance.get('/manual-withdraws/requests', { params });

      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating transaction approval
export const updateTransactionApproval = createAsyncThunk(
  'manualWithdrawl/approveWitdrawl',
  async ({ id,telebirrReferencedata }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.patch(`/manual-withdraws/requests/${id}/approve?telebirrReference=${telebirrReferencedata}`);
        return { id,telebirrReferencedata , ...response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const manualWithdrawSlice = createSlice({
  name: 'manualWithdraws',
  initialState: {
    data: [],
    loading: false,
    error: null,
    filters: {
      startDate: '',
      endDate: '',
      phone: ''
    },
    summary: {
      totalRequested: 0,
      totalApproved: 0,
      totalPending: 0,
      totalAmount: 0,
      approvedAmount: 0,
      pendingAmount: 0
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        startDate: '',
        endDate: '',
        phone: ''
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    updateTransactionLocal: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.data.findIndex(transaction => transaction._id === id);
      if (index !== -1) {
        state.data[index] = { ...state.data[index], ...updates };
        // Recalculate summary
        state.summary = calculateSummary(state.data);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchManualWithdrawRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManualWithdrawRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.summary = calculateSummary(action.payload);
      })
      .addCase(fetchManualWithdrawRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update transaction approval
      .addCase(updateTransactionApproval.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransactionApproval.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.findIndex(transaction => transaction._id === action.payload.id);
        if (index !== -1) {
          state.data[index].approved = true;
          state.data[index].reference = action.payload.telebirrReferencedata;
          state.summary = calculateSummary(state.data);
        }
      })
      .addCase(updateTransactionApproval.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Helper function to calculate summary statistics
const calculateSummary = (transactions) => {
  return transactions.reduce((summary, transaction) => {
    summary.totalRequested += 1;
    summary.totalAmount += transaction.amount;
    
    if (transaction.approved) {
      summary.totalApproved += 1;
      summary.approvedAmount += transaction.amount;
    } else {
      summary.totalPending += 1;
      summary.pendingAmount += transaction.amount;
    }
    
    return summary;
  }, {
    totalRequested: 0,
    totalApproved: 0,
    totalPending: 0,
    totalAmount: 0,
    approvedAmount: 0,
    pendingAmount: 0
  });
};

export const { setFilters, clearFilters, clearError, updateTransactionLocal } = manualWithdrawSlice.actions;

export default manualWithdrawSlice.reducer;
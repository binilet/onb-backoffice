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

// 🔶 Fetch manual deposits
export const fetchManualDeposits = createAsyncThunk(
  'manualDeposits/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/manual-deposits/requests', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Fetch failed' });
    }
  }
);

// 🔶 Approve manual deposit
export const approveManualDeposit = createAsyncThunk(
  'manualDeposits/approve',
  async (depositId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/manual-deposits/requests/${depositId}/approve`);
      return { id: depositId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Approval failed' });
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  approving: false,
  approvalMessage: '',
};

const manualDepositSlice = createSlice({
  name: 'manualDeposits',
  initialState,
  reducers: {
    clearApprovalState: (state) => {
      state.approving = false;
      state.approvalMessage = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch deposits
      .addCase(fetchManualDeposits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManualDeposits.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchManualDeposits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Fetch error';
      })

      // approve deposit
      .addCase(approveManualDeposit.pending, (state) => {
        state.approving = true;
        state.approvalMessage = '';
      })
      .addCase(approveManualDeposit.fulfilled, (state, action) => {
        state.approving = false;
        state.approvalMessage = action.payload.message || 'Approved';
        const index = state.items.findIndex(item => item._id === action.payload.id);
        if (index !== -1) {
          state.items[index].processed = true;
        }
      })
      .addCase(approveManualDeposit.rejected, (state, action) => {
        state.approving = false;
        state.approvalMessage = action.payload?.message || 'Approval failed';
      });
  },
});

export const { clearApprovalState } = manualDepositSlice.actions;
export default manualDepositSlice.reducer;






import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { all } from 'axios';

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

export const fetchWinningDistributions = createAsyncThunk(
  'winnings/fetchDistributions',
  async ({gameId,redistribute}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/games/distribute_winnings', {
        params: { game_id: gameId,redistribute },
      });
      
      return response.data;
    } catch (error) {
        console.log(error);
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

export const fetchDistributionSummary = createAsyncThunk(
  'winnings/fetchDistributionSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/games/winning_summary', {});
      return response.data;
    } catch (error) {
        console.log(error);
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

export const fetchDistributionByDateRange = createAsyncThunk(
  'winnings/fetchDistributionByDateRange',
  async ({start,end,phone}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/games/winning_distribution', {
        params: { start_date:start, end_date:end,phone },
      });
      
      return response.data;
    } catch (error) {
        console.log(error);
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

const winningsSlice = createSlice({
  name: "winnings",
  initialState: {
    
    distributions: [],//this is for a single game
    distributionSummary:[],
    allDistributions: [],//this is for all games
    
    loading: false,
    error: null,
  },
  reducers: {
    resetDistributions: (state) => {
      state.distributions = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWinningDistributions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWinningDistributions.fulfilled, (state, action) => {
        state.loading = false;
        state.distributions = action.payload;
      })
      .addCase(fetchWinningDistributions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //summary
      .addCase(fetchDistributionSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDistributionSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.distributionSummary = action.payload;
      })
      .addCase(fetchDistributionSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //distribution by date range
      .addCase(fetchDistributionByDateRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDistributionByDateRange.fulfilled, (state, action) => {
        state.loading = false;
        state.allDistributions = action.payload;
      })
      .addCase(fetchDistributionByDateRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
      

  },
});

export const selectWinningDistributions = (state) => state.winningDistributions.distributions;
export const selectSummaryDistributions = (state) => state.winningDistributions.distributionSummary;
export const selectWinningDistributionsByRange = (state) => state.winningDistributions.allDistributions;

export const selectWinningsLoading = (state) => state.winningDistributions.loading;
export const selectWinningsError = (state) => state.winningDistributions.error;

export const { resetDistributions } = winningsSlice.actions;
export default winningsSlice.reducer;
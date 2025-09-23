import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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

// Async Thunks for fetching, saving, and updating patterns
export const fetchPatterns = createAsyncThunk('patterns/fetchPatterns', async (_,thunkAPI) => {
  try {
    const response = await axiosInstance.get('/auto/patterns/');
    return response.data;
  } catch (error) {
    thunkAPI.rejectWithValue(error);
  }
});

export const savePattern = createAsyncThunk('patterns/savePattern', async (pattern, thunkAPI) => {
  try {
    const response = await axiosInstance.post('/auto/patterns/', pattern);
    return response.data;
  } catch (error) {
    thunkAPI.rejectWithValue(error);
  }
});

export const updatePattern = createAsyncThunk('patterns/updatePattern', async (pattern,thunkAPI) => {
  try {
    const response = await axiosInstance.put(`/auto/patterns/${pattern.id}`, pattern);
    return response.data;
  } catch (error) {
     thunkAPI.rejectWithValue(error)
  }
});

const patternSlice = createSlice({
  name: 'patterns',
  initialState: {
    list: [],
    status: null,
  },
  reducers:{
    resetStatus:(state,action)=>{
        state.status = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatterns.fulfilled, (state, action) => {
        //console.log('fetchPatterns.fulfilled', action.payload);
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPatterns.rejected,(state,action) =>{

      })
      .addCase(fetchPatterns.pending,(state,action) =>{
        
      })
      .addCase(savePattern.fulfilled, (state, action) => {
        ////console.log('savePattern.fulfilled', action.payload);
        if (Array.isArray(state.list)) {
          state.list.push(action.payload);
        } else {
          console.error('state.list is not an array', state.list);
          state.list = [action.payload];
        }
        state.status = 'pattern saved successfully!';
      })
      .addCase(savePattern.rejected,(state,action) =>{
        //console.log('save rejected: ');
        //console.log(action.payload);
        state.status = action?.payload?.message || 'error saving pattern.';
      })
      .addCase(savePattern.pending,(state,action) =>{
        state.saved = null;
        state.status = 'saving pattern ...';
      })
      .addCase(updatePattern.fulfilled, (state, action) => {
        const index = state.list?.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          const updatedPattern = { ...action.payload }; // Create a copy to avoid modifying original
          if (!updatedPattern.isActive) {
            state.list.splice(index, 1); // Remove the pattern if it's inactive
          } else {
            state.list[index] = updatedPattern; // Update the pattern if it's active
          }
          state.status = 'Pattern updated successfully!';
        }
      })
      .addCase(updatePattern.rejected, (state, action) => {
        //console.log('update rejected: ');
        //console.log(action.payload);
        state.status = action?.payload?.message || 'error updating pattern.';
      })
      .addCase(updatePattern.pending, (state, action) => {
        state.status = 'updating pattern ...';
      });
      
  },
});

export const {resetStatus} = patternSlice.actions;
export default patternSlice.reducer;

import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API_URL,
});

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async(obj,thunkAPI )=>{
        try{
            const params = new URLSearchParams();
            params.append('grant_type','password');
            params.append('username',obj.phone);
            params.append('password',obj.password);
            const response = await axiosInstance.post
            ('/auth/login',params.toString(),{
                headers:{
                    'Content-Type':'application/x-www-form-urlencoded'
                }
            });
            

            return response.data;
        }catch(err){
            console.log(err.response?.data?.detail || 'Login Failed');
            return thunkAPI.rejectWithValue(err.response?.data?.detail || 'Login Failed');
        }
    }
);

export const fetchUserInfo = createAsyncThunk(
    'auth/fetchUserInfo',
    async (_, thunkAPI) => {
        try {
            // Get the access token from your state management
            const accessToken = sessionStorage.getItem('token'); // Example: Adjust based on your storage

            const response = await axiosInstance.get('/users/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            //console.log(response.data);
            return response.data; // This will be the UserInDB object
        } catch (error) {
           // console.log(error);
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

const authSlice = createSlice({
    name:'auth',
    initialState:{
        _current_user:null,
        token:sessionStorage.getItem('token'),
        loading:false,
        error:null
    },
    reducers:{
        logout(state){
            state._current_user = null;
            state.token = null;
            sessionStorage.removeItem('token');
        },
    },
    extraReducers:(builder)=>{
        builder.
        addCase(loginUser.pending,(state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(loginUser.fulfilled,(state,action)=>{
            
            state.loading = false;
            state.token = action.payload.access_token;
            sessionStorage.setItem('token', action.payload.access_token);

            // Fetch user info after login
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            console.log(action.payload);
          })
          .addCase(fetchUserInfo.pending, (state) => {
            state.loading = true; // Or a separate loading state for user info
            state.error = null;
        })
        .addCase(fetchUserInfo.fulfilled, (state, action) => {
            state.loading = false;
            state._current_user = action.payload;
        })
        .addCase(fetchUserInfo.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.detail; // Or a separate error state for user info
            sessionStorage.removeItem('token'); // Clear token if fetching user info fails
        });
    }
});

export const {logout} = authSlice.actions;
export default authSlice.reducer;
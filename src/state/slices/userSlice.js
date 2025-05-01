import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
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

export const get_users_by_role_user = createAsyncThunk(
  "/users/get_users_by_role_user",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/users/all_users_by_role", {
        params: { role: 'user' },
      });
      return response.data;
    } catch (err) {
      //console.log(err);
      return thunkAPI.rejectWithValue(
        err.response?.data?.detail || "users not found!"
      );
    }
  }
);

export const get_users_by_role_agent = createAsyncThunk(
    '/users/get_users_by_role_agent',
    async(_,thunkAPI)=>{
        try{
            const response = await axiosInstance.get("/users/all_users_by_role", {
                params: { role: 'agent' },
              });
              return response.data;
        }catch(err){
            console.log(err);
            return thunkAPI.rejectWithValue(err.response?.data?.detail || 'users not found!');
        }
    }
);

export const generate_referral_link = createAsyncThunk(
  "/users/generate_referral_link",
  async (phone, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/users/generate-referral", {
        params: { phone },
      });
      return response.data.referralUrl;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Error generating referral URL');
    }
  }
);


export const updateUser = createAsyncThunk(
  "agents/updateUser",
  async ({ userId, updates }, thunkAPI) => {
    try {
      // Transform updates to match UserUpdate schema
      
      const formattedUpdates = {
        username: updates.username ?? null,
        role: updates.role ?? null,
        phone: updates.phone ?? null,
        agent_id: updates.agent_id ?? null,
        agent_percent: updates.agent_percent ?? null,
        is_active: updates.isActive ?? null, // Map isActive to is_active
        ban_until: updates.ban_until
          ? new Date(updates.ban_until).toISOString() // Convert to ISO 8601
          : null,
        verified: updates.verified ?? null,
      };

      // Remove null or undefined fields to match exclude_unset=True
      const cleanUpdates = Object.fromEntries(
        Object.entries(formattedUpdates).filter(([_, value]) => value !== null)
      );

      const response = await axiosInstance.patch(
        `/users/${userId}`,
        cleanUpdates,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (err) {
        console.log(err);
      return thunkAPI.rejectWithValue(
        err.response?.data?.detail || "Update failed"
      );
    }
  }
);

const usersSlice = createSlice({
    name:'users',
    initialState:{
        users:[],
        agents:[],
        loading:false,
        error:null,
        update_status:null,
        referralUrl:null,
        referralUrlLoading:false,
        referralUrlError:null
    },
    reducers:{
        logout(state){
            state._current_user = null;
            state.token = null;
            sessionStorage.removeItem('token');
        },
        resetStatus(state){
            state.update_status = null;
            state.error = null;
            state.loading = false;
            state.referralUrl = null;
            state.referralUrlError=null;
            state.referralUrlLoading = false;
        }
    },
    extraReducers:(builder)=>{
        builder
          .addCase(get_users_by_role_user.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(get_users_by_role_user.fulfilled, (state, action) => {
            state.loading = false;
            state.users = action.payload;
            
          })
          .addCase(get_users_by_role_user.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
          .addCase(get_users_by_role_agent.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(get_users_by_role_agent.fulfilled, (state, action) => {
            state.loading = false;
            state.agents = action.payload;
          })
          .addCase(get_users_by_role_agent.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
          .addCase(updateUser.pending, (state) => {
            state.update_status = "updating ...";
          })
          .addCase(updateUser.fulfilled, (state, action) => {
            state.update_status = "updated";
            const updatedUser = action.payload;
          
            // Check if the user exists in agents or users and determine their previous role
            const agentIndex = state.agents.findIndex((user) => user._id === updatedUser._id);
            const userIndex = state.users.findIndex((user) => user._id === updatedUser._id);
            const wasAgent = agentIndex !== -1;
            const wasUser = userIndex !== -1;
          
            // Handle role change or update
            if (updatedUser.role === "agent") {
              // If previously a user, remove from users and add to agents
              if (wasUser) {
                state.users = state.users.filter((user) => user._id !== updatedUser._id);
                state.agents = [...state.agents, updatedUser];
              } else if (wasAgent) {
                // If already an agent, update in place
                state.agents = state.agents.map((user) =>
                  user._id === updatedUser._id ? { ...user, ...updatedUser } : user
                );
              } else {
                // If not in either, add to agents
                state.agents = [...state.agents, updatedUser];
              }
            } else if (updatedUser.role === "user") {
              // If previously an agent, remove from agents and add to users
              if (wasAgent) {
                state.agents = state.agents.filter((user) => user._id !== updatedUser._id);
                state.users = [...state.users, updatedUser];
              } else if (wasUser) {
                // If already a user, update in place
                state.users = state.users.map((user) =>
                  user._id === updatedUser._id ? { ...user, ...updatedUser } : user
                );
              } else {
                // If not in either, add to users
                state.users = [...state.users, updatedUser];
              }
            }
          })
          .addCase(updateUser.rejected, (state, action) => {
            //state.update_status = "failed";
            state.error = 'failed to update user';
            //console.log(action.payload);
          })
          .addCase(generate_referral_link.pending, (state) => {
            state.referralUrlLoading = true;
            state.referralUrlError = null;
          })
          .addCase(generate_referral_link.fulfilled, (state, action) => {
            state.referralUrlLoading = false;
            state.referralUrl = action.payload;
          })
          .addCase(generate_referral_link.rejected, (state, action) => {
            state.referralUrlLoading = false;
            state.referralUrlError = action.payload;
          });
    }
});

export const { logout, resetStatus } = usersSlice.actions;
export default usersSlice.reducer;
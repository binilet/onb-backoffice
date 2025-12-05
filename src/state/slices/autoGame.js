// slices/jackpotGameSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token)
      config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

export const fetchGames = createAsyncThunk(
  'autoGame/fetch',
  async (criteria, { rejectWithValue }) => {
    try {
      if (!criteria) {
        criteria = {
          start: null,//new Date().toISOString().split('T')[0],
          end: null,//new Date().toISOString().split('T')[0],
        };
      }

      const response = await axiosInstance.get(`/autoGames/fetch-range`, { params: criteria });
      // console.log(response);
      return response.data;
    } catch (error) {
      //console.log(error);
      return rejectWithValue(error.response.data);
    }
  }
);

//create_or_update_game
export const createOrUpdateGame = createAsyncThunk(
  'autoGame/createOrUpdateGame',
  async (gameData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/autoGames/create_or_update_game`, gameData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createGame = createAsyncThunk(
  'autoGame/createGame',
  async (gameData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/autoGames/create`, gameData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateGame = createAsyncThunk(
  'autoGame/updateGame',
  async (gameData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/autoGames/update/${gameData.id}`, gameData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getOwnerStats = createAsyncThunk(
  'autoGame/getOwnerStats',
  async (criteria, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/autoGames/stats/${criteria.gameId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);


// Initial state
const initialState = {
  __jackpotGames: [],
  __game: null,
  __todayGames: [],
  __loading: false,
  __error: null,
  __saved: null,

  __purchase_game_id: null,
  __purchase_loading: null,
  __purchase_error: null,

  __users_credit: null,
  __user_credit_message: null,

  __latest_game: null,
  __latest_game_error: null,

  __last_game_info: null,
  __last_game_info_error: null,

  latestGameTime: null,
  __ownerStats: null,
  __ownerStatsLoading: false,
  __ownerStatsError: null,
};

// JackpotGame slice
const jackpotGameSlice = createSlice({
  name: 'jackpotGame',
  initialState,
  reducers: {
    clearPurchaseStatus: (state, action) => {
      state.__purchase_error = null;
      state.__purchase_game_id = null;
      state.__purchase_loading = null;
    },
    resetSaved: (state, action) => {
      state.__saved = null;
    },
    reset_purchase_states: (state, action) => {
      state.__purchase_error = null;
      state.__purchase_game_id = null;
      state.__purchase_loading = null;
    },
    setLatestGameTime(state, action) {
      state.latestGameTime = action.payload; // Update the time
    }
  },
  extraReducers: (builder) => {
    // Fetch games for today
    builder
      .addCase(fetchGames.pending, (state) => {
        state.__loading = true;
        state.__error = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.__loading = false;
        state.__error = null;


        state.__todayGames = action.payload;

        ////console.log(state.__todayGames);
      })
      .addCase(fetchGames.rejected, (state, action) => {
        //console.log(action.payload.data);
        state.__loading = false;
        state.__error = action.payload?.message;
      });

    // Create or update game
    builder
      .addCase(createGame.pending, (state) => {
        state.__loading = true;
        state.__error = null;
      })
      .addCase(createGame.fulfilled, (state, action) => {
        state.__loading = false;
        state.__saved = true;

        const updatedGame = action.payload;
        const existingGameIndex = state.__todayGames.findIndex((game) => game.gameId === updatedGame.gameId);

        if (existingGameIndex !== -1) {
          // Update existing game

          state.__todayGames = state.__todayGames.map((game) =>
            game.gameId === updatedGame.gameId ? { ...game, ...updatedGame } : { ...game }
          );
        } else {

          state.__todayGames = [...state.__todayGames, { ...updatedGame }];
        }

      }).
      addCase(createGame.rejected, (state, action) => {
        state.__loading = false;
        //console.log(action.payload);
        state.__error = action.payload?.message;
      });
    builder
      .addCase(createOrUpdateGame.pending, (state) => {
        state.__loading = true;
        state.__error = null;
      })
      .addCase(createOrUpdateGame.fulfilled, (state, action) => {
        state.__loading = false;
        state.__saved = true;

        const updatedGame = action.payload;
        const existingGameIndex = state.__todayGames.findIndex((game) => game.gameId === updatedGame.gameId);

        if (existingGameIndex !== -1) {
          // Update existing game

          state.__todayGames = state.__todayGames.map((game) =>
            game.gameId === updatedGame.gameId ? { ...game, ...updatedGame } : { ...game }
          );
        } else {

          state.__todayGames = [...state.__todayGames, { ...updatedGame }];
        }

      }).
      addCase(createOrUpdateGame.rejected, (state, action) => {
        state.__loading = false;
        //console.log(action.payload);
        state.__error = action.payload?.message;
      });
    builder
      .addCase(updateGame.pending, (state) => {
        state.__loading = true;
        state.__error = null;
      })
      .addCase(updateGame.fulfilled, (state, action) => {
        state.__loading = false;
        state.__saved = true;

        const updatedGame = action.payload;
        const existingGameIndex = state.__todayGames.findIndex((game) => game.gameId === updatedGame.gameId);

        if (existingGameIndex !== -1) {
          // Update existing game

          state.__todayGames = state.__todayGames.map((game) =>
            game.gameId === updatedGame.gameId ? { ...game, ...updatedGame } : { ...game }
          );
        } else {

          state.__todayGames = [...state.__todayGames, { ...updatedGame }];
        }

      }).
      addCase(updateGame.rejected, (state, action) => {
        state.__loading = false;
        //console.log(action.payload);
        state.__error = action.payload?.message;
      })
      .addCase(getOwnerStats.pending, (state) => {
        state.__ownerStatsLoading = true;
        state.__ownerStatsError = null;
        state.__ownerStats = null;
      })
      .addCase(getOwnerStats.fulfilled, (state, action) => {
        state.__ownerStatsLoading = false;
        state.__ownerStats = action.payload;
      })
      .addCase(getOwnerStats.rejected, (state, action) => {
        state.__ownerStatsLoading = false;
        state.__ownerStatsError = action.payload?.message;
      });

  },
});

export const { resetSaved, reset_purchase_states, setLatestGameTime } = jackpotGameSlice.actions;
export default jackpotGameSlice.reducer;

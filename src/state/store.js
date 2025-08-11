import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import gameReducer from './slices/gameSlice';
import depositReducer from './slices/depositSlice';
import withdrawlReducer from './slices/withdrawls';
import creditBalanceReducer from './slices/creditBalanceSlice';
import winningDistributionReducer from "./slices/distributionSlice";
import manualDepositReducer from './slices/manualDepositSlice';
import manualWithdrawReducer from './slices/manualWithdrawSlice';

const store = configureStore({
  reducer:{
    auth:authReducer,
    users:userReducer,
    games:gameReducer,
    deposits:depositReducer,
    withdrawals:withdrawlReducer,
    creditBalances:creditBalanceReducer,
    winningDistributions:winningDistributionReducer,
    manualDeposits: manualDepositReducer,
    manualRequests:manualWithdrawReducer
  }
});
export default store;
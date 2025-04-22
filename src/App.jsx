import React, { useState,useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // Assuming theme is created here or imported
import useMediaQuery from '@mui/material/useMediaQuery';
import CssBaseline from '@mui/material/CssBaseline'; // Keep CssBaseline at top level


// Import your components
import MainLayout from './MainLayout'; // Adjust path
import Login from './components/auth/Login';             // Adjust path
import PrivateRoute from './components/auth/PrivateRoute';   // Adjust path
import DashboardComponent from './components/dashboard'; // Adjust path
import Users from './components/Users';             // Adjust path
import Agents from './components/Agents';           // Adjust path
import Transactions from './components/Transactions'; // Adjust path
import NotFoundPage from './components/NotFoundPage'; 


import { useSelector,useDispatch } from 'react-redux'; 
import { fetchUserInfo,logout } from './state/slices/authSlice';
import GameGrid from './components/Games';
import DepositPage from './components/Deposit';
import WithdrawalPage from './components/Withdawls';
import CreditBalancePage from './components/CreditBalancePage';


// Define theme (or import it)
const theme = createTheme({
  typography: {
    fontFamily: `'Inter', sans-serif`,
  },
});

const drawerWidth = 240; // Define drawer width



const App = () => {
  const [drawerOpen, setDrawerOpen] = useState(true); // Keep drawer open by default on desktop?
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

 
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const dispatch = useDispatch();
  useEffect(() => {
    const storedToken = sessionStorage.getItem('token'); // Or your token storage method

    if (storedToken) {
      //dispatch(setAccessToken(storedToken));
      dispatch(fetchUserInfo()); // Call /me to verify and get user data
    } 
  }, [dispatch]);



 
  return (
    <ThemeProvider theme={theme}>
       <CssBaseline /> {/* Apply baseline styles globally */}
      <Router>
        <Routes>
          {/* Public route - No Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFoundPage />} />
          {/* Routes requiring MainLayout */}
          <Route
            element={
              <MainLayout
                drawerWidth={drawerWidth}
                isMobile={isMobile}
                drawerOpen={drawerOpen}
                handleDrawerToggle={handleDrawerToggle}
              />
            }
          >
            {/* Outlet will render these components within MainLayout */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <DashboardComponent />
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute>
                  <Users />
                </PrivateRoute>
              }
            />
            <Route
              path="/agents"
              element={
                <PrivateRoute>
                  <Agents />
                </PrivateRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <PrivateRoute>
                  <Transactions />
                </PrivateRoute>
              }
            />
            <Route
              path="/games"
              element={
                <PrivateRoute>
                  <GameGrid />
                </PrivateRoute>
              }
            />
            <Route
              path="/deposits"
              element={
                <PrivateRoute>
                  <DepositPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/withdrawals"
              element={
                <PrivateRoute>
                  <WithdrawalPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/credits"
              element={
                <PrivateRoute>
                  <CreditBalancePage />
                </PrivateRoute>
              }
            />
             {/* Optional: 404 page specific to the logged-in layout */}
             
          </Route>

          
          {/* Fallback 404 for any route not matched above (e.g., /foo) */}
          {/* If you place the specific 404 inside the layout route, you might not need this one,
              unless you want a different 404 style for non-app routes vs app routes. */}
          {/* <Route path="*" element={<Typography>Page Not Found (Overall)</Typography>} /> */}

        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
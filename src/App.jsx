import { lazy, Suspense, useMemo, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getPreviewUser } from './marketplace/navigation';
import { ThemeProvider } from '@mui/material/styles';
import { getAppTheme } from '../theme';
import useMediaQuery from '@mui/material/useMediaQuery';
import CssBaseline from '@mui/material/CssBaseline'; // Keep CssBaseline at top level
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';


// Import your components
import MainLayout from './MainLayout'; // Adjust path
import Login from './components/auth/Login';             // Adjust path
import ForcePasswordChange from './components/auth/ForcePasswordChange';
import PrivateRoute from './components/auth/PrivateRoute';   // Adjust path
import DashboardComponent from './components/dashboard'; // Adjust path
import Users from './components/Users';             // Adjust path
import Agents from './components/Agents';
import Admins from './components/admins';          // Adjust path
import Transactions from './components/Transactions'; // Adjust path
import NotFoundPage from './components/NotFoundPage';

import { useSelector, useDispatch } from 'react-redux';
import { fetchUserInfo, logout } from './state/slices/authSlice';
import GameGrid from './components/Games';
import DepositPage from './components/Deposit';
import WithdrawalPage from './components/Withdawls';
import CreditBalancePage from './components/CreditBalancePage';
import ManualDepositsManager from './components/ManualPay';
import ManualWithdrawManager from './components/manualWithdraw';
import HagereOnlineInvite from './components/HagereInvite';
import AuotoSettingComponent from './components/AutoSettingComponent';
import ShopList from './components/ShopList';
import StaffList from './components/StaffList';
import ShopBalance from './components/ShopBalance';
import PlayerRoomWallets from './components/PlayerRoomWallets';
import ShopGames from './components/ShopGames';
import ShopActionLog from './components/ShopActionLog';




const ShopGamesPreview = import.meta.env.DEV
  ? lazy(() => import('./components/ShopGames'))
  : null;

const MarketplacePreview = ({ component: Preview, onToggleTheme }) => {
  const location = useLocation();
  const currentUser = getPreviewUser(location.search);
  if (!currentUser) return <NotFoundPage />;
  return <Preview currentUser={currentUser} onToggleTheme={onToggleTheme} />;
};

MarketplacePreview.propTypes = {
  component: PropTypes.elementType.isRequired,
  onToggleTheme: PropTypes.func.isRequired,
};

const HomeRedirect = () => {
  const user = useSelector((state) => state.auth._current_user);
  if (user?.role === 'employee') {
    return <Navigate to="/hagere-invite" replace />;
  }
  if (user?.role === 'cashier') {
    return <Navigate to="/marketplace/games" replace />;
  }
  return <DashboardComponent />;
};

const App = () => {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem('admin-theme-mode') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  const theme = useMemo(() => getAppTheme(mode), [mode]);
  const toggleTheme = () => {
    const nextMode = mode === 'light' ? 'dark' : 'light';
    setMode(nextMode);
    try {
      localStorage.setItem('admin-theme-mode', nextMode);
    } catch {
      return;
    }
  };

  const [drawerOpen, setDrawerOpen] = useState(true); // Keep drawer open by default on desktop?
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const dispatch = useDispatch();
  const { _current_user } = useSelector((state) => state.auth);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('token'); // Or your token storage method

    if (storedToken && !_current_user) {
      //dispatch(setAccessToken(storedToken));
      dispatch(fetchUserInfo()).finally(() => setAuthInitialized(true)); // Call /me to verify and get user data
    } else {
      setAuthInitialized(true);
    }
  }, [dispatch]);


  if (!authInitialized) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Apply baseline styles globally */}
      <Router>
        <Routes>
          {/* Public route - No Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<PrivateRoute><ForcePasswordChange /></PrivateRoute>} />
          <Route path="*" element={<NotFoundPage />} />
          {/* Routes requiring MainLayout */}
          <Route
            element={
              <MainLayout
                drawerWidth={theme.layout.drawerWidth}
                isMobile={isMobile}
                drawerOpen={drawerOpen}
                handleDrawerToggle={handleDrawerToggle}
                onToggleTheme={toggleTheme}
              />
            }
          >
            {import.meta.env.DEV && (
              <>
                <Route path="/marketplace/shop-games" element={
                  <Suspense fallback={<CircularProgress />}>
                    <MarketplacePreview component={ShopGamesPreview} onToggleTheme={toggleTheme} />
                  </Suspense>
                } />
              </>
            )}
            <Route path="/marketplace/shops" element={
              <PrivateRoute allowedRoles={['system', 'agent', 'subagent']}>
                <ShopList />
              </PrivateRoute>
            } />
            <Route path="/marketplace/staff" element={
              <PrivateRoute allowedRoles={['system', 'agent', 'subagent', 'admin']}>
                <StaffList />
              </PrivateRoute>
            } />
            <Route path="/marketplace/shop-balance" element={
              <PrivateRoute allowedRoles={['system', 'agent', 'subagent', 'admin', 'cashier']}>
                <ShopBalance />
              </PrivateRoute>
            } />
            <Route path="/marketplace/player-room-wallets" element={
              <PrivateRoute allowedRoles={['system', 'agent', 'subagent', 'admin', 'cashier']}>
                <PlayerRoomWallets />
              </PrivateRoute>
            } />
            <Route path="/marketplace/games" element={<PrivateRoute allowedRoles={['system', 'agent', 'subagent', 'admin', 'cashier']}><ShopGames /></PrivateRoute>} />
            <Route path="/marketplace/action-log" element={<PrivateRoute allowedRoles={['system', 'agent', 'subagent', 'admin', 'cashier']}><ShopActionLog /></PrivateRoute>} />
            <Route
              path="/"
              element={
                <PrivateRoute allowedRoles={['system', 'agent', 'subagent', 'admin', 'cashier', 'employee']}>
                  <HomeRedirect />
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute allowedRoles={['system', 'agent', 'subagent', 'admin']}>
                  <Users />
                </PrivateRoute>
              }
            />
            <Route
              path="/admins"
              element={
                <PrivateRoute allowedRoles={['system', 'agent', 'subagent']}>
                  <Admins />
                </PrivateRoute>
              }
            />
            <Route
              path="/agents"
              element={
                <PrivateRoute allowedRoles={['system']}>
                  <Agents />
                </PrivateRoute>
              }
            />
            {/* <Route
              path="/transactions"
              element={
                <PrivateRoute>
                  <Transactions />
                </PrivateRoute>
              }
            /> */}
            <Route
              path="/games"
              element={
                <PrivateRoute allowedRoles={['system', 'agent', 'subagent', 'admin']}>
                  <GameGrid />
                </PrivateRoute>
              }
            />
            {/* <Route
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
            /> */}
            <Route
              path="/credits"
              element={
                <PrivateRoute allowedRoles={['system']}>
                  <CreditBalancePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/manual-deposits"
              element={
                <PrivateRoute allowedRoles={['system', 'employee']}>
                  <ManualDepositsManager />
                </PrivateRoute>
              }
            />
            {/* Optional: 404 page specific to the logged-in layout */}
            <Route
              path="/manual-withdraws"
              element={
                <PrivateRoute allowedRoles={['system', 'employee']}>
                  <ManualWithdrawManager />
                </PrivateRoute>
              }
            />
            <Route
              path="/hagere-invite"
              element={
                <PrivateRoute allowedRoles={['system', 'agent', 'subagent', 'admin', 'employee']}>
                  <HagereOnlineInvite />
                </PrivateRoute>
              }
            />
            <Route
              path="/auto-settings"
              element={
                <PrivateRoute allowedRoles={['system', 'employee']}>
                  <AuotoSettingComponent />
                </PrivateRoute>
              }
            />
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

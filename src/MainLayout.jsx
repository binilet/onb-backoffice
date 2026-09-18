import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import { useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import SidebarItem from './components/sidebar';
import { navigationFor, getPreviewUser } from './marketplace/navigation';

import { Avatar, Stack } from '@mui/material';

import Box from '@mui/material/Box';


// Import Icons (ensure these imports are correct)
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { LocalPolice } from '@mui/icons-material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import RsvpIcon from '@mui/icons-material/Rsvp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import LogoutIcon from '@mui/icons-material/Logout';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import CircleIcon from '@mui/icons-material/Circle';
import BusinessIcon from '@mui/icons-material/Business';
import Tooltip from '@mui/material/Tooltip';
import { logout } from './state/slices/authSlice';

const MainLayout = ({
  drawerWidth,
  isMobile,
  drawerOpen,
  handleDrawerToggle,
  onToggleTheme,
}) => {
  const theme = useTheme();
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth._current_user);
  const username = user?.username || 'Guest';
  const role = user?.role || 'No Role Assigned';
  const hasLegacyAccess = ['system', 'agent', 'admin', 'employee'].includes(user?.role);
  const avatarLetter = username.charAt(0).toUpperCase() || 'U';
  const marketplaceUser = import.meta.env.DEV ? getPreviewUser(location.search) : null;
  // const marketplaceItems = navigationFor(marketplaceUser?.role);
  const marketplaceItems = navigationFor(role);
  const isMarketplace = import.meta.env.DEV && location.pathname.startsWith('/marketplace/');
  const isDark = theme.palette.mode === 'dark';
  const themeLabel = isDark ? 'Use light theme' : 'Use dark theme';
  const legacyItems = [
    { text: 'Dashboard', to: '/', icon: QueryStatsIcon, roles: ['system', 'agent', 'admin'] },
    { text: 'Users', to: '/users', icon: PeopleAltIcon, roles: ['system', 'agent', 'admin'] },
    { text: 'Admins', to: '/admins', icon: LocalPolice, roles: ['system', 'agent'] },
    { text: 'Agents', to: '/agents', icon: GroupWorkIcon, roles: ['system'] },
    { text: 'Games', to: '/games', icon: RocketLaunchIcon, roles: ['system', 'agent', 'admin'] },
    { text: 'Invite', to: '/hagere-invite', icon: RsvpIcon, roles: ['system', 'agent', 'admin', 'employee'] },
  ];
  const financeItems = [
    { text: 'Credits', to: '/credits', icon: MonetizationOnIcon, roles: ['system'] },
    { text: 'Manual Deposits', to: '/manual-deposits', icon: AssuredWorkloadIcon, roles: ['system', 'employee'] },
    { text: 'Manual Withdraws', to: '/manual-withdraws', icon: LocalAtmIcon, roles: ['system', 'employee'] },
    { text: 'Auto Play', to: '/auto-settings', icon: SettingsSuggestIcon, roles: ['system', 'employee'] },
  ];
  const handleNavigation = (event) => {
    if (isMobile && drawerOpen && !event.defaultPrevented && event.button === 0 &&
        !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      handleDrawerToggle();
    }
  };
  const renderLegacyItem = (item) => (
    (!hasLegacyAccess || item.roles.includes(role)) && (
      <SidebarItem
        key={item.to}
        icon={<item.icon />}
        text={item.text}
        to={item.to}
        active={location.pathname === item.to}
        disabled={!hasLegacyAccess}
        onClick={handleNavigation}
      />
    )
  );
  const handleLogout = () => {
    dispatch(logout());
  };

  const drawer = (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        color: 'text.primary',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 4,
          py: 2,
          minHeight: theme.layout.topbarHeight,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          minWidth: 0,
          gap: 2.5,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{
          display: 'grid',
          placeItems: 'center',
          width: theme.layout.brandSize,
          height: theme.layout.brandSize,
          flexShrink: 0,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'surface.subtle',
        }}>
          <BusinessIcon sx={{ color: 'text.secondary', fontSize: theme.layout.navIconSize }} />
        </Box>
        <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary', minWidth: 0, overflowWrap: 'anywhere' }}>
          Hagere-Online
        </Typography>
      </Box>

      <Box
        component="nav"
        aria-label="Application navigation"
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme.palette.divider} transparent`,
          px: 3,
          py: 3,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: 3, pt: 1, pb: 2, display: 'block', fontWeight: 600, overflowWrap: 'anywhere' }}
        >
          Super Online
        </Typography>
        {legacyItems.map(renderLegacyItem)}
        {(!hasLegacyAccess || role === 'system' || role === 'employee') && (
          <>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ px: 3, pt: 3, pb: 2, mt: 3, borderTop: 1, borderColor: 'divider', display: 'block', fontWeight: 600, overflowWrap: 'anywhere' }}
            >
              Finance
            </Typography>
            {financeItems.map(renderLegacyItem)}
          </>
        )}
        {!hasLegacyAccess && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 3, py: 2, overflowWrap: 'anywhere' }}>
            Sign in with a Super Online account to access these pages.
          </Typography>
        )}
        {import.meta.env.DEV && (
          <>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ px: 3, pt: 3, pb: 2, mt: 3, borderTop: 1, borderColor: 'divider', display: 'block', fontWeight: 600, overflowWrap: 'anywhere' }}
            >
              Marketplace · Preview
            </Typography>
            {marketplaceItems.map((item) => (
              <SidebarItem
                key={item.label}
                icon={<item.icon />}
                text={item.label}
                to={item.ready && item.to ? `${item.to}${location.search}` : undefined}
                active={Boolean(item.ready && item.to && (
                  location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
                ))}
                disabled={!item.ready || !item.to}
                onClick={handleNavigation}
              />
            ))}
            
          </>
        )}
      </Box>

      <Box
        component="footer"
        sx={{
          p: 3,
          flexShrink: 0,
          minWidth: 0,
          bgcolor: 'surface.subtle',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              bgcolor: 'background.paper',
              color: 'text.primary',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              width: theme.layout.avatarSize,
              height: theme.layout.avatarSize,
              fontSize: theme.typography.h6.fontSize,
              fontWeight: 600,
            }}
          >
            {avatarLetter}
          </Avatar>
          <Box flexGrow={1} minWidth={0}>
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {username}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <CircleIcon
                sx={{ fontSize: theme.layout.statusIconSize, flexShrink: 0, color: hasLegacyAccess ? 'success.main' : 'text.disabled' }}
              />
              <Box component="span" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                {role}
              </Box>
            </Typography>
          </Box>
          <Tooltip title="Logout">
            <IconButton
              onClick={handleLogout}
              aria-label="Logout"
              sx={{
                color: 'text.secondary',
                flexShrink: 0,
                borderRadius: 1,
                width: theme.layout.touchTargetSize,
                height: theme.layout.touchTargetSize,
                '& .MuiSvgIcon-root': { fontSize: theme.layout.navIconSize },
                '&:hover': {
                  color: 'error.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minWidth: 0, minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          backgroundImage: 'none',
          boxShadow: 'none',
          borderBottom: 1,
          borderColor: 'divider',
          width: isMobile ? '100%' : `calc(100% - ${drawerOpen ? drawerWidth : 0}px)`,
          ml: isMobile ? 0 : `${drawerOpen ? drawerWidth : 0}px`,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: drawerOpen ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
          }),
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Toolbar sx={{
          minWidth: 0,
          minHeight: { xs: theme.layout.topbarHeight, sm: theme.layout.topbarHeight },
          px: { xs: 3, sm: 4 },
          gap: 3,
          '& .MuiIconButton-root': {
            width: theme.layout.touchTargetSize,
            height: theme.layout.touchTargetSize,
            flexShrink: 0,
            borderRadius: 1,
            color: 'text.secondary',
          },
          '& .MuiSvgIcon-root': { fontSize: theme.layout.navIconSize },
        }}>
          <IconButton
            color="inherit"
            aria-label={drawerOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={drawerOpen}
            edge="start"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="body2"
            component="div"
            color="text.secondary"
            sx={{ flexGrow: 1, minWidth: 0, py: 2, fontWeight: 500, overflowWrap: 'anywhere' }}
          >
            {isMarketplace
              ? `Marketplace · Preview · ${marketplaceUser?.role || 'No scope'}`
              : `Super Online · ${hasLegacyAccess ? role : 'Guest'}`}
          </Typography>
          <Tooltip title={themeLabel}>
            <IconButton color="inherit" onClick={onToggleTheme} aria-label={themeLabel}>
              {isDark ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box sx={{ width: isMobile ? 0 : drawerWidth, flexShrink: 0 }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            elevation={0}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                maxWidth: '100%',
                height: '100%',
                borderRadius: 0,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                bgcolor: 'background.paper',
                backgroundImage: 'none',
                boxShadow: 'none',
                borderRight: 1,
                borderColor: 'divider',
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            elevation={0}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                height: '100%',
                borderRadius: 0,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                visibility: drawerOpen ? 'visible' : 'hidden',
                bgcolor: 'background.paper',
                backgroundImage: 'none',
                boxShadow: 'none',
                borderRight: 1,
                borderColor: 'divider',
                transform: drawerOpen ? 'translateX(0)' : `translateX(-${drawerWidth}px)`,
                transition: theme.transitions.create('transform', {
                  easing: theme.transitions.easing.sharp,
                  duration: drawerOpen ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
                }),
              },
            }}
            open={drawerOpen} // This controls the transform via CSS conditional styles usually, but explicitly setting it helps too
          >
            {drawer}
          </Drawer>
        )}
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: { xs: 2, sm: 3 },
          bgcolor: 'background.default',
          marginLeft: !isMobile && !drawerOpen ? `-${drawerWidth}px` : 0,
          width: isMobile ? '100%' : `calc(100% - ${drawerOpen ? drawerWidth : 0}px)`,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: drawerOpen ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: { xs: theme.layout.topbarHeight, sm: theme.layout.topbarHeight } }} /> {/* Spacer for content below AppBar */}
        <Outlet /> {/* Child routes render here */}
      </Box>
    </Box>
  );
};

MainLayout.propTypes = {
  drawerWidth: PropTypes.number.isRequired,
  isMobile: PropTypes.bool.isRequired,
  drawerOpen: PropTypes.bool.isRequired,
  handleDrawerToggle: PropTypes.func.isRequired,
  onToggleTheme: PropTypes.func.isRequired,
};

export default MainLayout;
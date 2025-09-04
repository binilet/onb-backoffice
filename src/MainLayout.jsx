import React from 'react';
import { Outlet } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu'; // Assuming you use this
import Notifications from '@mui/icons-material/Notifications'; // Assuming you use this
import AccountCircle from '@mui/icons-material/AccountCircle'; // Assuming you use this
import { useTheme } from '@mui/material/styles'; // Import useTheme to access theme
import { useLocation } from 'react-router-dom'; // For location tracking
import { useSelector,useDispatch } from 'react-redux'; // For Redux state management
import SidebarItem from './components/sidebar'; // Adjust path (assuming this component exists)

import {  Avatar, Stack } from '@mui/material';

import Box from '@mui/material/Box';


// Import Icons (ensure these imports are correct)
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import  {LocalPolice}  from '@mui/icons-material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import RsvpIcon from '@mui/icons-material/Rsvp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SavingsIcon from '@mui/icons-material/Savings';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import LogoutIcon from '@mui/icons-material/Logout';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import CircleIcon from '@mui/icons-material/Circle';
import BusinessIcon from '@mui/icons-material/Business';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles'; // For alpha function
import { logout } from './state/slices/authSlice';

const MainLayout = ({
  drawerWidth,
  isMobile,
  drawerOpen,
  handleDrawerToggle,
   
}) => {
  const theme = useTheme(); // Get theme object for transitions and breakpoints
  const location = useLocation(); // For tracking current route
  const dispatch = useDispatch(); // For dispatching actions
  
  const user = useSelector((state) => state.auth._current_user || {});
  const username = user.username || 'Guest';

  const role = user.role || 'No Role Assigned';
  const avatarLetter = username?.charAt(0)?.toUpperCase() || 'U';
  const sidebarGradient = `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`;
  

  const handleLogout = () => {
    dispatch(logout()); // update this based on your setup
  };

   const drawer = (
     <Box
       sx={{
         width: drawerWidth,
         height: "100vh",
         display: "flex",
         flexDirection: "column",
         justifyContent: "space-between",
         bgcolor: "background.paper",
         boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.05)",
         borderRadius: "0 0px 16px 0",
         overflow: "hidden",
       }}
     >
       {/* Top Logo Area */}
       <Box>
         <Box
           sx={{
             p: 2,
             background: sidebarGradient,
             mb: 2,
           }}
         >
           <Typography
             variant="h6"
             fontWeight={700}
             sx={{
               color: "white",
               letterSpacing: "0.5px",
               display: "flex",
               alignItems: "center",
               gap: 1,
             }}
           >
             <BusinessIcon /> Hagere-Online
           </Typography>
         </Box>

         {/* Navigation Menu */}
         <Box sx={{ px: 2 }}>
           {/* You can use a custom component for menu items */}
           <SidebarItem
             icon={<QueryStatsIcon />}
             text="Dashboard"
             to="/"
             active={location.pathname === "/"}
           />
           <SidebarItem
             icon={<PeopleAltIcon />}
             text="Users"
             to="/users"
             active={location.pathname === "/users"}
           />
           
           {(role === "system" || role === "agent") && (
             <SidebarItem
               icon={<LocalPolice />}
               text="Admins"
               to="/admins"
               active={location.pathname === "/admins"}
             />
           )}

           {role === "system" && (
             <SidebarItem
               icon={<GroupWorkIcon />}
               text="Agents"
               to="/agents"
               active={location.pathname === "/agents"}
             />
           )}
           <SidebarItem
             icon={<RocketLaunchIcon />}
             text="Games"
             to="/games"
             active={location.pathname === "/games"}
           />

           <SidebarItem
             icon={<RsvpIcon />}
             text="Invite"
             to="/hagere-invite"
             active={location.pathname === "/hagere-invite"}
           />

           {role === "system" && (
             <>
               <Typography
                 variant="caption"
                 color="text.secondary"
                 sx={{
                   px: 1.5,
                   py: 1,
                   mt: 2,
                   display: "block",
                   fontWeight: 600,
                   textTransform: "uppercase",
                 }}
               >
                 Finance
               </Typography>

               <SidebarItem
                 icon={<MonetizationOnIcon />}
                 text="Credits"
                 to="/credits"
                 active={location.pathname === "/credits"}
               />
               {/* <SidebarItem
                 icon={<SavingsIcon />}
                 text="Deposits"
                 to="/deposits"
                 active={location.pathname === "/deposits"}
               />
               <SidebarItem
                 icon={<ShoppingCartCheckoutIcon />}
                 text="Withdrawals"
                 to="/withdrawals"
                 active={location.pathname === "/withdrawals"}
               /> */}
               <SidebarItem
                 icon={<AssuredWorkloadIcon />}
                 text="Manual Deposits"
                 to="/manual-deposits"
                 active={location.pathname === "/manual-deposits"}
               />
               <SidebarItem
                 icon={<LocalAtmIcon />}
                 text="Manual Withdraws"
                 to="/manual-withdraws"
                 active={location.pathname === "/manual-withdraws"}
               />
             </>
           )}
         </Box>
       </Box>

       {/* Bottom Profile Area */}
       <Box
         sx={{
           p: 2.5,
           mx: 2,
           mb: 2,
           bgcolor: theme.palette.background.default,
           borderRadius: 2,
           boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.05)",
         }}
       >
         <Stack direction="row" spacing={2} alignItems="center">
           <Avatar
             sx={{
               bgcolor: theme.palette.secondary.main,
               boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.15)",
               width: 42,
               height: 42,
               fontSize: "1.2rem",
               fontWeight: 600,
             }}
           >
             {avatarLetter}
           </Avatar>
           <Box flexGrow={1}>
             <Typography variant="subtitle1" fontWeight={600} noWrap>
               {username}
             </Typography>
             <Typography
               variant="caption"
               color="text.secondary"
               sx={{
                 display: "flex",
                 alignItems: "center",
                 gap: 0.5,
               }}
             >
               <CircleIcon
                 sx={{ fontSize: "8px", color: theme.palette.success.main }}
               />
               {role}
             </Typography>
           </Box>
           <Tooltip title="Logout">
             <IconButton
               onClick={handleLogout}
               sx={{
                 color: theme.palette.error.main,
                 "&:hover": {
                   bgcolor: alpha(theme.palette.error.main, 0.1),
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
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          // Adjust width and margin based on drawer state only on non-mobile
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { sm: `${drawerOpen ? drawerWidth : 0}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: drawerOpen ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
          }),
          zIndex: theme.zIndex.drawer + 1, // Keep AppBar above drawer
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 /* , display: { sm: 'none' } */ }} // Keep toggle always visible if permanent drawer can collapse
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          >
            
          </Typography>
          <IconButton color="inherit">
            <Notifications />
          </IconButton>
          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {isMobile ? (
          // Temporary Drawer for mobile
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' }, // Show only on xs
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          // Permanent Drawer for desktop (collapsible based on drawerOpen state)
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' }, // Show only on sm and up
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                // Use transform to slide in/out based on drawerOpen state
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
          p: 3,
          // Adjust margin based on drawer state only on non-mobile
          transition: theme.transitions.create('margin', {
             easing: theme.transitions.easing.sharp,
             duration: drawerOpen ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
           }),
          marginLeft: { sm: drawerOpen ? 0 : `-${drawerWidth}px` }, // This pulls content left when drawer closes
          // OR alternative: marginLeft: { sm: 0 } and let the AppBar width handle the space
          // Test which margin logic works best with your specific drawer animation.
          // The key is that the AppBar width/margin AND main content width/margin should adjust together.
          // Let's try adjusting based on AppBar's behaviour:
          marginLeft: 0, // Keep margin 0
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` }, // Adjust width like AppBar
           transition: theme.transitions.create(['margin', 'width'], { // Add width to transition
            easing: theme.transitions.easing.sharp,
            duration: drawerOpen ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar /> {/* Spacer for content below AppBar */}
        <Outlet /> {/* Child routes render here */}
      </Box>
    </Box>
  );
};

export default MainLayout;
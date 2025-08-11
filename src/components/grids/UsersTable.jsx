import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useTheme,
  Avatar,
  Chip,
  alpha
} from '@mui/material';
import {
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  MonetizationOn as MonetizationOnIcon,
  MoneyOff as MoneyOffIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import {
  Edit as EditIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

const UsersTable = ({ users = [], handleEdit }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 500));
    setPage(0);
  };

  

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;
  const totalHealthyCredit = users.reduce((acc, user) => acc + (user.current_balance > 0 ? user.current_balance : 0), 0);
  const totalUnhealthyCredit = users.reduce((acc, user) => acc + (user.current_balance <= 0 ? user.current_balance : 0), 0);

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Summary Cards */}
     <SummaryCards
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        inactiveUsers={inactiveUsers}
        totalHealthyCredit={totalHealthyCredit}
        totalUnhealthyCredit={totalUnhealthyCredit}
      />

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder="Search by username or phone"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value)
          setPage(0);
        }}
        
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ maxWidth: 400, mb: 3 }}
      />

      {/* Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Agent ID</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Admin ID</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Credit Balance</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow
                key={user._id}
                hover
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                }}
              >
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.agentId}</TableCell>
                <TableCell>{user.adminId}</TableCell>
                <TableCell sx={{fontWeight:'bolder', color: user.current_balance > 0 ? 'success.main' : 'error.main'}}>{`${user.current_balance} birr`}</TableCell>
                
                <TableCell>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      display: 'inline-block',
                      bgcolor: user.isActive ? 'success.lighter' : 'error.lighter',
                      color: user.isActive ? 'success.main' : 'error.main',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEdit(user)}
                    size="small"
                    sx={{ color: 'primary.main' }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          mt: 2,
        }}
      />
    </Box>
  );
};



function SummaryCards({
  totalUsers,
  activeUsers,
  inactiveUsers,
  totalHealthyCredit,
  totalUnhealthyCredit
}) {
  const theme = useTheme();
  
  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      color: "primary",
      icon: <PersonIcon />,
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
      change: `${(totalUsers) !== 0 ? `$${(totalUsers / (totalUsers) * 100).toFixed(2)}%` : '0%'}`,
      changeType: "positive"
    },
    {
      label: "Active Users",
      value: activeUsers,
      color: "success",
      icon: <CheckCircleIcon />,
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.2)} 100%)`,
      change: `${(totalUsers) !== 0 ? `$${(activeUsers / (totalUsers) * 100).toFixed(2)}%` : '0%'}`,
      changeType: "positive"
    },
    {
      label: "Inactive Users",
      value: inactiveUsers,
      color: "error",
      icon: <CancelIcon />,
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.2)} 100%)`,
      change: `${(totalUsers) !== 0 ? `$${(inactiveUsers / (totalUsers) * 100).toFixed(2)}%` : '0%'}`,
      
      changeType: "negative"
    },
    {
      label: "Total Healthy Credit",
      value: `$${totalHealthyCredit?.toLocaleString() || '0'}`,
      color: "success",
      icon: <MonetizationOnIcon />,
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.2)} 100%)`,
      change: `${(totalUnhealthyCredit + totalHealthyCredit) !== 0 ? `$${(totalHealthyCredit / (totalUnhealthyCredit + totalHealthyCredit) * 100).toFixed(2)}%` : '0%'}`,
      changeType: "positive"
    },
    {
      label: "Total Unhealthy Credit",
      value: `$${totalUnhealthyCredit?.toLocaleString() || '0'}`,
      color: "warning",
      icon: <MoneyOffIcon />,
      bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.2)} 100%)`,
      change: `${(totalUnhealthyCredit + totalHealthyCredit) !== 0 ? `$${(totalUnhealthyCredit / (totalUnhealthyCredit + totalHealthyCredit) * 100).toFixed(2)}%` : '0%'}`,
      changeType: "negative"
    }
  ];

  return (
    <Grid container spacing={1} sx={{ mb: 4 }}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} lg={4} xl={2.4} key={index}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              background: stat.bgGradient,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 24px ${alpha(theme.palette[stat.color].main, 0.15)}`,
                border: `1px solid ${alpha(theme.palette[stat.color].main, 0.3)}`,
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${theme.palette[stat.color].main}, ${theme.palette[stat.color].light})`,
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette[stat.color].main, 0.1),
                    color: theme.palette[stat.color].main,
                    width: 56/2,
                    height: 56/2,
                    border: `2px solid ${alpha(theme.palette[stat.color].main, 0.2)}`,
                    '& svg': {
                      fontSize: 28
                    }
                  }}
                >
                  {stat.icon}
                </Avatar>
                
                <Chip
                  size="small"
                  icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                  label={stat.change}
                  sx={{
                    bgcolor: stat.changeType === 'positive' 
                      ? alpha(theme.palette.success.main, 0.1)
                      : alpha(theme.palette.error.main, 0.1),
                    color: stat.changeType === 'positive' 
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                    border: `1px solid ${alpha(
                      stat.changeType === 'positive' 
                        ? theme.palette.success.main
                        : theme.palette.error.main, 0.2
                    )}`,
                    fontWeight: 600,
                    '& .MuiChip-icon': {
                      color: 'inherit',
                      transform: stat.changeType === 'negative' ? 'rotate(180deg)' : 'none'
                    }
                  }}
                />
              </Box>
              
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 1,
                  fontSize: { xs: '1.75rem', sm: '2rem' }
                }}
              >
                {stat.value}
              </Typography>
              
              <Typography 
                variant="body1"
                sx={{ 
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  letterSpacing: 0.5
                }}
              >
                {stat.label}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}


export default UsersTable;
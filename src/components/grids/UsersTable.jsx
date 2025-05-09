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
} from '@mui/material';
import {
  Edit as EditIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

const UsersTable = ({ users = [], handleEdit }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '50%', 
                bgcolor: 'primary.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PersonIcon sx={{ fontSize: 24, color: 'primary.main' }} />
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">Total Users</Typography>
                <Typography variant="h4" sx={{ mt: 0.5 }}>{totalUsers}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '50%', 
                bgcolor: 'success.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircleIcon sx={{ fontSize: 24, color: 'success.main' }} />
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">Active Users</Typography>
                <Typography variant="h4" sx={{ mt: 0.5 }}>{activeUsers}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '50%', 
                bgcolor: 'error.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CancelIcon sx={{ fontSize: 24, color: 'error.main' }} />
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">Inactive Users</Typography>
                <Typography variant="h4" sx={{ mt: 0.5 }}>{inactiveUsers}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder="Search by username or phone"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
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

export default UsersTable;
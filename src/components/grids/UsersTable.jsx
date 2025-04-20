import React, { useState } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Box,
  TablePagination,
  Typography,
} from '@mui/material';
import { Edit as EditIcon, Search as SearchIcon } from '@mui/icons-material';

// --- Helper component for styled header cells (alternative to sx prop) ---
// import { styled } from '@mui/material/styles';
// const StyledTableCell = styled(TableCell)(({ theme }) => ({
//   fontWeight: 600,
//   fontSize: '0.8rem', // Slightly smaller header font
//   color: theme.palette.text.secondary,
//   textTransform: 'uppercase',
//   letterSpacing: '0.5px',
//   borderBottom: `1px solid ${theme.palette.divider}`,
//   padding: '10px 16px', // Custom padding
// }));
// --- End Helper ---


const UsersTable = ({ users, handleEdit }) => {
  // State for search query and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Filter users based on search query (phone or username)
  const filteredUsers = users?.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  // Calculate paginated data
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    // Apply a better font family to the whole container if not set globally
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto'}}>
      {/* Search Bar */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by username or phone"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" /> {/* Subtle icon color */}
              </InputAdornment>
            ),
            sx: { borderRadius: 2 } // Slightly rounded search bar
          }}
          sx={{ width: 300 }}
        />
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        variant="outlined" // Use outlined variant for a subtle border instead of shadow
        sx={{
          // boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Softer shadow if preferred over outlined
          borderRadius: 2, // Keep or adjust border radius
          mt: 2,
          // overflow: 'hidden', // Ensures border radius clips content if needed
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="users table">
          <TableHead>
            {/* Use a subtle background color from the theme */}
            <TableRow sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
              {/* Apply enhanced styles to header cells */}
              <TableCell sx={{ fontWeight: 600, padding: '12px 16px', borderBottom: 'none' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600, padding: '12px 16px', borderBottom: 'none' }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 600, padding: '12px 16px', borderBottom: 'none' }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 600, padding: '12px 16px', borderBottom: 'none' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600, padding: '12px 16px', borderBottom: 'none' }}>Agent ID</TableCell>
              <TableCell sx={{ fontWeight: 600, padding: '12px 16px', borderBottom: 'none' }}>Active</TableCell>
              <TableCell sx={{ fontWeight: 600, padding: '12px 16px', borderBottom: 'none' }}>Actions</TableCell>
              {/* Or use the StyledTableCell helper component if defined */}
              {/* <StyledTableCell>ID</StyledTableCell> */}
              {/* ... other StyledTableCells */}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user, index) => (
                <TableRow
                  key={user._id}
                  hover // Keep hover effect
                  sx={{
                    // Zebra Stripping
                    '&:nth-of-type(odd)': {
                      backgroundColor: (theme) => theme.palette.action.hover,
                    },
                    // Remove border for the last row
                    '&:last-child td, &:last-child th': { border: 0 },
                    // Adjust hover style if needed
                     '&:hover': { backgroundColor: (theme) => theme.palette.grey[200] },

                  }}
                >
                  {/* Apply consistent padding and vertical alignment to body cells */}
                  <TableCell component="th" scope="row" sx={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '0.9rem' }}>
                    {user._id}
                  </TableCell>
                  <TableCell sx={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '0.9rem' }}>{user.username}</TableCell>
                  <TableCell sx={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '0.9rem' }}>{user.phone}</TableCell>
                  <TableCell sx={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '0.9rem' }}>{user.role}</TableCell>
                  <TableCell sx={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '0.9rem' }}>{user.agent_id}</TableCell>
                  <TableCell sx={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '0.9rem' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500, // Make status text slightly bolder
                        color: user.is_active ? 'success.dark' : 'error.dark', // Use darker status colors for better contrast
                         // Optional: Use a badge-like style
                         // backgroundColor: user.is_active ? 'success.light' : 'error.light',
                         // color: user.is_active ? 'success.dark' : 'error.dark',
                         // padding: '2px 8px',
                         // borderRadius: '12px',
                         // display: 'inline-block'
                      }}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ padding: '8px 16px', verticalAlign: 'middle' }}> {/* Less padding for actions */}
                    <IconButton onClick={() => handleEdit(user)} color="primary" size="small"> {/* Smaller icon button */}
                      <EditIcon fontSize="small"/>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}> {/* More padding when empty */}
                    No users found matching your search criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ mt: 2, borderTop: (theme) => `1px solid ${theme.palette.divider}` }} // Add separator line
      />
    </Box>
  );
};

export default UsersTable;
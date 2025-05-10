import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { 
  selectWinningDistributionsByRange,
  fetchDistributionByDateRange 
} from '../../state/slices/distributionSlice';

const DistributionListPanel = ({ users = [] }) => {
  const dispatch = useDispatch();
  const distributions = useSelector(selectWinningDistributionsByRange);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchDistributionByDateRange({ start:null, end:null, phone: null }));
  },[]);

  const handleFilter = () => {
    dispatch(fetchDistributionByDateRange({ start:startDate, end:endDate, phone: selectedUser }));
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const totalAmount = distributions.reduce((acc, d) => acc + d.amount, 0);
  
  // Create our own pagination logic
  const paginatedDistributions = distributions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  const totalPages = Math.ceil(distributions.length / rowsPerPage);
  
  return (
    <Paper sx={{ 
      p: 3,
      borderRadius: 2,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      bgcolor: '#fcfcfc'
    }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#1976d2' }}>
        🎯 Distribution Dashboard
      </Typography>
      
      <Paper sx={{ 
        p: 2, 
        mb: 3,
        bgcolor: '#f5f8ff',
        border: '1px solid #e0e9ff',
        borderRadius: 1
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              size="small"
              sx={{ bgcolor: 'white' }}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              size="small"
              sx={{ bgcolor: 'white' }}
            />
          </Grid>
          
          {/* <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="Select User"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ bgcolor: 'white' }}
            >
              <MenuItem value="">All Users</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.phone} value={user.phone}>
                  {user.username} ({user.phone})
                </MenuItem>
              ))}
            </TextField>
          </Grid> */}
          
          <Grid item xs={12} sm={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleFilter}
                sx={{ 
                  py: 1,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  '&:hover': { boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)' }
                }}
              >
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSelectedUser("");
                }}
                sx={{ minWidth: '40px', px: 1 }}
              >
                ↺
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        px: 1
      }}>
        <Typography>
          Showing <strong>{distributions.length}</strong> results
        </Typography>
        <Typography sx={{ 
          fontWeight: 'bold', 
          color: '#1976d2',
          bgcolor: 'rgba(25, 118, 210, 0.1)',
          px: 2,
          py: 0.5,
          borderRadius: 1,
        }}>
          Total Amount: ${totalAmount.toFixed(2)}
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ 
        mb: 2,
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: 'rgba(0,0,0,0.2)',
          borderRadius: '4px',
        }
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'separate',
          borderSpacing: '0',
        }}>
          <thead>
            <tr style={{ 
              backgroundColor: '#1976d2', 
              color: 'white',
            }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderTopLeftRadius: '8px' }}>Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Phone</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Bet</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Your %</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Distributable</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', borderTopRightRadius: '8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDistributions.map((distribution, index) => (
              <tr key={index} style={{ 
                backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
              }}>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>
                  {new Date(distribution.date).toLocaleString()}
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>
                  {distribution.phone}
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>
                  {distribution.role}
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', textAlign: 'right' }}>
                  ${distribution.amount.toFixed(2)}
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', textAlign: 'right' }}>
                  ${distribution.betAmount.toFixed(2)}
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', textAlign: 'center' }}>
                  {distribution.yourPercent}%
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', textAlign: 'right' }}>
                  ${distribution.distributable.toFixed(2)}
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0', textAlign: 'center' }}>
                  <span style={{ 
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    backgroundColor: distribution.approved ? '#e6f7ed' : '#fff4e5',
                    color: distribution.approved ? '#0a8043' : '#b25900',
                    border: `1px solid ${distribution.approved ? '#b7e6cd' : '#ffe2b6'}`
                  }}>
                    {distribution.approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
            {distributions.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '32px 16px', textAlign: 'center', color: '#757575' }}>
                  No distributions found. Try adjusting your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>
      
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 2
      }}>
        <Typography variant="body2">
          Page {page + 1} of {Math.max(1, totalPages)}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Button 
            size="small"
            variant="outlined"
            disabled={page === 0}
            onClick={() => handleChangePage(0)}
          >
            First
          </Button>
          <Button 
            size="small"
            variant="outlined"
            disabled={page === 0}
            onClick={() => handleChangePage(page - 1)}
          >
            Prev
          </Button>
          <Button 
            size="small"
            variant="outlined"
            disabled={page >= totalPages - 1}
            onClick={() => handleChangePage(page + 1)}
          >
            Next
          </Button>
          <Button 
            size="small"
            variant="outlined"
            disabled={page >= totalPages - 1}
            onClick={() => handleChangePage(totalPages - 1)}
          >
            Last
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default DistributionListPanel;
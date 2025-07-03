import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Tabs,
  Tab,
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TextField,
  Grid,
  Button,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  useMediaQuery,
  Collapse,
  useTheme,
  Stack,
  Tooltip,
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import SummarizeIcon from '@mui/icons-material/Summarize';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DateRangeIcon from '@mui/icons-material/DateRange';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { fetchDepositRequestsByDateRange, fetchDepositStatusesByDateRange, clearDeposits } from '../state/slices/depositSlice';

const DepositPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { depositRequests, depositStatuses, loading: depositsLoading, error: depositsError } = useSelector((state) => state.deposits);
  
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Set today's date range for initial load
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const formattedStartDate = today.toISOString().substring(0, 16);
    const formattedEndDate = endOfDay.toISOString().substring(0, 16);
    
    setStartDate(formattedStartDate);
    setEndDate(formattedEndDate);

    if (tabValue === 0) {
      dispatch(fetchDepositRequestsByDateRange({ startDate: today, endDate: endOfDay, skip: 0, limit: 10 }));
    } else {
      dispatch(fetchDepositStatusesByDateRange({ startDate: today, endDate: endOfDay, skip: 0, limit: 10 }));
    }

    return () => {
      dispatch(clearDeposits());
    };
  }, [dispatch]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (newValue === 0) {
      dispatch(fetchDepositRequestsByDateRange({ startDate: start, endDate: end, skip: 0, limit: 10 }));
    } else {
      dispatch(fetchDepositStatusesByDateRange({ startDate: start, endDate: end, skip: 0, limit: 10 }));
    }
  };

  // Handle date range filter
  const handleDateFilter = () => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (tabValue === 0) {
      dispatch(fetchDepositRequestsByDateRange({ startDate: start, endDate: end, skip: 0, limit: 10 }));
    } else {
      dispatch(fetchDepositStatusesByDateRange({ startDate: start, endDate: end, skip: 0, limit: 10 }));
    }
  };

  // Refresh data
  const handleRefresh = () => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (tabValue === 0) {
      dispatch(fetchDepositRequestsByDateRange({ startDate: start, endDate: end, skip: 0, limit: 10 }));
    } else {
      dispatch(fetchDepositStatusesByDateRange({ startDate: start, endDate: end, skip: 0, limit: 10 }));
    }
  };

  // Calculate summary statistics
  const summaryData = useMemo(() => {
    const data = tabValue === 0 ? depositRequests : depositStatuses;
    
    // Calculate the total count
    const totalCount = data.length;
    
    // Calculate the total amount
    const totalAmount = data.reduce((sum, item) => {
      const amount = typeof item.amount === 'string' 
        ? parseFloat(item.amount.replace(/[^0-9.-]+/g, '')) 
        : item.amount;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // For deposit statuses, calculate counts by status
    let successCount = 0;
    let failedCount = 0;
    let pendingCount = 0;
    
    if (tabValue === 1) {
      data.forEach(item => {
        const status = item.Status ? item.Status.toLowerCase() : '';
        if (status === 'success') successCount++;
        else if (status === 'failed') failedCount++;
        else pendingCount++;
      });
    }

    return {
      totalCount,
      totalAmount: totalAmount.toFixed(2),
      successCount,
      failedCount,
      pendingCount,
      successRate: totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : '0',
    };
  }, [tabValue, depositRequests, depositStatuses]);

  // Get status color
  const getStatusColor = (status) => {
    const lowercaseStatus = status.toLowerCase();
    if (lowercaseStatus === 'success') return theme.palette.success.main;
    if (lowercaseStatus === 'failed') return theme.palette.error.main;
    return theme.palette.warning.main;
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          mt: 1
        }}
      >
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh data">
            <IconButton 
              color="primary" 
              onClick={handleRefresh}
              sx={{ boxShadow: 1, bgcolor: 'background.paper' }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={filterExpanded ? "Hide filters" : "Show filters"}>
            <IconButton 
              color="primary" 
              onClick={() => setFilterExpanded(!filterExpanded)}
              sx={{ boxShadow: 1, bgcolor: 'background.paper' }}
            >
              <FilterAltIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={summaryExpanded ? "Hide summary" : "Show summary"}>
            <IconButton 
              color="primary" 
              onClick={() => setSummaryExpanded(!summaryExpanded)}
              sx={{ boxShadow: 1, bgcolor: 'background.paper' }}
            >
              <SummarizeIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary Section */}
      <Collapse in={summaryExpanded} sx={{ mb: 3 }}>
        <Card 
          elevation={3} 
          sx={{ 
            borderRadius: 2,
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <SummarizeIcon sx={{ mr: 1 }} /> 
              {tabValue === 0 ? 'Deposit Requests Summary' : 'Deposit Status Summary'}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.contrastText, height: '100%' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2" fontWeight="bold">Total Records</Typography>
                      <DateRangeIcon />
                    </Box>
                    <Typography variant="h5" fontWeight="bold">{summaryData.totalCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: theme.palette.info.light, color: theme.palette.info.contrastText, height: '100%' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2" fontWeight="bold">Total Amount</Typography>
                      <AccountBalanceWalletIcon />
                    </Box>
                    <Typography variant="h5" fontWeight="bold">ETB {summaryData.totalAmount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {tabValue === 1 && (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: theme.palette.success.light, color: theme.palette.success.contrastText, height: '100%' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2" fontWeight="bold">Success Rate</Typography>
                          <TrendingUpIcon />
                        </Box>
                        <Typography variant="h5" fontWeight="bold">{summaryData.successRate}%</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: theme.palette.secondary.light, color: theme.palette.secondary.contrastText, height: '100%' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" fontWeight="bold">Status Count</Typography>
                          <CurrencyExchangeIcon />
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          <Chip 
                            size="small"
                            label={`Success: ${summaryData.successCount}`} 
                            sx={{ bgcolor: theme.palette.success.main, color: 'white', fontWeight: 'bold' }}
                          />
                          <Chip 
                            size="small"
                            label={`Failed: ${summaryData.failedCount}`} 
                            sx={{ bgcolor: theme.palette.error.main, color: 'white', fontWeight: 'bold' }}
                          />
                          <Chip 
                            size="small"
                            label={`Pending: ${summaryData.pendingCount}`} 
                            sx={{ bgcolor: theme.palette.warning.main, color: 'white', fontWeight: 'bold' }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}
              
              {tabValue === 0 && (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: theme.palette.secondary.light, color: theme.palette.secondary.contrastText, height: '100%' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2" fontWeight="bold">Avg. Amount</Typography>
                          <CurrencyExchangeIcon />
                        </Box>
                        <Typography variant="h5" fontWeight="bold">
                          ETB {summaryData.totalCount > 0 ? (summaryData.totalAmount / summaryData.totalCount).toFixed(2) : '0.00'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: theme.palette.success.light, color: theme.palette.success.contrastText, height: '100%' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2" fontWeight="bold">Today's Requests</Typography>
                          <TrendingUpIcon />
                        </Box>
                        <Typography variant="h5" fontWeight="bold">{summaryData.totalCount}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Collapse>

      {/* Filter Section */}
      <Collapse in={filterExpanded} sx={{ mb: 3 }}>
        <Card 
          elevation={3} 
          sx={{ 
            borderRadius: 2,
            borderLeft: `4px solid ${theme.palette.secondary.main}`,
            mb: 3,
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" fontWeight="bold" color="secondary.main" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <FilterAltIcon sx={{ mr: 1 }} /> Filter Deposits
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Start Date & Time"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="End Date & Time"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleDateFilter}
                  fullWidth
                  sx={{ 
                    height: '100%', 
                    borderRadius: 1,
                    minHeight: '56px',
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4
                    }
                  }}
                  startIcon={<FilterAltIcon />}
                >
                  Apply
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Collapse>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant={isMobile ? "fullWidth" : "standard"}
        sx={{
          mb: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
          '& .MuiTab-root': { 
            fontWeight: 'bold', 
            py: 1.5,
            fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' }
          },
          '& .Mui-selected': {
            color: 'primary.main',
            fontWeight: 'bold',
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        }}
      >
        <Tab 
          label="Deposit Requests" 
          icon={<AccountBalanceWalletIcon />} 
          iconPosition={isMobile ? "top" : "start"} 
        />
        <Tab 
          label="Deposit Statuses" 
          icon={<CurrencyExchangeIcon />} 
          iconPosition={isMobile ? "top" : "start"} 
        />
      </Tabs>

      {/* Error Snackbar */}
      {depositsError && (
        <Snackbar open={!!depositsError} autoHideDuration={6000}>
          <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
            {depositsError}
          </Alert>
        </Snackbar>
      )}

      {/* Table Loading Indicator */}
      {depositsLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {/* Deposit Requests Tab */}
      {!depositsLoading && tabValue === 0 && (
        <Card
          elevation={4}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: 6
            }
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: isMobile ? 650 : 850 }} aria-label="deposit requests table">
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.primary.light }}>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, color: theme.palette.primary.contrastText }}>Ref ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>Phone</TableCell>
                  {!isMobile && <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>Reason</TableCell>}
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>Txn ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {depositRequests.length > 0 ? (
                  depositRequests.map((deposit) => (
                    <TableRow
                      key={deposit.refId}
                      hover
                      sx={{ 
                        '&:hover': { backgroundColor: '#f9f9f9' }, 
                        transition: 'background-color 0.2s',
                        borderLeft: '4px solid transparent',
                        '&:hover': {
                          borderLeft: `4px solid ${theme.palette.primary.main}`,
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      <TableCell component="th" scope="row" sx={{ py: 1.5 }}>
                        <Tooltip title={deposit.refId}>
                          <Typography noWrap sx={{ maxWidth: isMobile ? 80 : 'none' }}>
                            {deposit.refId}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                          {new Date(deposit.createdAt).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`ETB ${deposit.amount}`}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold', 
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText' 
                          }}
                        />
                      </TableCell>
                      <TableCell>{deposit.phone}</TableCell>
                      {!isMobile && (
                        <TableCell>
                          <Tooltip title={deposit.reason || 'N/A'}>
                            <Typography noWrap sx={{ maxWidth: 150 }}>
                              {deposit.reason || 'N/A'}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      )}
                      <TableCell>
                        <Tooltip title={deposit.txnId || 'N/A'}>
                          <Typography noWrap sx={{ maxWidth: isMobile ? 80 : 'none' }}>
                            {deposit.txnId || 'N/A'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isMobile ? 5 : 6} align="center">
                      <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1" color="text.secondary">
                          No deposit requests found
                        </Typography>
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          startIcon={<RefreshIcon />}
                          onClick={handleRefresh}
                        >
                          Refresh Data
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Deposit Statuses Tab */}
      {!depositsLoading && tabValue === 1 && (
        <Card
          elevation={4}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: 6
            }
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: isMobile ? 650 : 850 }} aria-label="deposit statuses table">
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.secondary.light }}>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, color: theme.palette.secondary.contrastText }}>Ref ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.secondary.contrastText }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.secondary.contrastText }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.secondary.contrastText }}>MSISDN</TableCell>
                  {!isMobile && <TableCell sx={{ fontWeight: 'bold', color: theme.palette.secondary.contrastText }}>Reason</TableCell>}
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.secondary.contrastText }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.secondary.contrastText }}>Txn ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {depositStatuses.length > 0 ? (
                  depositStatuses.map((status) => (
                    <TableRow
                      key={status.refId}
                      hover
                      sx={{ 
                        transition: 'background-color 0.2s',
                        borderLeft: '4px solid transparent',
                        '&:hover': {
                          borderLeft: `4px solid ${theme.palette.secondary.main}`,
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      <TableCell component="th" scope="row" sx={{ py: 1.5 }}>
                        <Tooltip title={status.refId}>
                          <Typography noWrap sx={{ maxWidth: isMobile ? 80 : 'none' }}>
                            {status.refId}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                          {new Date(status.created_at).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`ETB ${status.amount}`}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold', 
                            bgcolor: 'secondary.light',
                            color: 'secondary.contrastText' 
                          }}
                        />
                      </TableCell>
                      <TableCell>{status.msisdn}</TableCell>
                      {!isMobile && (
                        <TableCell>
                          <Tooltip title={status.reason || 'N/A'}>
                            <Typography noWrap sx={{ maxWidth: 150 }}>
                              {status.reason || 'N/A'}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip
                          label={status.Status}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold', 
                            bgcolor: getStatusColor(status.status),
                            color: 'white' 
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={status.txnId || 'N/A'}>
                          <Typography noWrap sx={{ maxWidth: isMobile ? 80 : 'none' }}>
                            {status.txnId || 'N/A'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isMobile ? 6 : 7} align="center">
                      <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1" color="text.secondary">
                          No deposit statuses found
                        </Typography>
                        <Button 
                          variant="outlined" 
                          color="secondary" 
                          startIcon={<RefreshIcon />}
                          onClick={handleRefresh}
                        >
                          Refresh Data
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
};

export default DepositPage;
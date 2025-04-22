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
import DateRangeIcon from '@mui/icons-material/DateRange';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { fetchSantimWithdrawalsByDateRange, fetchSantimWithdrawalStatusesByDateRange, clearWithdrawals, clearStatuses } from '../state/slices/withdrawls';

const WithdrawalPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { withdrawals, statuses } = useSelector((state) => state.withdrawals);
  
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
      dispatch(fetchSantimWithdrawalsByDateRange({ startDate: today, endDate: endOfDay, skip: 0, limit: 10 }));
    } else {
      dispatch(fetchSantimWithdrawalStatusesByDateRange({ startDate: today, endDate: endOfDay, skip: 0, limit: 10 }));
    }

    return () => {
      dispatch(clearWithdrawals());
      dispatch(clearStatuses());
    };
  }, [dispatch]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (newValue === 0) {
      dispatch(fetchSantimWithdrawalsByDateRange({ startDate: start, endDate: end, skip: 0, limit: 10 }));
    } else {
      dispatch(fetchSantimWithdrawalStatusesByDateRange({ startDate: start, endDate: end, skip: 0, limit: 10 }));
    }
  };

  // Handle date range filter
  const handleDateFilter = () => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (tabValue === 0) {
      dispatch(fetchSantimWithdrawalsByDateRange({ startDate: start, endDate: end, skip: 0, limit: 10 }));
    } else {
      dispatch(fetchSantimWithdrawalStatusesByDateRange({ startDate: start, endDate: end, skip: 0, limit: 10 }));
    }
  };

  // Refresh data
  const handleRefresh = () => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (tabValue === 0) {
      dispatch(fetchSantimWithdrawalsByDateRange({ startDate: start, endDate: end, skip: 0, limit: 10 }));
    } else {
      dispatch(fetchSantimWithdrawalStatusesByDateRange({ startDate: start, endDate: end, skip: 0, limit: 10 }));
    }
  };

  // Calculate summary statistics for withdrawal requests
  const withdrawalSummary = useMemo(() => {
    if (!withdrawals.data || withdrawals.data.length === 0) {
      return {
        totalCount: 0,
        totalAmount: '0.00',
        successCount: 0,
        failedCount: 0,
        pendingCount: 0,
        successRate: '0',
        avgAmount: '0.00'
      };
    }

    const totalCount = withdrawals.data.length;
    let totalAmount = 0;
    let successCount = 0;
    let failedCount = 0;
    let pendingCount = 0;

    withdrawals.data.forEach(item => {
      // Sum total amount
      const amount = typeof item.amount === 'number' ? item.amount : 
        typeof item.amount === 'string' ? parseFloat(item.amount.replace(/[^0-9.-]+/g, '')) : 0;
      
      totalAmount += isNaN(amount) ? 0 : amount;
      
      // Count by status
      const status = item.status ? item.status.toLowerCase() : '';
      if (status === 'success') successCount++;
      else if (status === 'failed') failedCount++;
      else pendingCount++;
    });

    return {
      totalCount,
      totalAmount: totalAmount.toFixed(2),
      successCount,
      failedCount, 
      pendingCount,
      successRate: totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : '0',
      avgAmount: totalCount > 0 ? (totalAmount / totalCount).toFixed(2) : '0.00'
    };
  }, [withdrawals.data]);

  // Calculate summary statistics for withdrawal statuses
  const statusesSummary = useMemo(() => {
    if (!statuses.data || statuses.data.length === 0) {
      return {
        totalCount: 0,
        totalAmount: '0.00',
        successCount: 0,
        failedCount: 0,
        pendingCount: 0,
        successRate: '0'
      };
    }

    const totalCount = statuses.data.length;
    let totalAmount = 0;
    let successCount = 0;
    let failedCount = 0;
    let pendingCount = 0;

    statuses.data.forEach(item => {
      // Sum total amount
      const amount = typeof item.amount === 'number' ? item.amount : 
        typeof item.amount === 'string' ? parseFloat(item.amount.replace(/[^0-9.-]+/g, '')) : 0;
      
      totalAmount += isNaN(amount) ? 0 : amount;
      
      // Count by status
      const status = item.Status ? item.Status.toLowerCase() : '';
      if (status === 'success') successCount++;
      else if (status === 'failed') failedCount++;
      else pendingCount++;
    });

    return {
      totalCount,
      totalAmount: totalAmount.toFixed(2),
      successCount,
      failedCount,
      pendingCount,
      successRate: totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : '0'
    };
  }, [statuses.data]);

  // Summary data based on active tab
  const summaryData = tabValue === 0 ? withdrawalSummary : statusesSummary;

  // Get status color
  const getStatusColor = (status) => {
    const lowercaseStatus = (status || '').toLowerCase();
    if (lowercaseStatus === 'success') return theme.palette.success.main;
    if (lowercaseStatus === 'failed') return theme.palette.error.main;
    return theme.palette.warning.main;
  };

  // Loading state based on active tab
  const isLoading = tabValue === 0 ? withdrawals.loading : statuses.loading;
  
  // Error state based on active tab
  const error = tabValue === 0 ? withdrawals.error : statuses.error;

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
              color="secondary" 
              onClick={handleRefresh}
              sx={{ boxShadow: 1, bgcolor: 'background.paper' }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={filterExpanded ? "Hide filters" : "Show filters"}>
            <IconButton 
              color="secondary" 
              onClick={() => setFilterExpanded(!filterExpanded)}
              sx={{ boxShadow: 1, bgcolor: 'background.paper' }}
            >
              <FilterAltIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={summaryExpanded ? "Hide summary" : "Show summary"}>
            <IconButton 
              color="secondary" 
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
            borderLeft: `4px solid ${theme.palette.secondary.main}`,
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" fontWeight="bold" color="secondary.main" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <SummarizeIcon sx={{ mr: 1 }} /> 
              {tabValue === 0 ? 'Withdrawal Requests Summary' : 'Withdrawal Status Summary'}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: theme.palette.secondary.light, color: theme.palette.secondary.contrastText, height: '100%' }}>
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
                <Card sx={{ bgcolor: theme.palette.warning.light, color: theme.palette.warning.contrastText, height: '100%' }}>
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
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            mb: 3,
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <FilterAltIcon sx={{ mr: 1 }} /> Filter Withdrawals
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
                  color="primary"
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
            color: 'secondary.main',
            fontWeight: 'bold',
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            backgroundColor: theme.palette.secondary.main
          },
        }}
      >
        <Tab 
          label="Withdrawal Requests" 
          icon={<PaymentIcon />} 
          iconPosition={isMobile ? "top" : "start"} 
        />
        <Tab 
          label="Withdrawal Statuses" 
          icon={<CurrencyExchangeIcon />} 
          iconPosition={isMobile ? "top" : "start"} 
        />
      </Tabs>

      {/* Error Snackbar */}
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000}>
          <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}

      {/* Table Loading Indicator */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress color="secondary" />
        </Box>
      )}

      {/* Withdrawal Requests Tab */}
      {!isLoading && tabValue === 0 && (
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
            <Table sx={{ minWidth: isMobile ? 650 : 850 }} aria-label="withdrawal requests table">
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.secondary.light }}>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, color: theme.palette.secondary.contrastText }}>Trx ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.secondary.contrastText }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.secondary.contrastText }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.secondary.contrastText }}>Phone</TableCell>
                  {!isMobile && <TableCell sx={{ fontWeight: 'bold', color: theme.palette.secondary.contrastText }}>Payment Method</TableCell>}
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.secondary.contrastText }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {withdrawals.data && withdrawals.data.length > 0 ? (
                  withdrawals.data.map((withdrawal) => (
                    <TableRow
                      key={withdrawal.trxId}
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
                        <Tooltip title={withdrawal.trxId}>
                          <Typography noWrap sx={{ maxWidth: isMobile ? 80 : 'none' }}>
                            {withdrawal.trxId}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                          {new Date(withdrawal.createdAt).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`ETB ${typeof withdrawal.amount === 'number' ? withdrawal.amount.toFixed(2) : withdrawal.amount}`}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold', 
                            bgcolor: 'secondary.light',
                            color: 'secondary.contrastText' 
                          }}
                        />
                      </TableCell>
                      <TableCell>{withdrawal.phone}</TableCell>
                      {!isMobile && (
                        <TableCell>
                          <Tooltip title={withdrawal.paymentMethod || 'N/A'}>
                            <Typography noWrap sx={{ maxWidth: 150 }}>
                              {withdrawal.paymentMethod || 'N/A'}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip
                          label={withdrawal.status}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold', 
                            bgcolor: getStatusColor(withdrawal.status),
                            color: 'white' 
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isMobile ? 5 : 6} align="center">
                      <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1" color="text.secondary">
                          No withdrawal requests found
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

      {/* Withdrawal Statuses Tab */}
      {!isLoading && tabValue === 1 && (
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
            <Table sx={{ minWidth: isMobile ? 650 : 850 }} aria-label="withdrawal statuses table">
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.primary.light }}>
                  <TableCell sx={{ fontWeight: 'bold', py: 2, color: theme.palette.primary.contrastText }}>Ref ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>MSISDN</TableCell>
                  {!isMobile && <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>Reason</TableCell>}
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.contrastText }}>Txn ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statuses.data && statuses.data.length > 0 ? (
                  statuses.data.map((status) => (
                    <TableRow
                      key={status.refId}
                      hover
                      sx={{ 
                        transition: 'background-color 0.2s',
                        borderLeft: '4px solid transparent',
                        '&:hover': {
                          borderLeft: `4px solid ${theme.palette.primary.main}`,
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
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText' 
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
                            bgcolor: getStatusColor(status.Status),
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
                          No withdrawal statuses found
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
    </Box>
  );
};

export default WithdrawalPage;
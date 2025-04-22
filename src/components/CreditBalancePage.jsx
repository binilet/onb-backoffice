import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
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
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  DateRange,
  Refresh,
  Info as InfoIcon,
} from '@mui/icons-material';
import { fetchCreditBalancesByDateRange, clearBalances } from '../state/slices/creditBalanceSlice';

const CreditBalancePage = () => {
  const dispatch = useDispatch();
  const { balances } = useSelector((state) => state.creditBalances);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    dispatch(fetchCreditBalancesByDateRange({ startDate: today, endDate: endOfDay, skip: 0, limit: 10 }));

    return () => {
      dispatch(clearBalances());
    };
  }, [dispatch]);

  const handleDateFilter = () => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    dispatch(fetchCreditBalancesByDateRange({ startDate: start, endDate: end, skip: 0, limit: 10 }));
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    if (!balances.data.length) return { total: 0, increased: 0, decreased: 0 };
    
    return balances.data.reduce((acc, curr) => ({
      total: acc.total + curr.current_balance,
      increased: acc.increased + (curr.current_balance > curr.previous_balance ? 1 : 0),
      decreased: acc.decreased + (curr.current_balance < curr.previous_balance ? 1 : 0),
    }), { total: 0, increased: 0, decreased: 0 });
  };

  const summary = calculateSummary();

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="600" color="text.primary">
          Credit Balance Dashboard
        </Typography>
        <Button
          startIcon={<Refresh />}
          variant="outlined"
          onClick={() => handleDateFilter()}
          sx={{ textTransform: 'none' }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'primary.lighter' }}>
                <AccountBalance sx={{ color: 'primary.main' }} />
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">Total Balance</Typography>
                <Typography variant="h4" sx={{ mt: 0.5 }}>
                  ${summary.total.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'success.lighter' }}>
                <TrendingUp sx={{ color: 'success.main' }} />
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">Increased Balances</Typography>
                <Typography variant="h4" sx={{ mt: 0.5 }}>{summary.increased}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'error.lighter' }}>
                <TrendingDown sx={{ color: 'error.main' }} />
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">Decreased Balances</Typography>
                <Typography variant="h4" sx={{ mt: 0.5 }}>{summary.decreased}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Date Filter */}
      <Card elevation={0} sx={{ mb: 4, border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                label="Start Date"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="End Date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                onClick={handleDateFilter}
                startIcon={<DateRange />}
                fullWidth
                sx={{ height: '40px' }}
              >
                Apply Filter
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Current Balance</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Previous Balance</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Change</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Created At</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Modified At</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Remark</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {balances.loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    Loading balance data...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : balances.data.length > 0 ? (
              balances.data.map((balance) => {
                const change = balance.current_balance - balance.previous_balance;
                return (
                  <TableRow
                    key={`${balance.phone}-${balance.created_at}`}
                    hover
                  >
                    <TableCell>{balance.phone}</TableCell>
                    <TableCell>${balance.current_balance.toFixed(2)}</TableCell>
                    <TableCell>${balance.previous_balance.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={`${change >= 0 ? '+' : ''}${change.toFixed(2)}`}
                        color={change > 0 ? 'success' : change < 0 ? 'error' : 'default'}
                        sx={{ minWidth: 80 }}
                      />
                    </TableCell>
                    <TableCell>{balance.created_at ? new Date(balance.created_at).toLocaleString() : 'N/A'}</TableCell>
                    <TableCell>{balance.modified_at ? new Date(balance.modified_at).toLocaleString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {balance.remark || 'N/A'}
                        {balance.remark && (
                          <Tooltip title={balance.remark}>
                            <IconButton size="small">
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No credit balances found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Try adjusting your date range filters
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CreditBalancePage;
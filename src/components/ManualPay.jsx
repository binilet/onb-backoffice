import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import {
  FilterList,
  Refresh,
  CheckCircle,
  Cancel,
  Info,
  Phone,
  Receipt,
  AccountBalance,
  DateRange
} from '@mui/icons-material';

import { useDispatch, useSelector } from 'react-redux';
import { fetchManualDeposits, approveManualDeposit } from '../state/slices/manualDepositSlice';
import { use } from 'react';

const ManualDepositsManager = () => {
  const dispatch = useDispatch();
  const { items, loading, approving, approvalMessage, error } = useSelector(state => state.manualDeposits);
  
  const [tabValue, setTabValue] = useState(0);
  /*const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState(null);
  const [approvalMessage, setApprovalMessage] = useState('');*/

  
  

  
  // Dialog states
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  

    // Filter states
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    phoneNumber: null,
    processed: null
  });

  // Initialize with mock data
  useEffect(() => {
    //setItems(mockData);
    dispatch(fetchManualDeposits(filters));
  }, []);

  // Filter data based on current tab and filters
  const filteredItems = items.filter(item => {
    const isProcessedTab = tabValue === 1;
    const matchesProcessedState = item.processed === isProcessedTab;
    if (!matchesProcessedState) return false;
    if (filters.phoneNumber && !item.phone.includes(filters.phoneNumber)) return false;
    //console.log(item);
    const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
    if (filters.startDate && itemDate < filters.startDate) return false;
    if (filters.endDate && itemDate > filters.endDate) return false;
    
    return true;
  });

  // Calculate summaries
  const summary = {
    totalTransactions: filteredItems.length,
    totalAmount: filteredItems.reduce((sum, item) => sum + item.amount, 0),
    averageAmount: filteredItems.length > 0 ? (filteredItems.reduce((sum, item) => sum + item.amount, 0) / filteredItems.length).toFixed(2) : 0
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFind = () => {
    //console.log('Fetching deposits with filters:', filters);
    dispatch(fetchManualDeposits(filters));
  }

  const handleApprove = async (depositId) => {
    //setApproving(true);
    //setError(null);
    
    try {
      // Simulate API call
      //await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      await dispatch(approveManualDeposit(depositId));
      //if true
      
      
      //setApprovalMessage('Transaction approved successfully!');
      setDetailsDialog(false);
      
      // Clear success message after 3 seconds
      //setTimeout(() => setApprovalMessage(''), 3000);
    } catch (err) {
      //setError('Failed to approve transaction');
    } finally {
      //setApproving(false);
    }
  };


  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailsDialog(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const extractAmountFromReceipt = (receiptMessage) => {
    const match = receiptMessage.match(/ETB ([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Manual Deposits Manager
      </Typography>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {approvalMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setApprovalMessage('')}>
          {approvalMessage}
        </Alert>
      )}

      {/* Filters Card */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList color="primary" />
            Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2.5}>
              <TextField
                fullWidth
                size="small"
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.5}>
              <TextField
                fullWidth
                size="small"
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.5}>
              <TextField
                fullWidth
                size="small"
                label="Phone Number"
                value={filters.phoneNumber}
                onChange={(e) => handleFilterChange('phoneNumber', e.target.value)}
                placeholder="Search by phone..."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleFind}
                sx={{ height: '40px' }}
              >
                Find
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#e3f2fd', boxShadow: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Receipt color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {summary.totalTransactions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Transactions
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#e8f5e8', boxShadow: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <AccountBalance color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ETB {summary.totalAmount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#fff3e0', boxShadow: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <DateRange color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ETB {summary.averageAmount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Amount
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Card */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Cancel color="error" />
                  Unprocessed ({items.filter(item => !item.processed).length})
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle color="success" />
                  Processed ({items.filter(item => item.processed).length})
                </Box>
              } 
            />
          </Tabs>

          <Box sx={{ p: 2 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Transaction ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Processed</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Verified</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Note</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredItems?.map((item) => (
                      <TableRow key={item._id} hover>
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                          {item.trxId}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Phone color="action" fontSize="small" />
                            {item.phone}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                            ETB {item.amount}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.userName}</TableCell>
                        <TableCell>
                          {formatDate(item.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.processed ? 'Processed' : 'Pending'}
                            color={item.processed ? 'success' : 'warning'}
                            size="small"
                            icon={item.processed ? <CheckCircle /> : <Cancel />}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.isVerified ? 'True' : 'False'}
                            color={item.isVerified ? 'success' : 'error'}
                            size="small"
                            icon={item.isVerified ? <CheckCircle /> : <Cancel />}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.status}
                            color={item.status === 'SUCCESS' ? 'success' : item.status === 'PENDING' ? 'warning' : 'error'}
                            size="small"
                            icon={item.isVerified ? <CheckCircle /> : <Cancel />}
                          />
                        </TableCell>
                        <TableCell>
                          {item.processedMsg}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small"
                                onClick={() => handleViewDetails(item)}
                                color="primary"
                              >
                                <Info />
                              </IconButton>
                            </Tooltip>
                            {/*{!item.processed && (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => handleApprove(item._id)}
                                disabled={approving}
                                startIcon={approving ? <CircularProgress size={16} /> : <CheckCircle />}
                              >
                                {approving ? 'Approving...' : 'Approve'}
                              </Button>
                            )}*/}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredItems?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No transactions found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#f5f5f5' }}>
          Transaction Details
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Transaction ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', mb: 2 }}>
                    {selectedTransaction.trxId}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone Number
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedTransaction.phone}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2e7d32', mb: 2 }}>
                    ETB {selectedTransaction.amount}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedTransaction.userName}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Receipt Message
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: '#f8f9fa', mt: 1 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontFamily: 'monospace' }}>
                      {selectedTransaction.receiptMessage}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>
            Close
          </Button>
          {selectedTransaction && !selectedTransaction.processed && (
            <Button
              variant="contained"
              color="success"
              onClick={() => handleApprove(selectedTransaction._id)}
              disabled={approving}
              startIcon={approving ? <CircularProgress size={16} /> : <CheckCircle />}
            >
              {approving ? 'Approving...' : 'Approve Transaction'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManualDepositsManager;
import { useState, useEffect } from 'react';
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
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
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
import { numericFontFamily } from '../../theme';

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
    <Box sx={{
      p: { xs: 3, md: 4 }, minWidth: 0, color: 'text.primary',
      '& .MuiCardContent-root': { p: 4, '&:last-child': { pb: 4 } },
      '& input': { colorScheme: (theme) => theme.palette.mode },
      '& .MuiTableCell-root': { whiteSpace: 'nowrap' },
      '& .MuiTableCell-root:nth-of-type(9)': { whiteSpace: 'normal', overflowWrap: 'anywhere' },
      '& .MuiTableBody-root .MuiTableCell-root:nth-of-type(-n+3)': { fontFamily: numericFontFamily, fontVariantNumeric: 'tabular-nums' },
      '& .MuiTableRow-root:last-child .MuiTableCell-root': { borderBottom: 0 },
    }}>
      <Typography variant="h2" component="h1" sx={{ mb: 4, pb: 3, borderBottom: 1, borderColor: 'divider' }}>
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
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList color="primary" />
            Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
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
            <Grid item xs={12} sm={6} md={3}>
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
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Phone Number"
                value={filters.phoneNumber}
                onChange={(e) => handleFilterChange('phoneNumber', e.target.value)}
                placeholder="Search by phone..."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleFind}
                fullWidth
                sx={{ py: 2 }}
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
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Receipt sx={{ color: 'text.secondary' }} />
                <Box>
                  <Typography variant="h3" sx={{ fontFamily: numericFontFamily, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}>
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
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <AccountBalance sx={{ color: 'primary.main' }} />
                <Box>
                  <Typography variant="h2" sx={{ fontFamily: numericFontFamily, fontVariantNumeric: 'tabular-nums', color: 'primary.main', overflowWrap: 'anywhere' }}>
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
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <DateRange sx={{ color: 'text.secondary' }} />
                <Box>
                  <Typography variant="h3" sx={{ fontFamily: numericFontFamily, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}>
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
      <Card sx={{ '& .MuiCardContent-root': { p: 0, '&:last-child': { pb: 0 } } }}>
        <CardContent>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
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
                        <TableCell sx={{ fontFamily: numericFontFamily }}>
                          {item.trxId}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Phone color="action" fontSize="small" />
                            {item.phone}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', fontFamily: numericFontFamily, fontVariantNumeric: 'tabular-nums' }}>
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
        <DialogTitle sx={{ px: 4, py: 3, borderBottom: 1, borderColor: 'divider', typography: 'h3' }}>
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
                  <Typography variant="body1" sx={{ fontFamily: numericFontFamily, mb: 2 }}>
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
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main', fontFamily: numericFontFamily, fontVariantNumeric: 'tabular-nums', mb: 2 }}>
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
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', mt: 1 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontFamily: numericFontFamily }}>
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
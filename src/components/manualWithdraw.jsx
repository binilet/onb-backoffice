import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  Container
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Clear as ClearIcon,
  Check as CheckIcon,
  Block as BlockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
  RequestPage as RequestPageIcon
} from '@mui/icons-material';

import {
  fetchManualWithdrawRequests,
  updateTransactionApproval,
  updateTransactionVoid,
  setFilters,
  clearFilters,
  clearError
} from '../state/slices/manualWithdrawSlice';

import { fetchCreditBalancesByPhoneNumber } from '../state/slices/creditBalanceSlice';
import { numericFontFamily } from '../../theme';

const ManualWithdrawManager = () => {
  const dispatch = useDispatch();
  const { data, loading, error, filters, summary } = useSelector(state => state.manualRequests);
  const { balanceByPhone } = useSelector((state) => state.creditBalances);

  const [localFilters, setLocalFilters] = useState({
    startDate: '',
    endDate: '',
    phone: ''
  });

  const [currentTab, setCurrentTab] = useState(0);
  const [approvalModal, setApprovalModal] = useState({ open: false, transaction: null });
  const [voidModal, setVoidModal] = useState({ open: false, transaction: null });
  const [telebirrReferencedata, setTelebirrReferenceData] = useState('');
  const [telebirrReferenceError, setTelebirrReferenceError] = useState('');
  const [balanceError, setBalanceError] = useState('');

  useEffect(() => {
    dispatch(fetchManualWithdrawRequests());
  }, [dispatch]);

  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {

    dispatch(setFilters(localFilters));
    dispatch(fetchManualWithdrawRequests(localFilters));
  };

  const handleClearFilters = () => {
    setLocalFilters({
      startDate: '',
      endDate: '',
      phone: ''
    });
    dispatch(clearFilters());
    dispatch(fetchManualWithdrawRequests());
  };

  const handleRefresh = () => {
    dispatch(fetchManualWithdrawRequests(filters));
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleApprovalClick = (transaction) => {
    dispatch(fetchCreditBalancesByPhoneNumber({ phone: transaction.phone }));
    setApprovalModal({ open: true, transaction });
  };

  const handleVoidClick = (transaction) => {
    setVoidModal({ open: true, transaction });
  };


  const handleApprovalConfirm = () => {
    setTelebirrReferenceError('');
    setBalanceError('');
    if (!telebirrReferencedata) {
      setTelebirrReferenceError("Please set telebirr reference number");
      return;
    }

    if (balanceByPhone.data?.current_balance < approvalModal.transaction.amount) {
      setBalanceError("Insufficient balance");
      return;
    }

    const transaction = approvalModal.transaction;
    const updates = {
      id: transaction._id,
      telebirrReferencedata
    };
    dispatch(updateTransactionApproval(updates));
    setApprovalModal({ open: false, transaction: null });
  };

  const handleVoidConfirm = () => {
    // You can add void logic here similar to approval
    const transaction = voidModal.transaction;
    const updates = {
      id: transaction._id
    };
    dispatch(updateTransactionVoid(updates));
    setVoidModal({ open: false, transaction: null });
  };

  const closeApprovalModal = () => {
    setApprovalModal({ open: false, transaction: null });
  };

  const closeVoidModal = () => {
    setVoidModal({ open: false, transaction: null });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const SummaryCard = ({ title, value, subtitle, color = 'primary', icon: Icon }) => (
    <Card
      sx={{
        height: '100%',
        bgcolor: 'background.paper',
        color: 'text.primary',
        border: 1,
        borderColor: 'divider',
        boxShadow: 'none',
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
          <Typography color="text.secondary" variant="body2">
            {title}
          </Typography>
          {Icon && <Icon fontSize="small" sx={{ color: 'text.secondary' }} />}
        </Box>
        <Typography variant={color === 'primary' ? 'h2' : 'h3'} component="div" sx={{ fontFamily: numericFontFamily, fontVariantNumeric: 'tabular-nums', color: color === 'primary' ? 'primary.main' : 'text.primary', overflowWrap: 'anywhere', mb: 1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 500 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  // Filter data based on current tab
  const filteredData = currentTab === 0
    ? data.filter(t => !t.approved && !t.void)
    : data.filter(t => t.approved);

  const ActionButtons = ({ transaction }) => (
    <Stack direction="row" spacing={1}>
      <Button
        variant="contained"
        color="success"
        size="small"
        startIcon={<CheckIcon />}
        onClick={() => handleApprovalClick(transaction)}
        sx={{
          minWidth: 'auto',
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600
        }}
      >
        Approve
      </Button>
      <Button
        variant="contained"
        color="error"
        size="small"
        startIcon={<BlockIcon />}
        onClick={() => handleVoidClick(transaction)}
        sx={{
          minWidth: 'auto',
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600
        }}
      >
        Void
      </Button>
    </Stack>
  );

  return (
    <Container maxWidth={false} sx={{ p: { xs: 3, md: 4 }, color: 'text.primary', minWidth: 0, '& input': { colorScheme: (theme) => theme.palette.mode } }}>
      <Typography variant="h2" component="h1" sx={{ mb: 4, pb: 3, borderBottom: 1, borderColor: 'divider' }}>
        Manual Withdraw Manager
      </Typography>
      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => dispatch(clearError())}
        >
          {error}
        </Alert>
      )}

      {/* Modern Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={2}>
          <SummaryCard
            title="Total Requests"
            value={summary.totalRequested}
            subtitle="All withdrawals"
            color="info"
            icon={PersonIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2}>
          <SummaryCard
            title="Approved"
            value={summary.totalApproved}
            subtitle={formatCurrency(summary.approvedAmount)}
            color="success"
            icon={CheckCircleIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2}>
          <SummaryCard
            title="Pending"
            value={summary.totalPending}
            subtitle={formatCurrency(summary.pendingAmount)}
            color="warning"
            icon={PendingIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2}>
          <SummaryCard
            title="Total Amount"
            value={formatCurrency(summary.totalAmount)}
            subtitle="All requests"
            color="primary"
            icon={MoneyIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2}>
          <SummaryCard
            title="Success Rate"
            value={`${summary.totalRequested
              ? Math.round(
                (summary.totalApproved / summary.totalRequested) * 100
              )
              : 0
              }%`}
            subtitle="Approval rate"
            color="secondary"
            icon={CheckIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2}>
          <SummaryCard
            title="Avg Amount"
            value={formatCurrency(
              summary.totalRequested
                ? summary.totalAmount / summary.totalRequested
                : 0
            )}
            subtitle="Per request"
            color="info"
            icon={TimeIcon}
          />
        </Grid>
      </Grid>

      {/* Modern Filters */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 600, color: 'text.primary' }}
        >
          Filter Withdrawals
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Start Date"
              type="date"
              value={localFilters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="End Date"
              type="date"
              value={localFilters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Phone Number"
              value={localFilters.phone}
              onChange={(e) => handleFilterChange("phone", e.target.value)}
              placeholder="Enter phone number"
              fullWidth
              InputProps={{
                startAdornment: (
                  <PhoneIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                disabled={loading}
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.5,
                }}
              >
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                disabled={loading}
                startIcon={<ClearIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Clear
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabbed Interface */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                minHeight: 48,
              },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PendingIcon />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Pending Requests
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {data.filter((t) => !t.approved && !t.void).length} items
                    </Typography>
                  </Box>
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleIcon />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Approved Requests
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {data?.filter((t) => t.approved).length} items
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
            <CircularProgress size={48} />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Transaction ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Amount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Receipt Link</TableCell>
                  {currentTab === 1 && (
                    <TableCell sx={{ fontWeight: 600 }}>Approved By</TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                  {currentTab === 0 && (
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((transaction) => (
                  <TableRow
                    key={transaction._id}
                    hover
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: numericFontFamily,
                          bgcolor: 'action.hover',
                          padding: '4px 8px',
                          borderRadius: 1,
                          display: 'inline-block',
                        }}
                      >
                        {transaction.trxid || transaction._id.slice(-8)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PhoneIcon
                          sx={{ fontSize: 16, color: 'text.secondary' }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {transaction.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PersonIcon
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {transaction.username}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: 'primary.main',
                          fontFamily: numericFontFamily,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {formatCurrency(transaction.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={
                          transaction.approved ? (
                            <CheckCircleIcon />
                          ) : (
                            <PendingIcon />
                          )
                        }
                        label={transaction.approved ? "Approved" : "Pending"}
                        color={transaction.approved ? "success" : "warning"}
                        sx={{ fontWeight: 600, borderRadius: 2 }}
                      />
                      {transaction.void && (
                        <Chip
                          label="Void"
                          color="error"
                          sx={{ ml: 1, fontWeight: 600, borderRadius: 2 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: numericFontFamily,
                          bgcolor: 'action.hover',
                          padding: '4px 8px',
                          borderRadius: 1,
                          display: 'inline-block',
                        }}
                      >
                        {/* {transaction.reference || 'N/A'} */}
                        <a
                          href={`https://transactioninfo.ethiotelecom.et/receipt/${transaction.reference
                            ?.toString()
                            .toUpperCase()}`}
                          target="_blank"
                        >
                          {transaction.reference}
                        </a>
                      </Typography>
                    </TableCell>
                    {currentTab === 1 && (
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {transaction.approvedBy || "N/A"}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(transaction.createdAt)}
                      </Typography>
                    </TableCell>
                    {currentTab === 0 && (
                      <TableCell>
                        <ActionButtons transaction={transaction} />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {filteredData.length === 0 && !loading && (
                  <TableRow>
                    <TableCell
                      colSpan={currentTab === 0 ? 9 : 8}
                      align="center"
                      sx={{ py: 8 }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          gutterBottom
                        >
                          {currentTab === 0
                            ? "No pending requests"
                            : "No approved requests"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {currentTab === 0
                            ? "All withdrawal requests have been processed"
                            : "No requests have been approved yet"}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Approval Modal */}
      <Dialog
        open={approvalModal.open}
        onClose={closeApprovalModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            px: 4,
            py: 3,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <CheckCircleIcon sx={{ color: 'success.main' }} />
          <Box>
            <Typography variant="h3" component="h2">
              Approve Withdrawal Request
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please review the details before approving
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {approvalModal.transaction && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600, color: 'text.primary' }}
                  >
                    Transaction Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Transaction ID
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, fontFamily: numericFontFamily }}
                      >
                        {approvalModal.transaction.trxid ||
                          approvalModal.transaction._id.slice(-8)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Amount
                      </Typography>
                      <Typography
                        variant="h5"
                        color="primary.main"
                        sx={{ fontWeight: 700, fontFamily: numericFontFamily, fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatCurrency(approvalModal.transaction.amount)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Reference
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {approvalModal.transaction.reference || "N/A"}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600, color: 'text.primary' }}
                  >
                    User Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Username
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {approvalModal.transaction.username}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PhoneIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Phone Number
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {approvalModal.transaction.phone}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TimeIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Created At
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(approvalModal.transaction.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600, color: 'text.primary' }}
                  >
                    Telebirr Reference Id
                  </Typography>
                  <Divider sx={{ mb: 0 }} />
                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <RequestPageIcon color="action" />
                      <Box>
                        <TextField
                          label="Telebirr Reference Number"
                          value={telebirrReferencedata || ""}
                          onChange={(e) =>
                            setTelebirrReferenceData(e.target.value)
                          }
                          placeholder="Enter Telebirr reference"
                          fullWidth
                          size="small"
                          sx={{ mt: 1 }}
                          error={!!telebirrReferenceError}
                          helperText={telebirrReferenceError}
                        />
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600, color: 'text.primary' }}
                  >
                    Users Balance
                    {balanceError && (
                      <Typography component="span" sx={{ color: 'error.main', ml: 1 }}>
                        : ({balanceError})
                      </Typography>
                    )}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography
                    variant="h5"
                    color="primary.main"
                    sx={{ fontWeight: 700, fontFamily: numericFontFamily, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {balanceByPhone.loading ? (
                      <CircularProgress size={24} />
                    ) : balanceByPhone.error ? (
                      <Alert severity="error">{balanceByPhone.error}</Alert>
                    ) : (
                      <span>
                        {balanceByPhone.data?.current_balance
                          ? formatCurrency(balanceByPhone.data.current_balance)
                          : 0}{" "}
                        Birr
                      </span>
                    )}
                  </Typography>
                </Paper>
              </Grid>

              {approvalModal.transaction.note && (
                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      bgcolor: 'background.default',
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 600, color: 'warning.dark' }}
                    >
                      Notes
                    </Typography>
                    <Typography variant="body1">
                      {approvalModal.transaction.note}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={closeApprovalModal}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprovalConfirm}
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          //enabled={balanceByPhone.data?.current_balance >= approvalModal.transaction.amount}
          >
            Approve Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Void Confirmation Modal */}
      <Dialog
        open={voidModal.open}
        onClose={closeVoidModal}
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            px: 4,
            py: 3,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <BlockIcon sx={{ color: 'error.main' }} />
          <Box>
            <Typography variant="h3" component="h2">
              Void Withdrawal Request
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Are you sure you want to void this withdrawal request?
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              This will permanently mark the request as void and cannot be
              reversed.
            </Typography>
          </Alert>
          {voidModal.transaction && (
            <Paper
              variant="outlined"
              sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}
            >
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Transaction ID
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, fontFamily: numericFontFamily }}
                  >
                    {voidModal.transaction.trxid ||
                      voidModal.transaction._id.slice(-8)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography
                    variant="h6"
                    color="error.main"
                    sx={{ fontWeight: 700, fontFamily: numericFontFamily, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatCurrency(voidModal.transaction.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Username
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {voidModal.transaction.username}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {voidModal.transaction.phone}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={closeVoidModal}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleVoidConfirm}
            variant="contained"
            color="error"
            startIcon={<BlockIcon />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            Void Request
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManualWithdrawManager;
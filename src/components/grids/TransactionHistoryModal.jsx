import React, { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BalanceIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const TransactionHistoryModal = ({ open, onClose }) => {
  const { historyByPhone } = useSelector((state) => state.creditBalances);

  // Memoize summary calculations
  const summary = useMemo(() => {
    if (!historyByPhone?.data) return { totalCredit: 0, totalDebit: 0, balance: 0 };

    let totalCredit = 0;
    let totalDebit = 0;

    historyByPhone.data.forEach((tx) => {
      if (tx.isdebit) {
        totalDebit += tx.amount;
      } else {
        totalCredit += tx.amount;
      }
    });

    return {
      totalCredit,
      totalDebit,
      balance: totalCredit - totalDebit,
    };
  }, [historyByPhone?.data]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, minHeight: '60vh' }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2,
        }}
      >
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          Transaction History
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Summary Cards */}
        <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                  <TrendingUpIcon sx={{ color: 'success.main', fontSize: 28 }} />
                  <Box>
                    <Typography variant="body2" color="success.dark" sx={{ fontWeight: 500 }}>
                      Total Debit
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {formatCurrency(summary.totalDebit)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                  <TrendingDownIcon sx={{ color: 'error.main', fontSize: 28 }} />
                  <Box>
                    <Typography variant="body2" color="error.dark" sx={{ fontWeight: 500 }}>
                      Total Credit
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
                      {formatCurrency(summary.totalCredit)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            {/* <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                  <BalanceIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                  <Box>
                    <Typography variant="body2" color="primary.dark" sx={{ fontWeight: 500 }}>
                      Current Balance
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        color: summary.balance >= 0 ? 'success.main' : 'error.main' 
                      }}
                    >
                      {formatCurrency(summary.balance)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid> */}
          </Grid>
        </Box>

        {/* Transaction Table */}
        <Box sx={{ p: 3 }}>
          {historyByPhone?.data && historyByPhone.data.length > 0 ? (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Transaction Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Description</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, py: 2 }}>Amount</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, py: 2 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyByPhone.data.map((tx, idx) => (
                    <TableRow 
                      key={idx}
                      sx={{ 
                        '&:hover': { bgcolor: 'grey.50' },
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatDate(tx.date)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {tx.type}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2, maxWidth: 300 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            wordBreak: 'break-word',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {tx.message}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 2 }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 600,
                            color: tx.isdebit ? 'success.main' : 'error.main'
                          }}
                        >
                          {tx.isdebit ? '+' : '-'}{formatCurrency(tx.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 2 }}>
                        <Chip
                          label={tx.isdebit ? 'Debit' : 'Credit'}
                          color={tx.isdebit ? 'success' : 'error'}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 6, 
                textAlign: 'center', 
                border: '1px solid', 
                borderColor: 'divider',
                bgcolor: 'grey.50'
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Transactions Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                There are no transaction records available at this time.
              </Typography>
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 3, 
          borderTop: 1, 
          borderColor: 'divider',
          justifyContent: 'flex-end',
          gap: 1
        }}
      >
        <Button 
          onClick={onClose} 
          variant="contained" 
          size="large"
          sx={{ 
            minWidth: 120,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionHistoryModal;
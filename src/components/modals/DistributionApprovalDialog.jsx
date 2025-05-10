import React, { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  IconButton,
  Divider,Alert
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

import {useSelector} from 'react-redux';
import {selectApprovalLoading,selectApprovalError,selectIsApproved} from '../../state/slices/distributionSlice';

const ApprovalSummaryDialog = ({ 
  open, 
  onClose, 
  itemsToApprove = [], 
  onConfirmApproval,
  approvalNote,
  setApprovalNote 
}) => {
  // Group data by phone and role
  
  const approvalLoading = useSelector(selectApprovalLoading);
  const approvalError = useSelector(selectApprovalError);
  const isApproved = useSelector(selectIsApproved);
  
  const groupedData = useMemo(() => {
    // By Phone
    const byPhone = itemsToApprove.reduce((acc, item) => {
      const phone = item.phone || 'Unknown';
      if (!acc[phone]) {
        acc[phone] = {
          items: [],
          count: 0,
          totalAmount: 0
        };
      }
      acc[phone].items.push(item);
      acc[phone].count += 1;
      acc[phone].totalAmount += item.amount || 0;
      return acc;
    }, {});

    // By Role
    const byRole = itemsToApprove.reduce((acc, item) => {
      const role = item.role || 'Unknown';
      if (!acc[role]) {
        acc[role] = {
          items: [],
          count: 0,
          totalAmount: 0
        };
      }
      acc[role].items.push(item);
      acc[role].count += 1;
      acc[role].totalAmount += item.amount || 0;
      return acc;
    }, {});

    return { byPhone, byRole };
  }, [itemsToApprove]);

  // Calculate totals
  const totals = useMemo(() => {
    return itemsToApprove.reduce((acc, item) => {
      acc.count += 1;
      acc.totalAmount += item.amount || 0;
      acc.totalPlayers += item.yourPlayers || 0;
      return acc;
    }, { count: 0, totalAmount: 0, totalPlayers: 0 });
  }, [itemsToApprove]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Approval Summary</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Summary Header */}
        <Box mb={3}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Pending Approvals
                  </Typography>
                  <Typography variant="h4">
                    {totals.count}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(totals.totalAmount)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Players
                  </Typography>
                  <Typography variant="h4">
                    {totals.totalPlayers}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        {/* Grouped by Phone */}
        <Typography variant="h6" gutterBottom>
          Summary by Phone
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Phone</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell align="right">Count</TableCell>
                <TableCell align="right">Total Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedData.byPhone).map(([phone, data], index) => (
                <TableRow key={index} hover>
                  <TableCell>{phone}</TableCell>
                  <TableCell>
                    {data.items[0]?.owner || 'Unknown'}
                  </TableCell>
                  <TableCell align="right">{data.count}</TableCell>
                  <TableCell align="right">{formatCurrency(data.totalAmount)}</TableCell>
                </TableRow>
              ))}
              {itemsToApprove.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No pending approvals
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Grouped by Role */}
        <Typography variant="h6" gutterBottom>
          Summary by Role
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Role</TableCell>
                <TableCell align="right">Count</TableCell>
                <TableCell align="right">Total Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedData.byRole).map(([role, data], index) => (
                <TableRow key={index} hover>
                  <TableCell>{role}</TableCell>
                  <TableCell align="right">{data.count}</TableCell>
                  <TableCell align="right">{formatCurrency(data.totalAmount)}</TableCell>
                </TableRow>
              ))}
              {itemsToApprove.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No pending approvals
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Approval Note */}
        {/* <Box mt={2}>
          <TextField
            label="Approval Note"
            variant="outlined"
            fullWidth
            multiline
            rows={2}
            value={approvalNote}
            onChange={(e) => setApprovalNote(e.target.value)}
            placeholder="Add a note for this approval (optional)"
          />
        </Box> */}
      </DialogContent>

      <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', px: 3, pb: 2, pt: 1 }}>
  {/* Error or Success Alert */}
  {approvalError && (
    <Alert severity="error" sx={{ mb: 2 }}>
      {approvalError}
    </Alert>
  )}
  {isApproved && (
    <Alert severity="success" sx={{ mb: 2 }}>
      Approval Successful!
    </Alert>
  )}

  {/* Action Buttons */}
  <Box display="flex" justifyContent="flex-end" gap={1}>
    <Button onClick={onClose} color="inherit">
      Cancel
    </Button>
    <Button
      onClick={() => onConfirmApproval(itemsToApprove, approvalNote)}
      color="primary"
      variant="contained"
      disabled={itemsToApprove.length === 0 || approvalLoading}
    >
      {approvalLoading ? 'Approving...' : 'Confirm Approve'}
    </Button>
  </Box>
</DialogActions>

    </Dialog>
  );
};

export default ApprovalSummaryDialog;
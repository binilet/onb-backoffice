import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import AutoModeIcon from '@mui/icons-material/AutoMode';

// Define the WinningDistribution type for reference
/*
class WinningDistributionInDB(BaseModel):
  gameId: str
  date: Optional[datetime] = None
  totalPlayers: int
  betAmount: float
  totalWinning: float
  distributable: float
  yourPlayers: int
  yourPercent: float
  amount: float
  phone: str
  owner: str
  role: str
  deposited: bool
  approved: bool = False
  approvedBy: Optional[str] = None
  approvedDate: Optional[datetime] = None
  note: Optional[str] = ""
*/

  const WinningDistributionDialog = ({ open, onClose, data = [], onApproveAll,handleRedistribute }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'approved', 'pending'
  const [approvalNote, setApprovalNote] = useState('');

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!data || data.length === 0) return {
      totalDistributable: 0,
      totalPlayers: 0,
      totalAmount: 0,
      totalWinning: 0,
      playerWinning: 0,
      approvedCount: 0,
      pendingCount: 0,
    };

    return data.reduce((acc, item) => {
      return {
        totalDistributable: acc.totalDistributable + (item.distributable || 0),
        totalPlayers: acc.totalPlayers + (item.totalPlayers || 0),
        totalAmount: acc.totalAmount + (item.amount || 0),
        totalWinning: acc.totalWinning + (item.totalWinning || 0),
        playerWinning: acc.playerWinning + ((item.totalWinning || 0) - (item.distributable || 0)),
        approvedCount: acc.approvedCount + (item.approved ? 1 : 0),
        pendingCount: acc.pendingCount + (!item.approved ? 1 : 0),
      };
    }, {
      totalDistributable: 0,
      totalPlayers: 0,
      totalAmount: 0,
      totalWinning: 0,
      playerWinning: 0,
      approvedCount: 0,
      pendingCount: 0,
    });
  }, [data]);

  // Filter and search data
  const filteredData = useMemo(() => {
    return data.filter(item => {
     
      const matchesSearch = 
        (item.gameId && item.gameId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.owner && item.owner.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.phone && item.phone.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (filterStatus === 'all') return matchesSearch;
      if (filterStatus === 'approved') return matchesSearch && item.approved;
      if (filterStatus === 'pending') return matchesSearch && !item.approved;
      
      return matchesSearch;
    });
  }, [data, searchTerm, filterStatus]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

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
      maxWidth="lg"
      fullScreen={true}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Winning Distribution</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Winning
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(summary.totalWinning)}
                </Typography>
                <Box mt={1}>
                  <Typography variant="body2">
                    Total Players: {summary.totalPlayers}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Player Winning
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(summary.playerWinning)}
                </Typography>
                <Box mt={1}>
                  <Typography variant="body2">
                    {summary.totalWinning > 0 ? 
                      `${((summary.playerWinning / summary.totalWinning) * 100).toFixed(1)}% of Total` : '0% of Total'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Distributable
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(summary.totalDistributable)}
                </Typography>
                <Box mt={1}>
                  <Typography variant="body2">
                    {summary.totalWinning > 0 ? 
                      `${((summary.totalDistributable / summary.totalWinning) * 100).toFixed(1)}% of Total` : '0% of Total'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Distribution
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(summary.totalAmount)}
                </Typography>
                
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Search & Filter */}
        <Box
      mb={2}
      display="flex"
      flexDirection={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'stretch', sm: 'center' }}
      gap={2}
    >
      <TextField
        placeholder="Search by ID, Owner or Phone"
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ width: { xs: '100%', sm: '300px' } }} // Full width on XS, fixed on SM+
      />

      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }} // Stacks button groups vertically on XS
        alignItems={{ xs: 'stretch', sm: 'center' }} // Stretches on XS
        gap={2} // Gap between the two button groups on XS, and between search and buttons on SM+
        sx={{ width: { xs: '100%', sm: 'auto' } }} // Takes full width on XS
      >
        {/* Filter Buttons */}
        <Stack
          direction={{ xs: 'row', sm: 'row' }} // Always row, but fullWidth buttons handle mobile
          spacing={1}
          sx={{ width: { xs: '100%', sm: 'auto' } }} // Takes full width on XS for its children
        >
          <Button
            variant={filterStatus === 'all' ? "contained" : "outlined"}
            size="small"
            onClick={() => setFilterStatus('all')}
            fullWidth // Ensures button takes available width, good for mobile
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'approved' ? "contained" : "outlined"}
            color="success"
            size="small"
            onClick={() => setFilterStatus('approved')}
            startIcon={<CheckCircleIcon />}
            fullWidth
          >
            Approved
          </Button>
          <Button
            variant={filterStatus === 'pending' ? "contained" : "outlined"}
            color="warning"
            size="small"
            onClick={() => setFilterStatus('pending')}
            startIcon={<CancelIcon />} // Changed from PendingIcon for a standard MUI icon
            fullWidth
          >
            Pending
          </Button>
        </Stack>

        {/* Action Buttons */}
        <Stack
          direction={{ xs: 'row', sm: 'row' }} // Always row, but fullWidth buttons handle mobile
          spacing={1}
          sx={{ width: { xs: '100%', sm: 'auto' } }} // Takes full width on XS for its children
        >
          <Button
            variant="contained"
            color="primary"
            disabled={filteredData.filter(item => !item.approved).length === 0}
            onClick={() => {
              onApproveAll && onApproveAll(filteredData.filter(item => !item.approved), approvalNote);
            }}
            fullWidth // Full width for better mobile tap targets
          >
            Approve All ({filteredData.filter(item => !item.approved).length})
          </Button>
          <Button
            variant="contained"
            color="primary"
            // Assuming similar disable logic or different, adjust as needed
            disabled={filteredData.filter(item => !item.approved).length === 0} // Example, adjust if redistribute has different logic
            onClick={handleRedistribute} // Placeholder function, replace with actual logic
            startIcon={<AutoModeIcon />}
            fullWidth // Full width for better mobile tap targets
          >
            Redistribute
          </Button>
        </Stack>
      </Box>
    </Box>

        
        {/* Data Table */}
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Game ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell align="right">Players</TableCell>
                <TableCell align="right">Your %</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Deposited</TableCell>
                <TableCell>Approved</TableCell>
                <TableCell>Note</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell component="th" scope="row">
                      {row.gameId}
                    </TableCell>
                    <TableCell>{formatDate(row.date)}</TableCell>
                    <TableCell>{row.owner}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell align="right">
                      {row.yourPlayers} / {row.totalPlayers}
                    </TableCell>
                    <TableCell align="right">
                      {row.yourPercent.toFixed(1)}%
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(row.amount)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.deposited ? "Deposited" : "Pending"}
                        color={row.deposited ? "success" : "warning"}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.approved ? "Approved" : "Pending"}
                        color={row.approved ? "success" : "warning"}
                      />
                    </TableCell>
                    <TableCell>
                      {row.note || 'No notes'}
                    </TableCell>
                  </TableRow>
                ))}
              
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No distribution records found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default WinningDistributionDialog;
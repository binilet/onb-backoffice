import React, { useState, useEffect } from "react";
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
  TextField,
  CircularProgress,
  IconButton,
  Box,
  Grid,
  Typography,
  Divider,
  Paper,
  Tooltip,
} from "@mui/material";
import { Edit as EditIcon, Save as SaveIcon, Close as CloseIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
//import { calculateCreditDistribution as distributeGameAmount } from '../../redux/slices/jackpot/jackpotCreditSlice';
//import { createDistributionBulkAsync } from "src/redux/slices/jackpot/jackpotCreditDistributionSlice";

const DistributionDialog = ({ game, open, onClose }) => {
  const dispatch = useDispatch();
  const { __distributionData, __credit_distribution_message, __credit_distribution_loading } = useSelector(
    (state) => state.jackpotCredit
  );
  const { __credit_distribution_data, __credit_distribution_error, __credit_distribution_status } = useSelector(
    (state) => state.jackpotCreditDistribution
  );

  const [editedDistribution, setEditedDistribution] = useState([]);

  useEffect(() => {
    if (open) {
      dispatch(distributeGameAmount(game.gameId));
    }
  }, [open, game.gameId, dispatch]);

  useEffect(() => {
    if (__distributionData) {
      setEditedDistribution(__distributionData.distribution);
    }
  }, [__distributionData]);

  const handleAmountChange = (index, value) => {
    const updatedDistribution = [...editedDistribution];
    updatedDistribution[index].amount = value;
    setEditedDistribution(updatedDistribution);
  };

  const handleSave = () => {
    //console.log("Save data:", editedDistribution);
    //onClose();
    //console.log(editedDistribution);

    if (editedDistribution && editedDistribution.length > 0) {
      
      let data = editedDistribution.map((t) => ({
        phone: t.phone,
        username: t.name,
        amount: t.amount,
        role: t.role,
        owner: t.owner,
        game_id: game.gameId,
        date:game.startDateTime,
        owner:t.owner,
        totalPlayers: t.totalPlayers,
        playerCount: t.playerCount,
        fromBranch:t.fromBranch
      }));
      dispatch(createDistributionBulkAsync(data));
    } else {
      console.log('no data to save!');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight="bold" color="primary">
            Distribution for {__distributionData?.game_name || 'Game'}
          </Typography>
          {__credit_distribution_message && (
            <span style={{ color: 'red', fontSize: '11px' }}>{__credit_distribution_message}</span>
          )}
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {__credit_distribution_loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={2} mb={2}>
  {[
    { label: 'Total Winning', value: __distributionData?.total_winning, color: '#2196F3' },
    {
      label: 'Jackpot',
      value: __distributionData?.jackpot && Array.isArray(__distributionData.jackpot)
        ? `$${__distributionData.jackpot.reduce((sum, num) => sum + num, 0)}`
        : '$0',
      color: '#4CAF50'
    },
    { label: 'House Bonus', value: __distributionData?.houseBonus, color: '#9C27B0' },
    { label: 'Total Package', value: __distributionData?.adminBonus, color: '#ff00B0' },
    { label: 'Total Players', value: __distributionData?.totalPlayers, color: '#FF9800' },
    { label: 'Total Distributable', value: __distributionData?.totalDistributable, color: '#E91E63' },
    { label: 'Bet Amount', value: __distributionData?.betAmount, color: '#673AB7' },
    { label: 'Total System Cut', value: __distributionData?.systemCut, color: '#F44336' },
  ].map((item, index) => (
    <Grid item xs={12} sm={6} md key={index}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          textAlign: 'center',
          height: '100%',
          borderRadius: 2,
          background: '#ffffff',
          border: '1px solid #e0e0e0',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderColor: item.color
          }
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 1,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {item.label}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: 'text.primary',
            fontWeight: 700,
            fontSize: '1.25rem'
          }}
        >
          {typeof item.value === 'number' ? 
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(item.value) 
            : (item.value || 'N/A')}
        </Typography>
      </Paper>
    </Grid>
  ))}
</Grid>

            <Divider sx={{ mb: 3 }} />

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">Phone</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Name</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Role</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Amount</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Owner</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Player Count</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Players</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Branch</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {editedDistribution?.map((entry, index) => (
                    <TableRow key={index} hover style={{backgroundColor:entry.phone === 'SYSTEM' ? '#00f0ff' : 'transparent'}}>
                      <TableCell>{entry.phone}</TableCell>
                      <TableCell>{entry.name}</TableCell>
                      <TableCell>{entry.role}</TableCell>
                      <TableCell sx={{backgroundColor:'#637381',color:'#fff',fontWeight:'bolder'}}>
                        {entry.amount?.toFixed(2)}
                      </TableCell>
                      <TableCell>{entry.owner}</TableCell>
                      <TableCell>{entry.playerCount}</TableCell>
                      <TableCell>{entry.totalPlayers}</TableCell>
                      <TableCell>{entry.fromBranch}</TableCell>
                      {/* <TableCell>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => console.log('Edit clicked for', entry.phone)} size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>


      <DialogActions sx={{ p: 2 }}>
      {__credit_distribution_error && <span style={{fontSize:'10px',color:'red',fontWeight:'bolder'}}>{`${__credit_distribution_error}`}</span>}
      {__credit_distribution_status && <span style={{fontSize:'10px',color:'green',fontWeight:'bolder'}}>{`${__credit_distribution_status}`}</span>}
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained" startIcon={<SaveIcon />}>
          Save
        </Button>
        
      </DialogActions>
    </Dialog>
  );
};

export default DistributionDialog;

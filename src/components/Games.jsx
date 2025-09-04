import React, { useState, useEffect } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  SportsEsports as GameIcon,
  Group as PlayersIcon,
  AttachMoney as MoneyIcon,
  DateRange,
  Refresh,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGamesByDateRange } from '../state/slices/gameSlice';
import { resetApproval,approveDistribution,fetchWinningDistributions,selectWinningDistributions,selectWinningsError,selectWinningsLoading,resetDistributions } from '../state/slices/distributionSlice';
import GameDetail from './GameDetail';
import WinningDistributionDialog from './modals/WinningDistributionDialog';
import ApprovalSummaryDialog from './modals/DistributionApprovalDialog';

const GameGrid = () => {
  const dispatch = useDispatch();
  const { games, loading, error } = useSelector((state) => state.games);
  const [selectedGame, setSelectedGame] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [gameDistribution, setGameDistribution] = useState(null);
  
  const winningsLoading = useSelector(selectWinningsLoading);
  const winningsError = useSelector(selectWinningsError); 
  const winningDistributions = useSelector(selectWinningDistributions); 


  useEffect(() => {
    dispatch(fetchGamesByDateRange({
      startDate: null,
      endDate: null,
    }));
  }, []);

  useEffect(() => {
    if(winningDistributions && winningDistributions.length > 0)
      setGameDistribution(true);
  },[winningDistributions]);

  const handleDateFilter = () => {
    dispatch(fetchGamesByDateRange({
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    }));
  };

  // Calculate summary statistics
  const gameSummary = {
    totalGames: games?.length || 0,
    totalBets: games?.reduce((sum, game) => sum + (game.bet_amount*game.number_of_players), 0) || 0,
    completedGames: games?.filter(game => game.game_completed).length || 0,
    totalPlayers: games?.reduce((sum, game) => sum + game.number_of_players, 0) || 0,
    totalCuts:games?.reduce((sum, game) => sum + (game.cut_amount), 0) || 0,
  };

  const handleGameDistribution = (game,redistribute) => {
    //alert('Distributing winnings for game: ' + game.game_id);
    dispatch(fetchWinningDistributions({ gameId: game.game_id,redistribute: redistribute?true:false }));
  }

  const handleCloseGameDistribution = () => {
    setGameDistribution(false);
    setSelectedGame(null);
    setApprovalDialogOpen(false);
    dispatch(resetDistributions())
  }
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');

  const handleConfirmApproval = () => {
    let game_id = (winningDistributions[0].gameId);
    if(game_id)
      dispatch(approveDistribution({ game_id: game_id }));
  }
  const handleApprovalDialogClose = () => {
    setApprovalDialogOpen(false);
    dispatch(resetApproval())
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <WinningDistributionDialog 
      open={gameDistribution} 
      onClose={handleCloseGameDistribution} 
      data={winningDistributions} 
      onApproveAll={()=>setApprovalDialogOpen(true)}
      handleRedistribute={handleGameDistribution}
      />
      
      <ApprovalSummaryDialog
        open={approvalDialogOpen}
        onClose={handleApprovalDialogClose}
        itemsToApprove={winningDistributions}
        approvalNote={approvalNote}
        setApprovalNote={setApprovalNote}
        onConfirmApproval={handleConfirmApproval}
      />
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="600">
          Game Transactions
        </Typography>
        <Button
          startIcon={<Refresh />}
          variant="outlined"
          onClick={handleDateFilter}
          disabled={loading}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'primary.lighter' }}>
                <GameIcon sx={{ color: 'primary.main' }} />
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">Total Games</Typography>
                <Typography variant="h4" sx={{ mt: 0.5 }}>{gameSummary.totalGames}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'success.lighter' }}>
                <MoneyIcon sx={{ color: 'success.main' }} />
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">Total Bets</Typography>
                <Typography variant="h4" sx={{ mt: 0.5 }}>${gameSummary.totalBets.toFixed(2)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'success.lighter' }}>
                <MoneyIcon sx={{ color: 'success.main' }} />
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">Total Cut</Typography>
                <Typography variant="h4" sx={{ mt: 0.5 }}>${gameSummary.totalCuts.toFixed(2)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'warning.lighter' }}>
                <PlayersIcon sx={{ color: 'warning.main' }} />
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">Total Players</Typography>
                <Typography variant="h4" sx={{ mt: 0.5 }}>{gameSummary.totalPlayers}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'info.lighter' }}>
                <GameIcon sx={{ color: 'info.main' }} />
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">Completed Games</Typography>
                <Typography variant="h4" sx={{ mt: 0.5 }}>{gameSummary.completedGames}</Typography>
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
                disabled={!startDate || !endDate || loading}
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

      {/* Error State */}
      {error && (
        <Card sx={{ mb: 3, bgcolor: 'error.lighter', border: 1, borderColor: 'error.light' }}>
          <CardContent>
            <Typography color="error" variant="body2">{error}</Typography>
          </CardContent>
        </Card>
      )}

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
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Game ID</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Players</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Bet Amount</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Detail</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    Loading games...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : games?.length > 0 ? (
              games.map((game) => (
                <TableRow
                  key={game.game_id}
                  hover
                >
                  <TableCell>{game.game_id}</TableCell>
                  <TableCell>{new Date(game.date).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      icon={<PlayersIcon sx={{ fontSize: 16 }} />}
                      label={game.number_of_players}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<MoneyIcon sx={{ fontSize: 16 }} />}
                      label={`$${game.bet_amount.toFixed(2)}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={game.game_completed ? 'Completed' : 'In Progress'}
                      size="small"
                      color={game.game_completed ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setSelectedGame(game)}
                      startIcon={<SearchIcon />}
                    >
                      View
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleGameDistribution(game)}
                      startIcon={<SearchIcon />}
                    >
                      Distribute
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No games found
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

      {selectedGame && (
        <GameDetail
          game={selectedGame}
          open={!!selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </Box>
  );
};

export default GameGrid;
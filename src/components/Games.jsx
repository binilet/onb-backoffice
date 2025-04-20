import React, { useState,useEffect } from 'react';
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
} from '@mui/material';
import { fetchGamesByDateRange } from '../state/slices/gameSlice'; // Adjust the import path as necessary

import { useDispatch, useSelector } from 'react-redux';

import GameDetail from './GameDetail'; // Adjust the import path as necessary


const GameGrid = () => {

  const dispatch = useDispatch();
  const { games, loading, error } = useSelector((state) => state.games);

  const [selectedGame, setSelectedGame] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');


    useEffect(() => {
        // Fetch games when the component mounts or when startDate/endDate changes
        dispatch(fetchGamesByDateRange({
            startDate: null,
            endDate: null,
        }));
    },[]);

  // For future Redux integration: dispatch fetchGamesByDateRange with startDate and endDate
  const handleDateFilter = () => {
    dispatch(fetchGamesByDateRange({
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        {`Game Transactions (${games?.length || 0} games)`}
      </Typography>
    {/* Loading and Error States */}
    {loading && (
        <Typography variant="body2" color="text.secondary" align="center" mb={2}>
            Loading games...
        </Typography>
    )}
    {error && (
        <Typography variant="body2" color="error" align="center" mb={2}>
            {`Error: ${error}`}
        </Typography>
    )}
      {/* Date Range Filter */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={5}>
          <TextField
            label="Start Date"
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
            label="End Date"
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
            disabled={!startDate || !endDate}
            fullWidth
            sx={{ height: '100%' }}
          >
            Filter
          </Button>
        </Grid>
      </Grid>
      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: 2,
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="game transactions table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Game ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Players</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Bet Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Completed</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {games?.length > 0 ? (
              games?.map((game) => (
                <TableRow
                  key={game.game_id}
                  hover
                  sx={{
                    '&:hover': { backgroundColor: '#f9f9f9' },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <TableCell component="th" scope="row" sx={{ py: 1.5 }}>
                    {game.game_id}
                  </TableCell>
                  <TableCell>
                    {new Date(game.date).toLocaleString()}
                  </TableCell>
                  <TableCell>{game.number_of_players}</TableCell>
                  <TableCell>${game.bet_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={game.game_completed ? 'success.main' : 'error.main'}
                    >
                      {game.game_completed ? 'Yes' : 'No'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => setSelectedGame(game)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No games found
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
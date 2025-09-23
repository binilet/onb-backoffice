import React, { useState, useEffect } from 'react';
import { Box, Grid, Button, List, ListItem, Typography, Divider, Paper, TextField, Checkbox, FormControlLabel, useMediaQuery, useTheme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatterns, savePattern, updatePattern, resetStatus } from '../state/slices/patternSlice';

import PatternGrid from './patternGrid';

const JackpotPatternComponent = () => {
  const dispatch = useDispatch();
  const patterns = useSelector((state) => state.jackpotPattern.list);
  const status = useSelector((state) => state.jackpotPattern.status);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedPattern, setSelectedPattern] = useState(null);
  const [grid, setGrid] = useState(createEmptyGrid());
  const [isNew, setIsNew] = useState(true);
  const [patternName, setPatternName] = useState('');
  const [patternError, setPatternError] = useState(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    dispatch(fetchPatterns());
  }, [dispatch]);

  function createEmptyGrid() {
    return Array(5).fill().map(() => Array(5).fill(false));
  }

  const handleCellClick = (row, col) => {
    const newGrid = grid.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? !cell : cell))
    );
    setGrid(newGrid);
  };

  const handleSavePattern = () => {
    setPatternError(null);
    if (!patternName) {
      setPatternError('Please add a pattern name!');
      return;
    }

    const selectedCells = grid.flat().filter(cell => cell).length;

    if (selectedCells < 5) {
      setPatternError('Pattern Error: Select at least five cells.');
      return;
    }

    const patternData = {
      name: patternName,
      grid,
      isActive,
    };

    if (isNew) {
      dispatch(savePattern(patternData));
    } else {

      dispatch(updatePattern({ ...patternData, id: selectedPattern?.id }));
    }
    handleNewPattern(true);
  };

  const handleNewPattern = (keepstatus) => {
    setGrid(createEmptyGrid());
    setSelectedPattern(null);
    setIsNew(true);
    setPatternName('');
    setIsActive(true);
    if(!keepstatus)
        dispatch(resetStatus());
  };

  const handleSelectPattern = (pattern) => {
    setSelectedPattern(pattern);
    setGrid(pattern.grid);
    setPatternName(pattern.name);
    setIsActive(pattern.isActive);
    setIsNew(false);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        {/* Left Side - Saved Patterns List */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ padding: 2, height: '100%' }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleNewPattern}
              sx={{ marginBottom: 2, fontWeight: 'bold' }}
            >
              Create New Pattern
            </Button>
            <Divider sx={{ marginBottom: 2 }} />
            <List sx={{ maxHeight: isSmallScreen ? '200px' : '400px', overflow: 'auto' }}>
              {patterns?.map((pattern) => (
                <ListItem
                  button
                  key={pattern.id}
                  onClick={() => handleSelectPattern(pattern)}
                  selected={selectedPattern && selectedPattern.id === pattern.id}
                  sx={{
                    mb: 1,
                    borderRadius: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{pattern.name}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      {/* <Typography variant="caption" sx={{ color: pattern.isActive ? 'success.main' : 'error.main' }}>
                        {pattern.isActive ? 'Active' : 'Inactive'}
                      </Typography> */}
                      <PatternGrid grid={pattern.grid} editable={false} size={20} />
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Right Side - Pattern Drawing Grid */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            {status && <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold', display: 'block', mb: 1 }}>{status}</Typography>}
            <Box sx={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', alignItems: 'center', mb: 2 }}>
              <TextField
                error={!!patternError}
                helperText={patternError}
                fullWidth
                variant="outlined"
                value={patternName}
                onChange={(e) => setPatternName(e.target.value)}
                sx={{ mb: isSmallScreen ? 2 : 0, mr: isSmallScreen ? 0 : 2 }}
                InputProps={{
                  sx: {
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: '#1976d2',
                  },
                }}
              />
              <FormControlLabel
                control={<Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
                label="Active"
              />
            </Box>
            <PatternGrid grid={grid} editable={true} onCellClick={handleCellClick} size={isSmallScreen ? 40 : 50} />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ marginTop: 2, fontWeight: 'bold' }}
              onClick={handleSavePattern}
            >
              {isNew ? 'Save New Pattern' : 'Update Pattern'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JackpotPatternComponent;
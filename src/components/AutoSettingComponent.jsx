import React, { useEffect, useState } from 'react';
import {
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Switch,
  Select,
  MenuItem,
  FormControlLabel,
  useMediaQuery,
  Checkbox,
  IconButton,
  Tooltip,
  CircularProgress,
  Typography,
  Stack,
  Collapse,
  Menu,
  MenuItem as MuiMenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Phone as PhoneIcon,
  AttachMoney as MoneyIcon,
  MoreVert as MoreVertIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Casino as CasinoIcon,
  Search as SearchIcon,
  GetApp as GetAppIcon,
  List,
  Undo as UndoIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

import JackpotPatternComponent from './jackpotPattern';
import ErrorModal from './ErrorModal';

import { useSelector, useDispatch } from 'react-redux';

import {
  fetchGames,
  createOrUpdateGame,  createGame,
  updateGame,
  resetSaved,
} from '../state/slices/autoGame';

import { fetchPatterns } from '../state/slices/patternSlice';

//import Iconify from 'src/components/iconify';
import DistributionDialog from './DistributionDialog';
/*import {
  reset_distribution_states,
  
} from 'src/redux/slices/jackpot/jackpotCreditDistributionSlice';*/
import GameDetailsDialog from './AutoGameDetail';


const adjustToGMT3 = (dateString) => {
  return dateString;
};

//import { get_distinct_branch_names } from 'src/redux/slices/companySlice';
//import { jackpotDashboardData,getSummerizedDashboardData } from 'src/redux/slices/jackpot/jackpotDashboardSlice';
//import { createDistributionBulkAsync } from "src/redux/slices/jackpot/jackpotCreditDistributionSlice";
//import AdminBonusDialog from './AdminBonusDialog';

import { createSelector } from '@reduxjs/toolkit';
import { shallowEqual } from 'react-redux';

const selectJackpotGame = (state) => state.autoGame;
//memoize jackpot
const selectFilteredJackpotGame = createSelector(
  [selectJackpotGame],
  (jackpotGame)=>{
    const {latestGameTime, ...rest} = jackpotGame;
    return rest;
  }
);

const AutoSettingComponent = () => {


  //console.log('is rendering multiple times?');

  const dispatch = useDispatch();

 

  const { __todayGames, __saved, __loading, __error, __users_credit } = useSelector(
    selectFilteredJackpotGame,
    shallowEqual // 👈 Add shallow equality check
  );

  const transferDetail = useSelector((state) => state.auth.transferDetail);
  const [errorModal, setErrorModal] = useState({ open: false, message: '' });
  const [value, setValue] = useState(0);
  const patterns = useSelector((state) => state.jackpotPattern.list);

  const theme = useTheme();
  // New state for JackpotGame
  const [gameId, setGameId] = useState('');
  const [gameName, setGameName] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [totalWinning, setTotalWinning] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [startDateTime, setStartDateTime] = useState(null);
  const [patternId, setSelectedPatternId] = useState(null);
  const [hasJackpot, setHasJackpot] = useState(false);
  const [jackpotWinning, setJackpotWinning] = useState([]);
  const [jackpotWinner, setJackpotWinner] = useState('');
  const [isVoid, setIsVoid] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [note, setNote] = useState('');
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [houseBonus, setHouseBonus] = useState(0);
  const [isPaidCriteria, setIsPaidCriteria] = useState(null);
  const [collapseOpen, setCollapseOpen] = useState(false);
  const _logged_in_user = useSelector((state) => state.auth.user);
  const [selectedBranches, setSelectedBranches] = useState([]);
  
  const [houseBonusBranches,setHouseBonusBranches] = useState([]);


  const formatCurrency = (amount) => `$${amount ? amount.toFixed(2) : 0}`;


  const handleIsPaidChange = (e) => {
    if (e.target.value === '') {
      setIsPaidCriteria(null);
    } else {
      setIsPaidCriteria(e.target.value);
    }
  };

  useEffect(() => {
    //dispatch(jackpotDashboardData({start:null,end:null}));
    //dispatch(getSummerizedDashboardData());
    //dispatch(get_distinct_branch_names());
    
  }, []);

  //fetch users credit
  useEffect(() => {
    //dispatch(getJackpotCreditByPhone(_logged_in_user?.phone));
  }, []);

  useEffect(() => {
    //dispatch(fetchUserCreditData());
  }, []);
  useEffect(() => {
    generate_game_id();
  }, []);

  useEffect(() => {
    dispatch(fetchPatterns());
  }, [dispatch]);

  
  useEffect(() => {
    if (__saved) {
      resetGameFields();
      dispatch(resetSaved());
    }
  }, [__saved]);

  useEffect(() => {
    async function fetchData() {
      const response = dispatch(fetchGames());
      return response;
    }
    fetchData();
    
  }, []);
  
  useEffect(() => {
    if (transferDetail && transferDetail.role === 'Employee') {
      setOpenCashierCreditModal(true);
    } else if (transferDetail) {
      setOpenConfirmation(true);
    }
    
  }, [transferDetail]);


  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleCashierCreditModalClose = async () => {
    setOpenCashierCreditModal(false);
    //await //dispatch(resetTransferDetail());
  }
  // Add handlers
  const handleReverseTransaction = async (transaction) => {
    setReverseLoading(true);
    try {
      setShowReverseModal(false);
      // Optionally refresh data
    } catch (error) {
      setErrorModal({
        open: true,
        message: error.message || 'Failed to reverse transaction',
      });
    } finally {
      setReverseLoading(false);
    }
  };


 
  const handleErrorModalClose = () => {
    setErrorModal({ open: false, message: '' });
  };

  const handleGameSubmit = async (event) => {
    event.preventDefault();

    if (!startTime) {
      setErrorModal({ open: true, message: 'Please set start time!' });
      return;
    }

    if (!startDateTime) {
      setErrorModal({ open: true, message: 'Please set  the date!' });
      return;
    }

    const newGame = {
      gameId,
      gameName,
      betAmount: parseFloat(betAmount),
      totalWinning: parseFloat(totalWinning),
      displayStartTime: startTime || "",
      startTimeLocal: new Date(startDateTime).toISOString(),
      pattern: patternId?.toString(),
      isVoid: !!isVoid,
      boardIds: [],
      callList: [],
      playerBoards: [],
      gameWinners: [],
    };

    //console.log(newGame);

    //dispatch game save;
    await dispatch(createOrUpdateGame(newGame));
    //dispatch(createGame(newGame));
  };

  const resetGameFields = () => {
    generate_game_id();
    setGameName('');
    setBetAmount('');
    setTotalWinning('');
    setStartTime('');
    setStartDateTime('');

   
    setIsVoid(false);
    setIsRunning(false);
    setNote('');
    setSelectedPatternId(null);
    setSelectedGame(null);
    setEditingGame(false);
    setSelectedBranches([]);
    setHouseBonusBranches([]);
    setHouseBonus(0);
  };

  const generate_game_id = () => {
    let prefix = 'HG-';
    let randomStr = Math.random().toString(36).substring(2, 9); // 7-digit random alphanumeric
    let timestamp = Date.now().toString().substring(5); // current timestamp
    setGameId(`${prefix}${randomStr}-${timestamp}`);
  };


  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const handleMenuClick = (event, game) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedGame(game);
    //console.log(game.gameId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const [editingGame, setEditingGame] = useState(false);

  const handleGameEdit = () => {
    if (!selectedGame) {
      setErrorModal({ open: true, message: 'Please select a game first!' });
      return;
    }
    setCollapseOpen(true);
    handleMenuClose();

    setEditingGame(true);
    // Populate form fields with selected game data
    setGameId(selectedGame.gameId);
    setGameName(selectedGame.gameName);
    setBetAmount(selectedGame.betAmount);
    setTotalWinning(selectedGame.totalWinning);
    setStartTime(selectedGame.startTime);
    // Convert startDateTime string to proper datetime format for input control
    const formattedDateTime = selectedGame.startDateTime ? adjustToGMT3(selectedGame.startDateTime) : null;
    setStartDateTime(formattedDateTime);

    if (selectedGame.pattern) {
      console.log(selectedGame.pattern.id);
      setSelectedPatternId(selectedGame.pattern.id);
    } else {
      setSelectedPatternId('');
    }
    setHasJackpot(selectedGame.hasJackpot);
    setJackpotWinning(selectedGame.jackpotWinning || []);
    setJackpotWinner(selectedGame.jackpotWinner || '');
    setIsVoid(selectedGame.isVoid);
    setIsPaid(selectedGame.isPaid);
    setIsDone(selectedGame.isDone);
    setIsRunning(selectedGame.isRunning);
    setNote(selectedGame.note || '');
    setSelectedBranches(selectedGame.jackpotBranches || []);
    setHouseBonus(selectedGame.houseBonus || 0);
    setHouseBonusBranches(selectedGame.houseBonusBranches || []);
    // Scroll to the form
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const [showDisribution, setShowDistribution] = useState(false);
  const [showAdminDistribution,setShowAdminDistribution] = useState(false);

  const handleWinningDistribution = () => {
    //alert(selectedGame);
    //dispatch(reset_distribution_states());
    setShowDistribution(true);
  };
  const closeDistributionDialog = () => {
    setShowDistribution(false);
    //dispatch(reset_distribution_states());
  };

  const handleAdminBonusDistributionClose = () => {
    setShowAdminDistribution(false);
  }

  const [showGameDetail, setShowDetail] = useState(false);
  const handleShowDetail = () => {
    setShowDetail(true);
  };
  const closeDetail = () => {
    setShowDetail(false);
    setSelectedGame(null);
  };

  const [showTransactionHistory, setShowTransactionHistory] = useState(false);






  return (
    <Box sx={{ width: '100%' }}>
      <ErrorModal open={errorModal.open} onClose={handleErrorModalClose} message={errorModal.message} />
      <Tabs value={value} onChange={handleChange} aria-label="Jackpot tabs">

            <Tab key="game" label="Game" />, 
            <Tab key="pattern" label="Pattern" />,
            
      </Tabs>
      
      {showGameDetail && <GameDetailsDialog  open={showGameDetail} onClose={closeDetail} gameData={selectedGame} />}

      {/* game tab*/}
      <TabPanel value={value} index={0}>
        {showDisribution && (
          <DistributionDialog open={showDisribution} onClose={closeDistributionDialog} game={selectedGame} />
        )}

        {showAdminDistribution && <AdminBonusDialog open={showAdminDistribution} onClose={handleAdminBonusDistributionClose} onSave={handleAdminBonusSave} game={selectedGame} />}
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Games {__todayGames?.length > 0 ? `(${__todayGames.length} games)` : ``}</Typography>
          <IconButton onClick={() => setCollapseOpen(!collapseOpen)}>
            {collapseOpen ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={collapseOpen}>
          <Box component="form" onSubmit={handleGameSubmit} sx={{ mt: 2, mb: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Game ID"
                  value={gameId}
                  //onChange={(e) => setGameId(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Game Name"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  required
                  inputProps={{ minLength: 3, maxLength: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bet Amount"
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  required
                  inputProps={{ min: 10 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Winning"
                  type="number"
                  value={totalWinning}
                  onChange={(e) => setTotalWinning(e.target.value)}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Start Time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        step: 300, // 5 min
                      }}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Start Date/Time"
                      type="datetime-local"
                      value={startDateTime}
                      onChange={(e) => setStartDateTime(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      required
                    />
                  </Box>
                  {startDateTime && (
                    <Typography variant="caption" color="textSecondary">
                      {(() => {
                        const now = new Date(); // Current time in UTC
                        const startTime = new Date(startDateTime); // Start time in UTC

                        // Calculate the time difference in milliseconds
                        const diff = startTime - now;

                        const hours = Math.floor(diff / (1000 * 60 * 60));
                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        if (diff <= 0) {
                          return 'Game has already started or is over';
                        }
                        return `Time until start: ${hours}h ${minutes}m`;
                      })()}
                    </Typography>
                  )}
                </Box>
              </Grid>
              {/* <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <TextField
                    sx={{ flex: 1 }} // Makes the TextField take equal space
                    fullWidth
                    label="House Bonus"
                    type="number"
                    value={houseBonus}
                    onChange={(e) => setHouseBonus(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    inputProps={{
                      min: 0,
                      step: '0.01',
                    }}
                  />
                  <FormControl sx={{ flex: 1 }}>
                    {' '}
                    {/* Makes the Select take equal space 
                    <InputLabel>House Bonus Branches</InputLabel>
                    <Select
                      multiple
                      value={houseBonusBranches || []}
                      onChange={(e) => setHouseBonusBranches(e.target.value)}
                      renderValue={(selected) => selected.join(', ')}
                      defaultValue={""}
                    >
                      {branchNames?.map((branch, index) => (
                        <MenuItem key={index} value={branch}>
                          {branch}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid> */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel>Pattern</InputLabel>
                    <Select
                      value={patternId || ''}
                      onChange={(e) => setSelectedPatternId(e.target.value)}
                      displayEmpty
                      label="Pattern"
                      required
                      defaultValue={""}
                    >
                      <MenuItem value="">
                        <em></em>
                      </MenuItem>
                      {patterns?.map((pattern) => (
                        <MenuItem key={pattern.id} value={pattern.id}>
                          {pattern.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* <FormControl sx={{ flex: 1 }}>
                    <InputLabel>Jackpot Branches</InputLabel>
                    <Select
                      multiple
                      value={selectedBranches || []}
                      onChange={(e) => setSelectedBranches(e.target.value)}
                      renderValue={(selected) => selected.join(', ')}
                      defaultValue={""}
                    >
                      {branchNames?.map((branch, index) => (
                        <MenuItem key={index} value={branch}>
                          {branch}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl> */}
                </Box>
              </Grid>

              {/* Has Jackpot Section */}
              {/* <Grid item xs={12} sm={6}>
                <Grid container spacing={2} direction="column">
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Checkbox checked={hasJackpot} onChange={(e) => setHasJackpot(e.target.checked)} />}
                      label="Has Jackpot"
                    />
                  </Grid>

                  {hasJackpot && (
                    <Grid item xs={12}>
                      <Button variant="contained" onClick={() => setJackpotWinning([...jackpotWinning, ''])}>
                        Add Jackpot Amount
                      </Button>
                    </Grid>
                  )}

                  {hasJackpot &&
                    jackpotWinning.map((amount, index) => (
                      <Grid item xs={12} key={index}>
                        <TextField
                          fullWidth
                          label={`Jackpot ${index + 1}`}
                          type="number"
                          value={amount}
                          onChange={(e) => {
                            const newJackpotAmounts = [...jackpotWinning];
                            newJackpotAmounts[index] = e.target.value;
                            setJackpotWinning(newJackpotAmounts);
                          }}
                          inputProps={{ min: 0 }}
                        />
                        <Button
                          variant="outlined"
                          color="secondary"
                          sx={{ mt: '2px' }}
                          onClick={() => {
                            const newJackpotAmounts = jackpotWinning.filter((_, i) => i !== index);
                            setJackpotWinning(newJackpotAmounts);
                          }}
                        >
                          Remove
                        </Button>
                      </Grid>
                    ))}
                </Grid>
              </Grid> */}

              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox checked={isVoid} onChange={(e) => setIsVoid(e.target.checked)} />}
                  label="Is Void"
                />
                {/* <FormControlLabel
                  control={<Checkbox checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} />}
                  label="Is Paid"
                />
                <FormControlLabel
                  control={<Checkbox checked={isDone} onChange={(e) => setIsDone(e.target.checked)} />}
                  label="Is Done"
                />
                <FormControlLabel
                  control={<Checkbox checked={isRunning} onChange={(e) => setIsRunning(e.target.checked)} />}
                  label="Is Running"
                /> */}
              </Grid>
            </Grid>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              //startIcon={<CasinoIcon />}
              startIcon={__loading ? <CircularProgress size={20} color="inherit" /> : <CasinoIcon />}
              sx={{ mt: 2 }}
            >
              {editingGame ? 'Edit Game' : 'Create Game'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<UndoIcon />}
              sx={{ mt: 2, ml: 2 }}
              onClick={resetGameFields}
            >
              Reset Form
            </Button>
            <Box sx={{ mt: 2 }}>
              {__error && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{
                    display: 'block',
                    fontWeight: 'bold',
                    mt: 1,
                  }}
                >
                  {__error}
                </Typography>
              )}
            </Box>
          </Box>
        </Collapse>

        <Collapse in={!collapseOpen}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ width: 200 }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ width: 200 }}
            />
            <Select value={isPaidCriteria??""} onChange={handleIsPaidChange} sx={{ width: 200 }} displayEmpty defaultValue={""}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value={true}>Paid</MenuItem>
              <MenuItem value={false}>Unpaid</MenuItem>
            </Select>
            <Button
              variant="contained"
              onClick={async () => {
                if (!startDate || !endDate) {
                  setErrorModal({
                    open: true,
                    message: 'Please select both start and end dates',
                  });
                  return;
                }
                if (new Date(startDate) > new Date(endDate)) {
                  setErrorModal({
                    open: true,
                    message: 'Start date cannot be after end date',
                  });
                  return;
                }
                 dispatch(fetchGames({ start: startDate, end: endDate }));
              }}
            >
              Find
            </Button>
          </Box>
        </Collapse>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Game ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Bet</TableCell>
                <TableCell>Winning</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>Date</TableCell>
                
                <TableCell>Player#</TableCell>
                
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {__todayGames?.map((game, index) => (
                <TableRow key={index}>
                  <TableCell>{game.gameId}</TableCell>
                  <TableCell>{game.gameName}</TableCell>
                  <TableCell>{game.betAmount}</TableCell>
                  <TableCell>{game.totalWinning}</TableCell>
                  <TableCell>{game.displayStartTime}</TableCell>
                  <TableCell>
                    {game.startTimeLocal}
                  </TableCell>
                  
                  {/* <TableCell>{adjustToGMT3(game.startDateTime)}</TableCell> */}
                  <TableCell>{game.playerBoards?.length}</TableCell>
                  
                  
                  <TableCell>
                    {game.isVoid ? 'Void' : game.gameStatus}
                  </TableCell>
                  {/* Action Menu */}
                  <TableCell>
                    <IconButton onClick={(event) => handleMenuClick(event, game)}>
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={menuAnchorEl}
                      open={Boolean(menuAnchorEl && selectedGame === game)}
                      onClose={handleMenuClose}
                    >
                      <MuiMenuItem onClick={handleGameEdit}>
                        
                        Edit
                      </MuiMenuItem>
                      <MuiMenuItem onClick={handleWinningDistribution}>
                        
                        Distribute
                      </MuiMenuItem>
                      <MuiMenuItem onClick={handleShowDetail}>
                        
                        Detail
                      </MuiMenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
      {value === 1 && <JackpotPatternComponent />}

    </Box>
  );
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default AutoSettingComponent;

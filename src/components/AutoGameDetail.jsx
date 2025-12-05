import React, { useState, useEffect, useCallback, memo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
  Grid,
  Divider,
  Tab,
  Tabs,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Card,
  CardContent,
  Stack,
  TextField,
  Button,
} from "@mui/material";
import {
  Close as CloseIcon,
  EmojiEvents as TrophyIcon,
  Casino as CasinoIcon,
  AttachMoney as MoneyIcon,
  Group as GroupIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  ViewModule as BoardIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  LocationCity as BranchIcon,
  Money as AmountIcon,
  Dialpad as DialpadIcon,
  Functions as FunctionsIcon
} from "@mui/icons-material";

const SearchBox = memo(({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSetSearchTerm = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search by Board ID, Owner Phone, or Player Phone"
        value={searchTerm}
        onChange={handleSetSearchTerm}
        sx={{ backgroundColor: "background.paper" }}
      />
      <Button variant="contained" onClick={() => onSearch(searchTerm)}>
        Search
      </Button>
    </Box>
  );
});

const AutoGameDetailsDialog = ({ open, onClose, gameData }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [filteredBoards, setFilteredBoards] = useState([
    ...gameData.playerBoards,
  ]);

  /*useEffect(() => {
    setFilteredBoards([...gameData.playerBoards]);
  }, [gameData]);*/

  const handleSearch = (term) => {
    const filtered = gameData.playerBoards.filter(
      (board) =>
        String(board.boardId).toLowerCase().includes(term.toLowerCase()) ||
        String(board.ownerPhone).toLowerCase().includes(term.toLowerCase()) ||
        String(board.playerPhone).toLowerCase().includes(term.toLowerCase())
    );
    setFilteredBoards(filtered);
  };

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const getStatusColor = () => {
    if (gameData.isDone) return "success";
    if (gameData.isRunning) return "info";
    if (gameData.isScheduled) return "warning";
    return "default";
  };

  const getStatusText = () => {
    // if (gameData.isDone) return "Completed";
    // if (gameData.isRunning) return "Running";
    // if (gameData.isScheduled) return "Scheduled";
    // return "Unknown";
    return gameData.gameStatus || "Unknown";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ padding: "20px 0" }}>
      {value === index && children}
    </div>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth fullScreen>
      <DialogTitle
        sx={{
          background: "linear-gradient(45deg, #1976d2, #9c27b0)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h6" color={"#fff"}>
            Game Details
          </Typography>
          <Typography variant="subtitle2" color={"#fff"}>
            {gameData.gameId}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Chip label={getStatusText()} color={getStatusColor()} size="small" />
          <IconButton onClick={onClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{ mb: 2 }}
        >
          <Tab label="Game Info" icon={<CasinoIcon />} />
          <Tab label="Players" icon={<GroupIcon />} />
          <Tab label="Boards" icon={<BoardIcon />} />
          <Tab label="Winners" icon={<TrophyIcon />} />
        </Tabs>

        {/* game info */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CasinoIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Game Name"
                        secondary={gameData.gameName}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="secondary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Game Note"
                        secondary={gameData.gameNote}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <MoneyIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Bet Amount"
                        secondary={`$${gameData.betAmount}`}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <ScheduleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Start Time"
                        secondary={formatDate(gameData.startTimeLocal)}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <FunctionsIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Call Count"
                        secondary={gameData.callList?.length || "—"}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <DialpadIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Call List"
                        secondary={gameData.callList?.join(", ") || "—"}
                      />
                    </ListItem>

                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{color:'secondary.main'}}>
                    Game Status
                  </Typography>
                  <Grid container spacing={4}>
                    <Grid item xs={6}>
                      <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="body2" color="textSecondary">
                          Total Winners
                        </Typography>
                        <Typography variant="h4">
                          {gameData.gameWinners?.length || 0}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="body2" color="textSecondary">
                          Total Players
                        </Typography>
                        <Typography variant="h4">
                          {gameData.boardIds?.length || 0}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="body2" color="textSecondary">
                          Total Winning
                        </Typography>
                        <Typography variant="h4">
                          ${gameData.totalWinning}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        {/* players */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={2}>
            {gameData.playerBoards?.map((player, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                      <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                        <GroupIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Player {index + 1}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          📱 {player.playerPhone}
                        </Typography>
                        <Box mt={1}>
                          <Typography variant="body2" fontWeight="medium">
                            Boards:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {player?.boardIds?.join(", ") || "—"}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
        {/* boards */}
        <TabPanel value={activeTab} index={2}>
          <SearchBox onSearch={handleSearch} />
          <Grid container spacing={2}>
            {(filteredBoards || gameData?.playerBoards).map((board, index) => (
              <Grid item xs={12} sm={6} md={4} key={board.boardId || index}>
                <Card elevation={2}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1" color="primary">
                        Board # {board?.boardIds?.join(", ") || "—"}
                      </Typography>
                      <Chip
                        size="small"
                        icon={<PhoneIcon />}
                        label={board.playerPhone}
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      Owner: {board.ownerPhone}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
        {/* winners */}
        <TabPanel value={activeTab} index={3}>
          {gameData.hasJackpot && <JackpotDisplay gameData={gameData} />}

          <Typography variant="h6" sx={{ mb: 2 }}>
            Regular Winners
          </Typography>

          <Grid container spacing={2}>
            {gameData.gameWinners?.map((winner, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card elevation={3}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                        bgcolor: "primary.main",
                        color: "white",
                        p: 2,
                        borderRadius: 1,
                        mb: 2,
                      }}
                    >
                      <TrophyIcon sx={{ color: "#FFD700", fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6">
                          Winner #{index + 1}
                        </Typography>
                      </Box>
                    </Box>

                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Phone Number"
                          secondary={winner.playerPhone}
                        />
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <MoneyIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Winning Amount"
                          secondary={`$${winner.winningAmount.toLocaleString()}`}
                        />
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <BoardIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Winning Board"
                          secondary={`Board #${winner.boardId}`}
                        />
                      </ListItem>
                    </List>

                    {gameData.playerBoards.find(
                      (board) => board.boardId === winner.boardId
                    ) && (
                      <Box
                        sx={{
                          mt: 1,
                          p: 1,
                          bgcolor: "action.hover",
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="caption" color="textSecondary">
                          Board Owner:{" "}
                          {
                            gameData.playerBoards.find(
                              (board) => board.boardId === winner.boardId
                            ).ownerPhone
                          }
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {(!gameData.gameWinners || gameData.gameWinners.length === 0) && (
              <Grid item xs={12}>
                <Paper
                  sx={{ p: 3, textAlign: "center", bgcolor: "action.hover" }}
                >
                  <Typography variant="subtitle1" color="textSecondary">
                    No winners yet
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};

const JackpotDisplay = ({ gameData }) => {
  // Early return if no jackpot
  if (!gameData.hasJackpot) return null;

  const hasWinners =
    gameData.jackpotWinnerInfo && gameData.jackpotWinnerInfo.length > 0;

  return (
    <Box sx={{ mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #00fff0 0%, #0066ff 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TrophyIcon size={32} />
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Jackpot Game
            </Typography>
          </Box>
          <Chip
            icon={<AmountIcon size={16} />}
            label={`$${gameData.jackpotWinning?.toLocaleString() || "0"}`}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              "& .MuiChip-icon": { color: "white" },
              fontWeight: "bold",
              fontSize: "1.1rem",
              height: 36,
            }}
          />
        </Box>

        {/* Winners Section */}
        <Box sx={{ mt: 2 }}>
          {hasWinners ? (
            <Grid container spacing={3}>
              {gameData.jackpotWinnerInfo.map((winner, index) => (
                <Grid item xs={12} key={index}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2, color: "#FFD700" }}>
                      Jackpot {index + 1} Winner
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={2}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <BoardIcon size={20} />
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.8 }}
                              >
                                Board ID
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: "medium" }}
                              >
                                {winner.board}
                              </Typography>
                            </Box>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <PhoneIcon size={20} />
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.8 }}
                              >
                                Phone
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: "medium" }}
                              >
                                {winner.phone}
                              </Typography>
                            </Box>
                          </Box>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Stack spacing={2}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <BranchIcon size={20} />
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.8 }}
                              >
                                Branch
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: "medium" }}
                              >
                                {winner.branch}
                              </Typography>
                            </Box>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <AmountIcon size={20} />
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.8 }}
                              >
                                Amount Won
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: "medium" }}
                              >
                                ${winner.amount?.toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <Typography variant="h6" sx={{ opacity: 0.8 }}>
                No Jackpot Winner Yet
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AutoGameDetailsDialog;

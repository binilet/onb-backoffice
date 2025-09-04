import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
  Grid,
  Avatar,
  IconButton,
  Paper,
  Fade,
  Tooltip,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import GamesIcon from '@mui/icons-material/Games';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PercentIcon from '@mui/icons-material/Percent';
import NoteIcon from '@mui/icons-material/Note';
import { CallMade } from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';

const DetailCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  height: '100%',
  borderRadius: theme.spacing(1.5),
  backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : alpha(theme.palette.background.paper, 0.9),
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
  },
}));

const DetailSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1.5),
}));

const IconWrapper = styled(Box)(({ theme, color = 'primary.main' }) => ({
  width: 36,
  height: 36,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette[color.split('.')[0]][color.split('.')[1] || 'main'], 0.12),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette[color.split('.')[0]][color.split('.')[1] || 'main'],
  flexShrink: 0,
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  fontWeight: 500,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
}));

const GameDetail = ({ game, open, onClose }) => {
  // Calculate profit/loss value and color
  const calculateProfitLoss = () => {
    const profit = (game.cut_amount);
    const color = profit >= 0 ? 'success.main' : 'error.main';
    const sign = profit >= 0 ? '+' : '';
    return { value: `${sign}$${profit.toFixed(2)}`, color };
  };
  
  const profitLoss = calculateProfitLoss();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 400 }}
      fullScreen={true}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff' }}>
            <GamesIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="700">
              Game #{game.game_id}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {new Date(game.date).toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>
        </Box>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose} 
          aria-label="close"
          sx={{ 
            bgcolor: alpha('#fff', 0.1),
            '&:hover': { bgcolor: alpha('#fff', 0.2) },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 4 }}>
        <Grid container spacing={3}>
          {/* Summary Card */}
          <Grid item xs={12}>
            <DetailCard sx={{ 
              mb: 3, 
              backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,0.02) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.02) 75%, transparent 75%, transparent)',
              backgroundSize: '10px 10px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                width: '120px', 
                height: '120px', 
                background: `linear-gradient(135deg, transparent 50%, ${alpha(game.is_void ? '#f44336' : game.game_completed ? '#4caf50' : '#ff9800', 0.2)} 50%)`,
                zIndex: 0,
              }} />
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <StyledChip
                        label={game.is_void ? 'Void' : game.game_completed ? 'Completed' : 'Incomplete'}
                        color={game.is_void ? 'error' : game.game_completed ? 'success' : 'warning'}
                        sx={{ fontWeight: 600, pl: 0.5, pr: 0.5 }}
                        size="medium"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {game.number_of_calls ?? 0} Calls
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      ${game.bet_amount.toFixed(2)}
                      <Typography component="span" color="text.secondary" variant="body2" sx={{ ml: 1 }}>
                        Bet Amount
                      </Typography>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Gross Profit
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color={profitLoss.color}>
                        {profitLoss.value}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </DetailCard>
          </Grid>

          {/* Left Column */}
          <Grid item xs={12} md={6}>
            <DetailCard>
              <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ mb: 2.5 }}>
                Game Information
              </Typography>
              
              <DetailSection>
                <IconWrapper>
                  <CalendarTodayIcon fontSize="small" />
                </IconWrapper>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Date & Time
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {new Date(game.date).toLocaleString()}
                  </Typography>
                </Box>
              </DetailSection>
              
              <DetailSection>
                <IconWrapper>
                  <PeopleIcon fontSize="small" />
                </IconWrapper>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Number of Players
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {game.number_of_players}
                  </Typography>
                </Box>
              </DetailSection>
              
              <DetailSection>
                <IconWrapper color="success.main">
                  <MonetizationOnIcon fontSize="small" />
                </IconWrapper>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Bet Amount
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    ${game.bet_amount.toFixed(2)}
                  </Typography>
                </Box>
              </DetailSection>
              
              <DetailSection>
                <IconWrapper color="info.main">
                  <EmojiEventsIcon fontSize="small" />
                </IconWrapper>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Winning
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    ${game.total_winning.toFixed(2)}
                  </Typography>
                </Box>
              </DetailSection>
              
              <DetailSection>
                <IconWrapper color="secondary.main">
                  <DashboardIcon fontSize="small" />
                </IconWrapper>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Winner Board ID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {game.winner_board_id ?? 'N/A'}
                  </Typography>
                </Box>
              </DetailSection>
            </DetailCard>
          </Grid>
          
          {/* Right Column */}
          <Grid item xs={12} md={6}>
            <DetailCard>
              <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ mb: 2.5 }}>
                Financial Details
              </Typography>
              
              <DetailSection>
                <IconWrapper color="warning.main">
                  <PercentIcon fontSize="small" />
                </IconWrapper>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cut Percent
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {(game.cut_percent).toFixed(2)}%
                  </Typography>
                </Box>
              </DetailSection>
              
              <DetailSection>
                <IconWrapper color="warning.main">
                  <MonetizationOnIcon fontSize="small" />
                </IconWrapper>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cut Amount
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    ${game.cut_amount.toFixed(2)}
                  </Typography>
                </Box>
              </DetailSection>
              
              <DetailSection>
                <IconWrapper color="success.main">
                  <MonetizationOnIcon fontSize="small" />
                </IconWrapper>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Player Winning
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    ${game.player_winning.toFixed(2)}
                  </Typography>
                </Box>
              </DetailSection>
              
              <DetailSection>
                <IconWrapper color="info.main">
                  <NoteIcon fontSize="small" />
                </IconWrapper>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Note
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" sx={{ wordBreak: 'break-word' }}>
                    {game.note ?? 'No note'}
                  </Typography>
                </Box>
              </DetailSection>
              <DetailSection>
                <IconWrapper color="info.main">
                  <CallMade fontSize="small" />
                </IconWrapper>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Number Of Calls
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" sx={{ wordBreak: 'break-word' }}>
                    {game.number_of_calls ?? 'no of calls unavailable'}
                  </Typography>
                </Box>
              </DetailSection>
            </DetailCard>
          </Grid>
          
          {/* Players Section */}
          <Grid item xs={12}>
            <DetailCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <IconWrapper>
                    <PersonIcon fontSize="small" />
                  </IconWrapper>
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                    Players & Winners
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {game.players.length} Participant{game.players.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Players
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {game.players.map((player) => (
                    <Tooltip key={player} title={`Player: ${player}`} arrow>
                      <StyledChip 
                        label={player} 
                        color="secondary" 
                        size="small"
                        avatar={<Avatar sx={{ bgcolor: 'transparent' }}><PersonIcon fontSize="small" /></Avatar>}
                        variant={game.winners?.includes(player) ? "filled" : "outlined"}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Winners
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {game.winners?.length ? (
                    game.winners.map((winner) => (
                      <Tooltip key={winner} title={`Winner: ${winner}`} arrow>
                        <StyledChip 
                          label={winner} 
                          color="success" 
                          size="small"
                          avatar={<Avatar sx={{ bgcolor: 'transparent' }}><EmojiEventsIcon fontSize="small" /></Avatar>}
                        />
                      </Tooltip>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No winners
                    </Typography>
                  )}
                </Box>
              </Box>
            </DetailCard>
          </Grid>
        </Grid>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          Game ID: {game.game_id}
        </Typography>
        <Button 
          onClick={onClose} 
          variant="contained" 
          color="primary"
          disableElevation
          sx={{ 
            borderRadius: 2,
            px: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GameDetail;
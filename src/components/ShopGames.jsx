import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, InputAdornment, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Button } from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';
import { numericFontFamily } from '../../theme';
import MarketplaceLayout from '../marketplace/MarketplaceLayout';
import { branches, rooms, shopGames, shops } from '../marketplace/mocks';

const money = new Intl.NumberFormat('en', { style: 'currency', currency: 'ETB' });
const dateTime = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Addis_Ababa' });
const numeric = { fontFamily: numericFontFamily, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };

export default function ShopGames({ onToggleTheme, currentUser }) {
  const [search, setSearch] = useState('');
  const [shopId, setShopId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [roomId, setRoomId] = useState('');
  const canPreview = currentUser?.role === 'super';
  const availableBranches = branches.filter((branch) => !shopId || branch.shopId === shopId);
  const availableRooms = rooms.filter((room) => availableBranches.some((branch) => branch.branch_id === room.branchId) && (!branchId || room.branchId === branchId));
  const filteredGames = canPreview ? shopGames.filter((game) => {
    const room = rooms.find((item) => item.room_id === game.roomId);
    return availableRooms.some((item) => item.room_id === game.roomId)
      && (!roomId || game.roomId === roomId)
      && `${game.game_id} ${room.roomName}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase());
  }) : [];
  const clearFilters = () => { setSearch(''); setShopId(''); setBranchId(''); setRoomId(''); };

  return (
    <MarketplaceLayout
      title="Shop games"
      subtitle="Read-only round history across shops, branches and rooms."
      scopeLabel={canPreview ? 'Super · All shops' : 'Read-only'}
      currentUser={currentUser}
      onToggleTheme={onToggleTheme}
    >
      {canPreview && (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={3} flexWrap="wrap" sx={{ p: 4 }}>
            <Box>
              <Typography component="h2" variant="h3">Round history</Typography>
              <Typography variant="caption" color="text.secondary" role="status">{filteredGames.length} {filteredGames.length === 1 ? 'round' : 'rounds'}</Typography>
            </Box>
            <Chip size="small" variant="outlined" label="Read-only" />
          </Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 4, px: 4, pb: 4 }}>
            <TextField label="Search game or room" value={search} onChange={(event) => setSearch(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> }} />
            <TextField select label="Shop" value={shopId} onChange={(event) => { setShopId(event.target.value); setBranchId(''); setRoomId(''); }}>
              <MenuItem value="">All shops</MenuItem>
              {shops.map((shop) => <MenuItem key={shop.shop_id} value={shop.shop_id}>{shop.shopName}</MenuItem>)}
            </TextField>
            <TextField select label="Branch" value={branchId} onChange={(event) => { setBranchId(event.target.value); setRoomId(''); }}>
              <MenuItem value="">All branches</MenuItem>
              {availableBranches.map((branch) => <MenuItem key={branch.branch_id} value={branch.branch_id}>{branch.branchName}</MenuItem>)}
            </TextField>
            <TextField select label="Room" value={roomId} onChange={(event) => setRoomId(event.target.value)}>
              <MenuItem value="">All rooms</MenuItem>
              {availableRooms.map((room) => <MenuItem key={room.room_id} value={room.room_id}>{room.roomName}</MenuItem>)}
            </TextField>
          </Box>
          <TableContainer tabIndex={0} role="region" aria-label="Shop game history" sx={{ '&:focus-visible': { outline: 'auto' } }}>
            <Table aria-label="Shop game history">
              <TableHead>
                <TableRow>
                  {['Game', 'Room', 'Started', 'Stake', 'Cut', 'Winnings'].map((label, index) => <TableCell key={label} align={index >= 3 ? 'right' : 'left'}>{label}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredGames.map((game) => {
                  const room = rooms.find((item) => item.room_id === game.roomId);
                  const branch = branches.find((item) => item.branch_id === room.branchId);
                  const shop = shops.find((item) => item.shop_id === branch.shopId);
                  return (
                    <TableRow key={game.game_id} hover>
                      <TableCell component="th" scope="row" sx={numeric}>{game.game_id}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{room.roomName}</Typography>
                        <Typography variant="caption" color="text.secondary">{shop.shopName} / {branch.branchName}</Typography>
                      </TableCell>
                      <TableCell sx={numeric}>{dateTime.format(new Date(game.startedAt))}</TableCell>
                      <TableCell align="right" sx={numeric}>{money.format(game.betAmount)}</TableCell>
                      <TableCell align="right" sx={numeric}>{game.cutPercent}%</TableCell>
                      <TableCell align="right" sx={numeric}>{money.format(game.totalWinning)}</TableCell>
                    </TableRow>
                  );
                })}
                {!filteredGames.length && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 10 }}><Typography variant="subtitle1">No matching rounds</Typography><Typography variant="body2" color="text.secondary">Try another search or clear the filters.</Typography></TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={3} flexWrap="wrap" sx={{ px: 4, py: 3 }}>
            <Typography variant="caption" color="text.secondary">Times shown in Africa/Addis_Ababa</Typography>
            <Button size="small" color="inherit" onClick={clearFilters} disabled={!search && !shopId && !branchId && !roomId}>Clear filters</Button>
          </Stack>
        </Paper>
      )}
    </MarketplaceLayout>
  );
}

ShopGames.propTypes = {
  onToggleTheme: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({ role: PropTypes.oneOf(['super', 'agent', 'owner', 'admin', 'cashier']), user_id: PropTypes.string }).isRequired,
};

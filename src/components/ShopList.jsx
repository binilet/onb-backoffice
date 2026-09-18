import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Chip, InputAdornment, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';
import { numericFontFamily } from '../../theme';
import MarketplaceLayout from '../marketplace/MarketplaceLayout';
import { systemUsers, shops } from '../marketplace/mocks';

const dateTime = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'Africa/Addis_Ababa' });
const scopeLabels = {
  super: 'Super · All shops',
  agent: 'Agent · Assigned shops',
};

export default function ShopList({ onToggleTheme, currentUser }) {
  const [search, setSearch] = useState('');
  const role = currentUser?.role;
  const canView = role === 'super' || role === 'agent';
  const visibleShops = useMemo(() => {
    if (role === 'super') return shops;
    if (role === 'agent') return shops.filter((shop) => shop.agentId === currentUser.user_id);
    return [];
  }, [role, currentUser]);
  const filteredShops = visibleShops.filter((shop) => shop.shopName.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  const owners = Object.fromEntries(systemUsers.filter((user) => user.role === 'owner').map((user) => [user.user_id, user.username]));
  const agents = Object.fromEntries(systemUsers.filter((user) => user.role === 'agent').map((user) => [user.user_id, user.username]));

  const statusFor = (shop) => {
    if (shop.superLock) return { label: 'Super-locked', color: 'error' };
    if (shop.banUntil && new Date(shop.banUntil) > new Date()) return { label: 'Banned', color: 'warning' };
    if (!shop.isActive) return { label: 'Inactive', color: 'default' };
    return { label: 'Active', color: 'success' };
  };

  return (
    <MarketplaceLayout
      title="Shops"
      subtitle="Marketplace shops and their current standing."
      scopeLabel={scopeLabels[role] ?? 'No shop visibility'}
      currentUser={currentUser}
      onToggleTheme={onToggleTheme}
    >
      {!canView && (
        <Paper variant="outlined" sx={{ p: 10, textAlign: 'center' }}>
          <Typography variant="subtitle1">Restricted access</Typography>
          <Typography variant="body2" color="text.secondary">Shop management is available to super and agent roles.</Typography>
        </Paper>
      )}
      {canView && (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={3} flexWrap="wrap" sx={{ p: 4 }}>
            <Box>
              <Typography component="h2" variant="h3">All shops</Typography>
              <Typography variant="caption" color="text.secondary" role="status">{filteredShops.length} {filteredShops.length === 1 ? 'shop' : 'shops'}</Typography>
            </Box>
            <Stack direction="row" gap={3} flexWrap="wrap">
              {role === 'super' && (
                <Button component={RouterLink} to="/marketplace/shops/create" variant="contained">Create shop</Button>
              )}
              <TextField label="Search shops" size="small" value={search} onChange={(event) => setSearch(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> }} />
            </Stack>
          </Stack>
          <TableContainer tabIndex={0} role="region" aria-label="Shop list" sx={{ '&:focus-visible': { outline: 'auto' } }}>
            <Table aria-label="Shop list">
              <TableHead>
                <TableRow>
                  {['Shop', 'Owner', 'Agent', 'Status', 'Created'].map((label) => <TableCell key={label}>{label}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredShops.map((shop) => {
                  const status = statusFor(shop);
                  return (
                    <TableRow key={shop.shop_id} hover>
                      <TableCell component="th" scope="row">
                        <Typography variant="body2">{shop.shopName}</Typography>
                        <Typography variant="caption" color="text.secondary">{shop.address}</Typography>
                      </TableCell>
                      <TableCell>{owners[shop.ownerId] ?? shop.ownerId}</TableCell>
                      <TableCell>{shop.agentId ? (agents[shop.agentId] ?? shop.agentId) : 'Unassigned'}</TableCell>
                      <TableCell><Chip size="small" color={status.color} label={status.label} /></TableCell>
                      <TableCell sx={{ fontFamily: numericFontFamily, whiteSpace: 'nowrap' }}>{dateTime.format(new Date(shop.createdAt))}</TableCell>
                    </TableRow>
                  );
                })}
                {canView && !filteredShops.length && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                      <Typography variant="subtitle1">No shops in your scope</Typography>
                      <Typography variant="body2" color="text.secondary">Shops appear here once a super assigns them to you.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </MarketplaceLayout>
  );
}

ShopList.propTypes = {
  onToggleTheme: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({ role: PropTypes.oneOf(['super', 'agent', 'owner', 'admin', 'cashier']), user_id: PropTypes.string }).isRequired,
};

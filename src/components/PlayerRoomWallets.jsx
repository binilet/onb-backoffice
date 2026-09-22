import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import AddOutlined from '@mui/icons-material/AddOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import { numericFontFamily } from '../../theme';
import MarketplaceLayout from '../marketplace/MarketplaceLayout';
import { getBranches, getPlayerRoomWallet, getPlayerRoomWalletLedgers, getPlayerRoomWallets, getShops, topUpPlayerRoomWallet } from '../marketplace/shopApi';

const dateTime = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Addis_Ababa' });
const numberFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 2 });
const apiError = (error, fallback) => error.response?.data?.detail || fallback;

function newIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() || `player-room-topup-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function initialLookup(role, user) {
  return { playerPhone: '', shopId: role === 'system' ? '' : user?.shopId || '', branchId: role === 'cashier' ? user?.branchId || '' : '' };
}

export default function PlayerRoomWallets() {
  const currentUser = useSelector((state) => state.auth._current_user);
  const role = currentUser?.role;
  const canView = ['system', 'agent', 'subagent', 'admin', 'cashier'].includes(role);
  const canTopUp = role === 'admin' || role === 'cashier';
  const [shops, setShops] = useState([]);
  const [branches, setBranches] = useState([]);
  const [lookup, setLookup] = useState(() => initialLookup(role, currentUser));
  const [wallet, setWallet] = useState(null);
  const [ledgers, setLedgers] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [walletSearch, setWalletSearch] = useState('');
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpKey, setTopUpKey] = useState('');
  const [toppingUp, setToppingUp] = useState(false);

  const loadOptions = useCallback(async () => {
    if (!canView) return;
    setLoadingOptions(true);
    try {
      const [branchData, shopData, walletData] = await Promise.all([getBranches(), getShops(), getPlayerRoomWallets()]);
      setBranches(branchData);
      setShops(shopData);
      setWallets(walletData);
    } catch (requestError) {
      setError(apiError(requestError, 'Unable to load wallet scope options.'));
    } finally {
      setLoadingOptions(false);
    }
  }, [canView]);

  useEffect(() => { loadOptions(); }, [loadOptions]);

  const selectedBranches = useMemo(() => branches.filter((branch) => branch.shopId === lookup.shopId), [branches, lookup.shopId]);
  const selectedShopName = useMemo(() => shops.find((shop) => shop.shop_id === lookup.shopId)?.shopName || lookup.shopId, [lookup.shopId, shops]);
  const branchNames = useMemo(() => Object.fromEntries(branches.map((branch) => [branch.branch_id, branch.branchName])), [branches]);
  const walletSummaries = useMemo(() => Object.values(wallets.reduce((summary, item) => {
    const current = summary[item.shopId] || { shopId: item.shopId, walletCount: 0, totalBalance: 0 };
    return { ...summary, [item.shopId]: { ...current, walletCount: current.walletCount + 1, totalBalance: current.totalBalance + Number(item.currentBalance) } };
  }, {})), [wallets]);
  const filteredWallets = useMemo(() => {
    const query = walletSearch.trim().toLocaleLowerCase();
    return query ? wallets.filter((item) => item.playerPhone.toLocaleLowerCase().includes(query)) : wallets;
  }, [walletSearch, wallets]);
  const lookupReady = lookup.playerPhone.trim() && lookup.shopId;

  const runLookup = useCallback(async () => {
    if (!lookupReady) return;
    setLoadingWallet(true);
    setError('');
    const params = { shopId: lookup.shopId, ...(lookup.branchId ? { branchId: lookup.branchId } : {}) };
    try {
      const [walletData, ledgerData] = await Promise.all([
        getPlayerRoomWallet(lookup.playerPhone.trim(), params),
        getPlayerRoomWalletLedgers(lookup.playerPhone.trim(), params),
      ]);
      setWallet(walletData);
      setLedgers(ledgerData);
    } catch (requestError) {
      setWallet(null);
      setLedgers([]);
      setError(apiError(requestError, 'Unable to look up this player wallet.'));
    } finally {
      setLoadingWallet(false);
    }
  }, [lookup, lookupReady]);

  const submitLookup = async (event) => { event.preventDefault(); await runLookup(); };
  const setLookupField = (field) => (event) => setLookup((current) => ({ ...current, [field]: event.target.value, ...(field === 'shopId' ? { branchId: '' } : {}) }));
  const openTopUp = () => { setTopUpAmount(''); setTopUpKey(newIdempotencyKey()); setTopUpOpen(true); };
  const closeTopUp = () => { if (!toppingUp) setTopUpOpen(false); };

  const submitTopUp = async (event) => {
    event.preventDefault();
    setToppingUp(true);
    setError('');
    try {
      await topUpPlayerRoomWallet({ playerPhone: lookup.playerPhone.trim(), shopId: lookup.shopId, branchId: lookup.branchId || null, amount: Number(topUpAmount), idempotencyKey: topUpKey });
      setNotice(`Topped up ${lookup.playerPhone.trim()} by ${numberFormat.format(Number(topUpAmount))} points.`);
      setTopUpOpen(false);
      await runLookup();
      await loadOptions();
    } catch (requestError) {
      setError(apiError(requestError, 'Unable to top up this player wallet.'));
    } finally {
      setToppingUp(false);
    }
  };

  const chooseShop = ['system', 'agent', 'subagent'].includes(role);

  return <MarketplaceLayout title="Player room wallets" subtitle="Look up a player’s separate wallet for a shop. This is distinct from platform Shop Balance." showPreviewNotice={false}>
    {error && <Alert severity="error" variant="outlined" sx={{ mb: 4 }} onClose={() => setError('')}>{error}</Alert>}
    {notice && <Alert severity="success" variant="outlined" sx={{ mb: 4 }} onClose={() => setNotice('')}>{notice}</Alert>}
    {!canView && <Paper variant="outlined" sx={{ p: 8, textAlign: 'center' }}><Typography variant="subtitle1">Restricted access</Typography><Typography variant="body2" color="text.secondary">Only shop-hierarchy staff can view player room wallets.</Typography></Paper>}
    {canView && <Stack gap={5}><Paper variant="outlined" sx={{ overflow: 'hidden' }}><Box sx={{ p: 4 }}><Typography component="h2" variant="h3">Wallet liability in your scope</Typography><Typography variant="caption" color="text.secondary">Total outstanding player-room-wallet credit, grouped by shop.</Typography></Box>{loadingOptions ? <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress size={32} /></Stack> : <><TableContainer><Table aria-label="Player room wallet liability by shop"><TableHead><TableRow><TableCell>Shop</TableCell><TableCell align="right">Wallets</TableCell><TableCell align="right">Total wallet balance</TableCell></TableRow></TableHead><TableBody>{walletSummaries.map((summary) => <TableRow key={summary.shopId} hover><TableCell>{shops.find((shop) => shop.shop_id === summary.shopId)?.shopName || summary.shopId}</TableCell><TableCell align="right" sx={{ fontFamily: numericFontFamily }}>{summary.walletCount}</TableCell><TableCell align="right" sx={{ fontFamily: numericFontFamily }}>{numberFormat.format(summary.totalBalance)}</TableCell></TableRow>)}{!walletSummaries.length && <TableRow><TableCell colSpan={3} align="center" sx={{ py: 7 }}><Typography variant="subtitle1">No wallet balances in scope</Typography></TableCell></TableRow>}</TableBody></Table></TableContainer><Box sx={{ p: 4, pt: 0 }}><TextField label="Search listed wallets by player phone" value={walletSearch} onChange={(event) => setWalletSearch(event.target.value)} /></Box><TableContainer tabIndex={0} role="region" aria-label="Player room wallets in scope"><Table aria-label="Player room wallets in scope"><TableHead><TableRow><TableCell>Player phone</TableCell><TableCell>Shop</TableCell><TableCell>Branch</TableCell><TableCell>Withdrawability</TableCell><TableCell align="right">Balance</TableCell></TableRow></TableHead><TableBody>{filteredWallets.map((item) => <TableRow key={`${item.playerPhone}-${item.shopId}`} hover><TableCell sx={{ fontFamily: numericFontFamily }}>{item.playerPhone}</TableCell><TableCell>{shops.find((shop) => shop.shop_id === item.shopId)?.shopName || item.shopId}</TableCell><TableCell>{branchNames[item.branchId] || item.branchId || '—'}</TableCell><TableCell><Chip size="small" color={item.isWithdrawable ? 'success' : 'default'} label={item.isWithdrawable ? 'Withdrawable' : 'Non-withdrawable'} /></TableCell><TableCell align="right" sx={{ fontFamily: numericFontFamily }}>{numberFormat.format(item.currentBalance)}</TableCell></TableRow>)}{!filteredWallets.length && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 7 }}><Typography variant="subtitle1">No matching wallet balances</Typography></TableCell></TableRow>}</TableBody></Table></TableContainer></>}</Paper><Paper variant="outlined"><Box component="form" onSubmit={submitLookup} sx={{ p: 4 }}><Typography component="h2" variant="h3">Find a player wallet</Typography><Typography variant="caption" color="text.secondary">Wallet identity is the player phone and shop. Branch is recorded for future room-level separation.</Typography><Stack direction="row" gap={3} flexWrap="wrap" sx={{ mt: 3 }}><TextField required label="Player phone" value={lookup.playerPhone} onChange={setLookupField('playerPhone')} />{chooseShop ? <TextField required select label="Shop" value={lookup.shopId} onChange={setLookupField('shopId')} disabled={loadingOptions}>{shops.map((shop) => <MenuItem key={shop.shop_id} value={shop.shop_id}>{shop.shopName}</MenuItem>)}</TextField> : <TextField label="Shop" value={selectedShopName} disabled />}<TextField select label="Branch (optional)" value={lookup.branchId} onChange={setLookupField('branchId')} disabled={!lookup.shopId || loadingOptions}><MenuItem value="">No branch</MenuItem>{selectedBranches.map((branch) => <MenuItem key={branch.branch_id} value={branch.branch_id}>{branch.branchName}</MenuItem>)}</TextField><Button type="submit" variant="contained" startIcon={<SearchOutlined />} disabled={!lookupReady || loadingWallet}>{loadingWallet ? 'Looking up…' : 'Look up wallet'}</Button></Stack></Box></Paper>
      {loadingWallet && <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress size={32} /></Stack>}
      {wallet && <><Paper variant="outlined"><Stack direction="row" justifyContent="space-between" alignItems="center" gap={3} flexWrap="wrap" sx={{ p: 4 }}><Box><Typography component="h2" variant="h3">{wallet.playerPhone}</Typography><Typography variant="body2" color="text.secondary">{selectedShopName}</Typography></Box><Stack direction="row" gap={3} alignItems="center"><Box><Typography variant="caption" color="text.secondary">Current balance</Typography><Typography variant="h2" sx={{ fontFamily: numericFontFamily }}>{numberFormat.format(wallet.currentBalance)} points</Typography></Box><Chip color={wallet.isWithdrawable ? 'success' : 'default'} label={wallet.isWithdrawable ? 'Withdrawable' : 'Non-withdrawable'} />{canTopUp && wallet.isWithdrawable && <Button variant="contained" startIcon={<AddOutlined />} onClick={openTopUp}>Top up player</Button>}</Stack></Stack></Paper><Paper variant="outlined" sx={{ overflow: 'hidden' }}><Box sx={{ p: 4 }}><Typography component="h2" variant="h3">Wallet ledger</Typography><Typography variant="caption" color="text.secondary">Immutable wallet movements for this player and shop.</Typography></Box><TableContainer tabIndex={0} role="region" aria-label="Player wallet ledger"><Table aria-label="Player wallet ledger"><TableHead><TableRow><TableCell>When</TableCell><TableCell>Reason</TableCell><TableCell>Processed by</TableCell><TableCell align="right">Amount</TableCell></TableRow></TableHead><TableBody>{ledgers.map((ledger) => <TableRow key={ledger.ledger_id} hover><TableCell sx={{ fontFamily: numericFontFamily, whiteSpace: 'nowrap' }}>{dateTime.format(new Date(ledger.createdAt))}</TableCell><TableCell><Chip size="small" variant="outlined" label={ledger.reason.replaceAll('_', ' ')} /></TableCell><TableCell>{ledger.toppedUpByPhone || '—'}</TableCell><TableCell align="right" sx={{ fontFamily: numericFontFamily }}>{numberFormat.format(ledger.amount)}</TableCell></TableRow>)}{!ledgers.length && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8 }}><Typography variant="subtitle1">No wallet movements yet</Typography></TableCell></TableRow>}</TableBody></Table></TableContainer></Paper></>}
    </Stack>}
    <Dialog open={topUpOpen} onClose={closeTopUp} fullWidth maxWidth="sm"><Box component="form" onSubmit={submitTopUp}><DialogTitle>Top up player wallet</DialogTitle><DialogContent><Stack gap={4} sx={{ pt: 1 }}><Alert severity="info" variant="outlined">Record this only after receiving hard cash. It credits the player wallet and does not affect Shop Balance.</Alert><TextField label="Player" value={lookup.playerPhone} disabled /><TextField label="Shop" value={selectedShopName} disabled /><TextField required label="Points amount" type="number" inputProps={{ min: 0.000001, step: 'any' }} value={topUpAmount} onChange={(event) => setTopUpAmount(event.target.value)} /><TextField label="Idempotency key" value={topUpKey} InputProps={{ readOnly: true }} helperText="Generated for this top-up to prevent duplicate crediting." /></Stack></DialogContent><DialogActions><Button color="inherit" onClick={closeTopUp} disabled={toppingUp}>Cancel</Button><Button type="submit" variant="contained" disabled={toppingUp || !topUpAmount || Number(topUpAmount) <= 0}>{toppingUp ? 'Topping up…' : 'Top up player'}</Button></DialogActions></Box></Dialog>
  </MarketplaceLayout>;
}

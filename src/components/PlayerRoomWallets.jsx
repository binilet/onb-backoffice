import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import { numericFontFamily } from "../../theme";
import MarketplaceLayout from "../marketplace/MarketplaceLayout";
import {
  decidePlayerRoomDeposit,
  getBranches,
  getPlayerRoomDeposits,
  getPlayerRoomWallet,
  getPlayerRoomWalletLedgers,
  getPlayerRoomWallets,
  getShops,
} from "../marketplace/shopApi";

const dateTime = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Addis_Ababa",
});
const numberFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
const apiError = (error, fallback) => error.response?.data?.detail || fallback;

function newIdempotencyKey() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `player-room-topup-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function initialLookup(role, user) {
  return {
    playerPhone: "",
    shopId: role === "system" ? "" : user?.shopId || "",
    branchId: role === "cashier" ? user?.branchId || "" : "",
  };
}

export default function PlayerRoomWallets() {
  const currentUser = useSelector((state) => state.auth._current_user);
  const role = currentUser?.role;
  const canView = ["system", "agent", "subagent", "admin", "cashier"].includes(
    role,
  );
  const canTopUp = role === "admin" || role === "cashier";
  const [shops, setShops] = useState([]);
  const [branches, setBranches] = useState([]);
  const [lookup, setLookup] = useState(() => initialLookup(role, currentUser));
  const [wallet, setWallet] = useState(null);
  const [ledgers, setLedgers] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [walletSearch, setWalletSearch] = useState("");
  const [walletTab, setWalletTab] = useState("lookup");
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [depositOpen, setDepositOpen] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [depositSaving, setDepositSaving] = useState(false);

  const loadOptions = useCallback(async () => {
    if (!canView) return;
    setLoadingOptions(true);
    try {
      const [branchData, shopData] = await Promise.all([
        getBranches(),
        getShops(),
      ]);
      setBranches(branchData);
      setShops(shopData);
    } catch (requestError) {
      setError(apiError(requestError, "Unable to load wallet scope options."));
    } finally {
      setLoadingOptions(false);
    }
  }, [canView]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);
  useEffect(() => {
    const phone = walletSearch.trim();
    if (phone.length < 3) {
      setWallets([]);
      return undefined;
    }
    const timer = setTimeout(() => {
      getPlayerRoomWallets({ phone, limit: 100 })
        .then(setWallets)
        .catch((requestError) =>
          setError(apiError(requestError, "Unable to search player wallets.")),
        );
    }, 300);
    return () => clearTimeout(timer);
  }, [walletSearch]);

  const selectedBranches = useMemo(
    () => branches.filter((branch) => branch.shopId === lookup.shopId),
    [branches, lookup.shopId],
  );
  const selectedShopName = useMemo(
    () =>
      shops.find((shop) => shop.shop_id === lookup.shopId)?.shopName ||
      lookup.shopId,
    [lookup.shopId, shops],
  );
  const branchNames = useMemo(
    () =>
      Object.fromEntries(
        branches.map((branch) => [branch.branch_id, branch.branchName]),
      ),
    [branches],
  );
  const walletSummaries = useMemo(
    () =>
      Object.values(
        wallets.reduce((summary, item) => {
          const current = summary[item.shopId] || {
            shopId: item.shopId,
            walletCount: 0,
            totalBalance: 0,
          };
          return {
            ...summary,
            [item.shopId]: {
              ...current,
              walletCount: current.walletCount + 1,
              totalBalance: current.totalBalance + Number(item.currentBalance),
            },
          };
        }, {}),
      ),
    [wallets],
  );
  const filteredWallets = useMemo(() => {
    const query = walletSearch.trim().toLocaleLowerCase();
    return query
      ? wallets.filter((item) =>
          item.playerPhone.toLocaleLowerCase().includes(query),
        )
      : wallets;
  }, [walletSearch, wallets]);
  const lookupReady = lookup.playerPhone.trim() && lookup.shopId;

  const runLookup = useCallback(async () => {
    if (!lookupReady) return;
    setLoadingWallet(true);
    setError("");
    const params = {
      shopId: lookup.shopId,
      ...(lookup.branchId ? { branchId: lookup.branchId } : {}),
    };
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
      setError(apiError(requestError, "Unable to look up this player wallet."));
    } finally {
      setLoadingWallet(false);
    }
  }, [lookup, lookupReady]);

  const submitLookup = async (event) => {
    event.preventDefault();
    await runLookup();
  };
  const setLookupField = (field) => (event) =>
    setLookup((current) => ({
      ...current,
      [field]: event.target.value,
      ...(field === "shopId" ? { branchId: "" } : {}),
    }));
  const openDeposits = async () => {
    setDepositOpen(true);
    try {
      setDeposits(await getPlayerRoomDeposits());
    } catch (requestError) {
      setError(apiError(requestError, "Unable to load deposit requests."));
    }
  };
  const decideDeposit = async (depositId, action) => {
    setDepositSaving(true);
    try {
      await decidePlayerRoomDeposit(depositId, { action });
      setDeposits((items) => items.filter((item) => item.id !== depositId));
      setNotice(`Deposit ${action.toLowerCase()}d.`);
      await runLookup();
      await loadOptions();
    } catch (requestError) {
      setError(apiError(requestError, "Unable to review deposit request."));
    } finally {
      setDepositSaving(false);
    }
  };

  const chooseShop = ["system", "agent", "subagent"].includes(role);

  return (
    <MarketplaceLayout
      title="Player room wallets"
      subtitle="Look up a player’s separate wallet for a shop. This is distinct from platform Shop Balance."
      showPreviewNotice={false}
    >
      {error && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}
      {notice && (
        <Alert
          severity="success"
          variant="outlined"
          sx={{ mb: 2 }}
          onClose={() => setNotice("")}
        >
          {notice}
        </Alert>
      )}
      {!canView && (
        <Paper variant="outlined" sx={{ p: 8, textAlign: "center" }}>
          <Typography variant="subtitle1">Restricted access</Typography>
          <Typography variant="body2" color="text.secondary">
            Only shop-hierarchy staff can view player room wallets.
          </Typography>
        </Paper>
      )}
      {canView && (
        <Stack gap={2}>
          <Tabs value={walletTab} onChange={(_, value) => setWalletTab(value)}>
            <Tab value="lookup" label="Find a wallet" />
            <Tab value="directory" label="Search wallet directory" />
          </Tabs>
          <Paper variant="outlined" sx={{ overflow: "hidden", display: walletTab === "directory" ? "block" : "none" }}>
            {loadingOptions ? (
              <Stack alignItems="center" sx={{ py: 6 }}>
                <CircularProgress size={32} />
              </Stack>
            ) : (
              <>
                <TableContainer>
                  <Table aria-label="Player room wallet liability by shop">
                    <TableHead>
                      <TableRow>
                        <TableCell>Shop</TableCell>
                        <TableCell align="right">Wallets</TableCell>
                        <TableCell align="right">
                          Total wallet balance
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {walletSummaries.map((summary) => (
                        <TableRow key={summary.shopId} hover>
                          <TableCell>
                            {shops.find(
                              (shop) => shop.shop_id === summary.shopId,
                            )?.shopName || summary.shopId}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontFamily: numericFontFamily }}
                          >
                            {summary.walletCount}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontFamily: numericFontFamily }}
                          >
                            {numberFormat.format(summary.totalBalance)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {!walletSummaries.length && (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 7 }}>
                            <Typography variant="subtitle1">
                              No wallet balances in scope
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ p: 4, pt: 0 }}>
                  <TextField
                    label="Search player phone"
                    value={walletSearch}
                    onChange={(event) => setWalletSearch(event.target.value)}
                  />
                </Box>
                <TableContainer
                  tabIndex={0}
                  role="region"
                  aria-label="Player room wallets in scope"
                >
                  <Table aria-label="Player room wallets in scope">
                    <TableHead>
                      <TableRow>
                        <TableCell>Player phone</TableCell>
                        <TableCell>Shop</TableCell>
                        <TableCell>Branch</TableCell>
                        <TableCell>Withdrawability</TableCell>
                        <TableCell align="right">Balance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredWallets.map((item) => (
                        <TableRow
                          key={`${item.playerPhone}-${item.shopId}`}
                          hover
                        >
                          <TableCell sx={{ fontFamily: numericFontFamily }}>
                            {item.playerPhone}
                          </TableCell>
                          <TableCell>
                            {shops.find((shop) => shop.shop_id === item.shopId)
                              ?.shopName || item.shopId}
                          </TableCell>
                          <TableCell>
                            {branchNames[item.branchId] || item.branchId || "—"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={
                                item.isWithdrawable ? "success" : "default"
                              }
                              label={
                                item.isWithdrawable
                                  ? "Withdrawable"
                                  : "Non-withdrawable"
                              }
                            />
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontFamily: numericFontFamily }}
                          >
                            {numberFormat.format(item.currentBalance)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {!filteredWallets.length && (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 7 }}>
                            <Typography variant="subtitle1">
                              No matching wallet balances
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Paper>
          <Paper variant="outlined" sx={{ display: walletTab === "lookup" ? "block" : "none" }}>
            <Box component="form" onSubmit={submitLookup} sx={{ p: 4 }}>
              <Typography component="h2" variant="h3">
                Find a player wallet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Wallet identity is the player phone and shop. Branch is recorded
                for future room-level separation.
              </Typography>
              <Stack direction="row" gap={3} flexWrap="wrap" sx={{ mt: 3 }}>
                <TextField
                  required
                  label="Player phone"
                  value={lookup.playerPhone}
                  onChange={setLookupField("playerPhone")}
                />
                {chooseShop ? (
                  <TextField
                    required
                    select
                    label="Shop"
                    value={lookup.shopId}
                    onChange={setLookupField("shopId")}
                    disabled={loadingOptions}
                  >
                    {shops.map((shop) => (
                      <MenuItem key={shop.shop_id} value={shop.shop_id}>
                        {shop.shopName}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <TextField label="Shop" value={selectedShopName} disabled />
                )}
                <TextField
                  select
                  label="Branch (optional)"
                  value={lookup.branchId}
                  onChange={setLookupField("branchId")}
                  disabled={!lookup.shopId || loadingOptions}
                >
                  <MenuItem value="">No branch</MenuItem>
                  {selectedBranches.map((branch) => (
                    <MenuItem key={branch.branch_id} value={branch.branch_id}>
                      {branch.branchName}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SearchOutlined />}
                  disabled={!lookupReady || loadingWallet}
                >
                  {loadingWallet ? "Looking up…" : "Look up wallet"}
                </Button>
              </Stack>
            </Box>
          </Paper>
          {loadingWallet && (
            <Stack alignItems="center" sx={{ py: 6 }}>
              <CircularProgress size={32} />
            </Stack>
          )}
          {wallet && (
            <>
              <Paper variant="outlined">
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={3}
                  flexWrap="wrap"
                  sx={{ p: 4 }}
                >
                  <Box>
                    <Typography component="h2" variant="h3">
                      {wallet.playerPhone}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedShopName}
                    </Typography>
                  </Box>
                  <Stack direction="row" gap={3} alignItems="center">
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Current balance
                      </Typography>
                      <Typography
                        variant="h2"
                        sx={{ fontFamily: numericFontFamily }}
                      >
                        {numberFormat.format(wallet.currentBalance)} points
                      </Typography>
                    </Box>
                    <Chip
                      color={wallet.isWithdrawable ? "success" : "default"}
                      label={
                        wallet.isWithdrawable
                          ? "Withdrawable"
                          : "Non-withdrawable"
                      }
                    />
                    {canTopUp && (
                      <Button variant="contained" onClick={openDeposits}>
                        Review deposits
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Paper>
              <Paper variant="outlined" sx={{ overflow: "hidden" }}>
                <Box sx={{ p: 4 }}>
                  <Typography component="h2" variant="h3">
                    Wallet ledger
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Immutable wallet movements for this player and shop.
                  </Typography>
                </Box>
                <TableContainer
                  tabIndex={0}
                  role="region"
                  aria-label="Player wallet ledger"
                >
                  <Table aria-label="Player wallet ledger">
                    <TableHead>
                      <TableRow>
                        <TableCell>When</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Processed by</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ledgers.map((ledger) => (
                        <TableRow key={ledger.ledger_id} hover>
                          <TableCell
                            sx={{
                              fontFamily: numericFontFamily,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {dateTime.format(new Date(ledger.createdAt))}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              variant="outlined"
                              label={ledger.reason.replaceAll("_", " ")}
                            />
                          </TableCell>
                          <TableCell>{ledger.toppedUpByPhone || "—"}</TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontFamily: numericFontFamily }}
                          >
                            {numberFormat.format(ledger.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {!ledgers.length && (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                            <Typography variant="subtitle1">
                              No wallet movements yet
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          )}
        </Stack>
      )}
      <Dialog
        open={depositOpen}
        onClose={() => !depositSaving && setDepositOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Pending room-wallet deposits</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deposits.map((deposit) => (
                <TableRow key={deposit.id}>
                  <TableCell>{deposit.playerPhone}</TableCell>
                  <TableCell>
                    {branchNames[deposit.branchId] || deposit.branchId}
                  </TableCell>
                  <TableCell>{deposit.transactionId || "Cash"}</TableCell>
                  <TableCell align="right">
                    {numberFormat.format(deposit.amount)}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" gap={1}>
                      <Button
                        size="small"
                        color="success"
                        onClick={() => decideDeposit(deposit.id, "APPROVE")}
                        disabled={depositSaving}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => decideDeposit(deposit.id, "DECLINE")}
                        disabled={depositSaving}
                      >
                        Decline
                      </Button>
                      <Button
                        size="small"
                        onClick={() => decideDeposit(deposit.id, "VOID")}
                        disabled={depositSaving}
                      >
                        Void
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {!deposits.length && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No pending deposits.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepositOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </MarketplaceLayout>
  );
}

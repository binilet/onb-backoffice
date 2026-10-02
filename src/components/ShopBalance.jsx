import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tabs,
  Typography,
} from "@mui/material";
import SendOutlined from "@mui/icons-material/SendOutlined";
import { numericFontFamily } from "../../theme";
import MarketplaceLayout from "../marketplace/MarketplaceLayout";
import {
  getShopBalance,
  getShopBalanceLedgers,
  getStaff,
  transferShopBalance,
} from "../marketplace/shopApi";

const dateTime = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Addis_Ababa",
});
const apiError = (error, fallback) => error.response?.data?.detail || fallback;
const pointsFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });

function dateInAddisAbaba(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Addis_Ababa",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(
    parts.map(({ type, value: part }) => [type, part]),
  );
  return `${value.year}-${value.month}-${value.day}`;
}

function nextDate(date) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1))
    .toISOString()
    .slice(0, 10);
}

function ledgerQuery({ startDate, endDate, phone }) {
  return {
    startAt: `${startDate}T00:00:00+03:00`,
    endAt: `${nextDate(endDate)}T00:00:00+03:00`,
    ...(phone.trim() ? { phone: phone.trim() } : {}),
  };
}

function newIdempotencyKey() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `shop-balance-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function recipientRolesFor(role) {
  if (role === "system") return ["agent", "subagent", "admin", "cashier"];
  if (role === "agent") return ["subagent", "admin", "cashier"];
  if (role === "subagent") return ["admin", "cashier"];
  if (role === "admin") return ["cashier"];
  return [];
}

function isDirectTransferRecipient(role, currentPhone, person) {
  if (role === "admin") {
    return (
      person.role === "cashier" &&
      (person.parentPhone === currentPhone || person.adminId === currentPhone)
    );
  }
  // Match the backend's legacy-aware direct-parent lookup for agent levels.
  return (person.parentPhone || person.agentId) === currentPhone;
}

function initialTransfer() {
  return {
    toPhone: "",
    amount: "",
    idempotencyKey: newIdempotencyKey(),
  };
}

export default function ShopBalance() {
  const currentUser = useSelector((state) => state.auth._current_user);
  const role = currentUser?.role;
  const canView = ["system", "agent", "subagent", "admin", "cashier"].includes(role);
  const canTransfer = recipientRolesFor(role).length > 0;
  const [staff, setStaff] = useState([]);
  const [balances, setBalances] = useState({});
  const [currentUserBalance, setCurrentUserBalance] = useState(null);
  const [balancesLoaded, setBalancesLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [ledgers, setLedgers] = useState([]);
  const [balancePhone, setBalancePhone] = useState("");
  const [ledgerFilterDraft, setLedgerFilterDraft] = useState(() => ({
    startDate: dateInAddisAbaba(),
    endDate: dateInAddisAbaba(),
    phone: "",
  }));
  const [ledgerFilters, setLedgerFilters] = useState(() => ({
    startDate: dateInAddisAbaba(),
    endDate: dateInAddisAbaba(),
    phone: "",
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [transferOpen, setTransferOpen] = useState(false);
  const [transfer, setTransfer] = useState(initialTransfer);
  const [sending, setSending] = useState(false);
  const [confirmTransfer, setConfirmTransfer] = useState(false);

  const loadBalances = useCallback(async () => {
    if (!canView || !currentUser?.phone) return;
    setLoading(true);
    setError("");
    try {
      const [staffData, ledgerData, ownBalance] = await Promise.all([
        getStaff(),
        getShopBalanceLedgers(ledgerQuery(ledgerFilters)),
        getShopBalance(currentUser.phone),
      ]);
      const scopedStaff = staffData.some(
        (person) => person.phone === currentUser.phone,
      )
        ? staffData
        : [currentUser, ...staffData];
      setStaff(scopedStaff);
      setLedgers(ledgerData);
      setCurrentUserBalance(ownBalance.currentBalance);
    } catch (requestError) {
      setError(apiError(requestError, "Unable to load shop balances."));
    } finally {
      setLoading(false);
    }
  }, [canView, currentUser, ledgerFilters]);

  useEffect(() => {
    loadBalances();
  }, [loadBalances]);

  const staffNames = useMemo(
    () =>
      Object.fromEntries(
        staff.map((person) => [person.phone, person.username || person.phone]),
      ),
    [staff],
  );
  const filteredStaff = useMemo(() => {
    const query = balancePhone.trim().toLocaleLowerCase();
    return query
      ? staff.filter((person) =>
          person.phone.toLocaleLowerCase().includes(query),
        )
      : staff;
  }, [balancePhone, staff]);
  const showBalances = async () => {
    setLoading(true);
    setError("");
    try {
      const balanceRows = await Promise.all(
        filteredStaff.map((person) => getShopBalance(person.phone)),
      );
      setBalances(
        Object.fromEntries(
          balanceRows.map((balance) => [balance.phone, balance.currentBalance]),
        ),
      );
      setBalancesLoaded(true);
    } catch (requestError) {
      setError(apiError(requestError, "Unable to load balances in scope."));
    } finally {
      setLoading(false);
    }
  };
  const ledgerTotals = useMemo(
    () =>
      ledgers.reduce(
        (totals, ledger) => ({
          points: totals.points + Number(ledger.amountPoints),
          etb:
            totals.etb +
            (ledger.etbAmount == null ? 0 : Number(ledger.etbAmount)),
        }),
        { points: 0, etb: 0 },
      ),
    [ledgers],
  );
  const recipients = useMemo(() => {
    const allowedRoles = recipientRolesFor(role);
    const candidates = staff.filter((person) =>
      allowedRoles.includes(person.role),
    );
    if (role !== "system")
      return candidates.filter(
        (person) => isDirectTransferRecipient(role, currentUser?.phone, person),
      );
    return candidates;
  }, [currentUser?.phone, role, staff]);
  const openTransfer = () => {
    setTransfer(initialTransfer());
    setError("");
    setTransferOpen(true);
  };
  const closeTransfer = () => {
    if (!sending) setTransferOpen(false);
  };
  const setTransferField = (field) => (event) =>
    setTransfer((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  const setLedgerFilter = (field) => (event) =>
    setLedgerFilterDraft((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  const applyLedgerFilters = (event) => {
    event.preventDefault();
    if (ledgerFilterDraft.endDate < ledgerFilterDraft.startDate) {
      setError("End date cannot be before the start date.");
      return;
    }
    setError("");
    setLedgerFilters({ ...ledgerFilterDraft });
  };

  const submitTransfer = async (event) => {
    event.preventDefault();
    setConfirmTransfer(true);
  };
  const confirmSendTransfer = async () => {
    setSending(true);
    setError("");
    const payload =
      role === "system"
        ? {
            toPhone: transfer.toPhone,
            etbAmount: Number(transfer.amount),
            idempotencyKey: transfer.idempotencyKey,
          }
        : {
            toPhone: transfer.toPhone,
            amountPoints: Number(transfer.amount),
            idempotencyKey: transfer.idempotencyKey,
          };
    try {
      const ledger = await transferShopBalance(payload);
      setNotice(
        `Transferred ${pointsFormat.format(ledger.amountPoints)} points to ${staffNames[ledger.toPhone] || ledger.toPhone}.`,
      );
      setBalancesLoaded(false);
      window.dispatchEvent(new Event("shop-balance-changed"));
      setTransferOpen(false);
      setConfirmTransfer(false);
      await loadBalances();
    } catch (requestError) {
      setError(apiError(requestError, "Unable to transfer the shop balance."));
    } finally {
      setSending(false);
    }
  };

  const amountLabel = role === "system" ? "ETB amount" : "Points amount";
  const transferReady =
    transfer.toPhone &&
    transfer.amount &&
    Number(transfer.amount) > 0 &&
    true;

  return (
    <MarketplaceLayout
      title="Shop balance"
      subtitle="Platform-usage fee balances for shop staff. Player top-ups, stakes, and winnings are managed separately in player room wallets."
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
            Only shop-hierarchy staff can view shop balances.
          </Typography>
        </Paper>
      )}
      {canView && (
        <Stack gap={2}>
          <Paper variant="outlined">
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pr: 2 }}>
              <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} aria-label="Shop balance sections">
                <Tab label="Transfer ledger" />
                <Tab label="Balances in scope" />
              </Tabs>
              {canTransfer && <Button variant="contained" size="small" startIcon={<SendOutlined />} onClick={openTransfer}>Transfer</Button>}
            </Stack>
          </Paper>
          {activeTab === 1 && <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={1.5}
              flexWrap="wrap"
              sx={{ p: 2 }}
            >
              <Box>
                <Typography component="h2" variant="subtitle1" fontWeight={800}>
                  Your balance: {currentUserBalance == null ? "—" : pointsFormat.format(currentUserBalance)}
                </Typography>
              </Box>
              <Stack
                direction="row"
                gap={1}
                flexWrap="wrap"
                alignItems="center"
              >
                <TextField
                  label="Search by phone"
                  value={balancePhone}
                  onChange={(event) => { setBalancePhone(event.target.value); setBalancesLoaded(false); }}
                />
                <Button variant="contained" onClick={showBalances}>Show balances</Button>
              </Stack>
            </Stack>
            {!balancesLoaded ? (
              <Box sx={{ py: 4, textAlign: "center" }}><Typography variant="body2" color="text.secondary">No balances loaded</Typography></Box>
            ) : loading ? (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ py: 6 }}
              >
                <CircularProgress size={32} />
              </Stack>
            ) : (
              <TableContainer
                tabIndex={0}
                role="region"
                aria-label="Shop balances"
              >
                <Table aria-label="Shop balances">
                  <TableHead>
                    <TableRow>
                      <TableCell>Staff member</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell align="right">Current balance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStaff.map((person) => (
                      <TableRow key={person.phone} hover>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2">
                            {person.username || person.phone}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontFamily: numericFontFamily }}
                          >
                            {person.phone}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={person.role} />
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontFamily: numericFontFamily }}
                        >
                          {pointsFormat.format(balances[person.phone] || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!filteredStaff.length && (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                          <Typography variant="subtitle1">
                            No matching staff balances
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>}
          {activeTab === 0 && <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            <Box sx={{ p: 2 }}>
              <Box
                component="form"
                onSubmit={applyLedgerFilters}
                sx={{ mt: 0 }}
              >
                <Stack
                  direction="row"
                  gap={1}
                  flexWrap="wrap"
                  alignItems="center"
                >
                  <TextField
                    required
                    label="Start date"
                    type="date"
                    value={ledgerFilterDraft.startDate}
                    onChange={setLedgerFilter("startDate")}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    required
                    label="End date"
                    type="date"
                    value={ledgerFilterDraft.endDate}
                    onChange={setLedgerFilter("endDate")}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Phone"
                    value={ledgerFilterDraft.phone}
                    onChange={setLedgerFilter("phone")}
                  />
                  <Button type="submit" variant="outlined">
                    Apply filters
                  </Button>
                </Stack>
              </Box>
              <Stack direction="row" gap={3} flexWrap="wrap" sx={{ mt: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total points
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontFamily: numericFontFamily }}
                  >
                    {pointsFormat.format(ledgerTotals.points)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total ETB
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontFamily: numericFontFamily }}
                  >
                    {pointsFormat.format(ledgerTotals.etb)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
            {loading ? null : (
              <TableContainer
                tabIndex={0}
                role="region"
                aria-label="Shop balance transfer ledger"
              >
                <Table aria-label="Shop balance transfer ledger">
                  <TableHead>
                    <TableRow>
                      <TableCell>When</TableCell>
                      <TableCell>From</TableCell>
                      <TableCell>To</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell align="right">Points</TableCell>
                      <TableCell align="right">ETB</TableCell>
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
                          {ledger.fromPhone
                            ? staffNames[ledger.fromPhone] || ledger.fromPhone
                            : "System"}
                        </TableCell>
                        <TableCell>
                          {ledger.toPhone ? staffNames[ledger.toPhone] || ledger.toPhone : "—"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={ledger.reason.replaceAll("_", " ")}
                          />
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontFamily: numericFontFamily }}
                        >
                          {pointsFormat.format(ledger.amountPoints)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontFamily: numericFontFamily }}
                        >
                          {ledger.etbAmount == null
                            ? "—"
                            : pointsFormat.format(ledger.etbAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!ledgers.length && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                          <Typography variant="subtitle1">
                            No transfers match these filters
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>}
        </Stack>
      )}
      <Dialog
        open={transferOpen}
        onClose={closeTransfer}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={submitTransfer}>
          <DialogTitle>Transfer shop balance</DialogTitle>
          <DialogContent>
            <Stack gap={4} sx={{ pt: 1 }}>
              <Autocomplete
                options={recipients}
                getOptionLabel={(person) =>
                  `${person.username || person.phone} · ${person.phone} · ${person.role}`
                }
                value={
                  recipients.find(
                    (person) => person.phone === transfer.toPhone,
                  ) || null
                }
                onChange={(_, person) =>
                  setTransfer((current) => ({
                    ...current,
                    toPhone: person?.phone || "",
                  }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Recipient"
                    placeholder="Search name or phone"
                  />
                )}
              />
              <TextField
                required
                type="number"
                inputProps={{ min: 0.000001, step: "any" }}
                label={amountLabel}
                value={transfer.amount}
                onChange={setTransferField("amount")}
              />
              <TextField
                label="Idempotency key"
                value={transfer.idempotencyKey}
                InputProps={{ readOnly: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button color="inherit" onClick={closeTransfer} disabled={sending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={sending || !transferReady}
            >
              Review transfer
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Dialog
        open={confirmTransfer}
        onClose={() => !sending && setConfirmTransfer(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Confirm balance transfer</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Send{" "}
            <strong>
              {transfer.amount} {role === "system" ? "ETB" : "points"}
            </strong>{" "}
            to{" "}
            <strong>{staffNames[transfer.toPhone] || transfer.toPhone}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            color="inherit"
            onClick={() => setConfirmTransfer(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmSendTransfer}
            disabled={sending}
          >
            {sending ? "Transferring…" : "Confirm transfer"}
          </Button>
        </DialogActions>
      </Dialog>
    </MarketplaceLayout>
  );
}

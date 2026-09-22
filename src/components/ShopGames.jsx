import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import CasinoOutlined from "@mui/icons-material/CasinoOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import SavingsOutlined from "@mui/icons-material/SavingsOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import AddCircleOutlineOutlined from "@mui/icons-material/AddCircleOutlineOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import PatternGrid from "./patternGrid";
import MarketplaceLayout from "../marketplace/MarketplaceLayout";
import { numericFontFamily } from "../../theme";
import {
  createGame,
  getBranches,
  getGameParticipants,
  getGames,
  getShops,
  updateGame,
  updateGameLifecycle,
} from "../marketplace/shopApi";
import { fetchPatterns } from "../state/slices/patternSlice";

const dynamicPatterns = [
  ["any_line", "Any line"],
  ["any_two_line", "Any two lines"],
  ["any_three_line", "Any three lines"],
  ["any_half", "Any half"],
];
const today = new Date().toISOString().slice(0, 10);
const numberFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
const dateTime = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Addis_Ababa",
});
const requestErrorMessage = (error, fallback) => {
  const detail = error.response?.data?.detail;
  return typeof detail === "string" ? detail : detail?.message || fallback;
};

const initialGameForm = (user) => ({
  shopId: user?.shopId || "",
  branchId: user?.branchId || "",
  pattern: "",
  dynamicPattern: "",
  startMode: "MANUAL",
  scheduledStartAt: "",
  betAmount: "",
  totalWinning: "",
  totalCutPercent: "10",
  note: "",
});

const editFormFor = (game) => ({
  pattern: game.pattern || "",
  dynamicPattern: game.dynamicPattern || "",
  startMode: game.startMode,
  scheduledStartAt: game.scheduledStartAt ? new Date(game.scheduledStartAt).toISOString().slice(0, 16) : "",
  betAmount: String(game.betAmount),
  totalWinning: game.totalWinning == null ? "" : String(game.totalWinning),
  totalCutPercent: String(game.totalCutPercent),
  note: game.note || "",
});

export default function ShopGames() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth._current_user);
  const patterns = useSelector((state) => state.jackpotPattern.list || []);
  const [shops, setShops] = useState([]);
  const [branches, setBranches] = useState([]);
  const [games, setGames] = useState([]);
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    shopId: "",
    branchId: "",
  });
  const initialFilters = useRef({
    startDate: today,
    endDate: today,
    shopId: "",
    branchId: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [form, setForm] = useState(() => initialGameForm(user));
  const [editingGame, setEditingGame] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [voidConfirm, setVoidConfirm] = useState(false);
  const [lifecycleSaving, setLifecycleSaving] = useState(false);

  const load = useCallback(async (activeFilters) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        startAt: `${activeFilters.startDate}T00:00:00+03:00`,
        endAt: `${activeFilters.endDate}T23:59:59+03:00`,
        ...(activeFilters.shopId && { shopId: activeFilters.shopId }),
        ...(activeFilters.branchId && { branchId: activeFilters.branchId }),
      };
      const [gameData, shopData, branchData] = await Promise.all([
        getGames(params),
        getShops(),
        getBranches(),
      ]);
      setGames(gameData);
      setShops(shopData);
      setBranches(branchData);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to load games.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    dispatch(fetchPatterns());
    load(initialFilters.current);
  }, [dispatch, load]);
  const total = (field) =>
    games.reduce((sum, game) => sum + Number(game[field] || 0), 0);
  const shopName = (id) =>
    shops.find((shop) => shop.shop_id === id)?.shopName || id;
  const branchName = (id) =>
    branches.find((branch) => branch.branch_id === id)?.branchName || id;
  const chosenPattern = useMemo(
    () =>
      patterns.find((pattern) => String(pattern.id) === String(form.pattern)),
    [form.pattern, patterns],
  );
  const canControlGames = ["system", "admin", "cashier"].includes(user?.role);
  const canEditGames = ["admin", "cashier"].includes(user?.role);
  const filteredBranches = useMemo(
    () => branches.filter((branch) => !filters.shopId || branch.shopId === filters.shopId),
    [branches, filters.shopId],
  );
  const chosenEditPattern = useMemo(
    () => patterns.find((pattern) => String(pattern.id) === String(editForm?.pattern)),
    [editForm?.pattern, patterns],
  );
  const chosenDetailPattern = useMemo(
    () => patterns.find((pattern) => String(pattern.id) === String(detail?.pattern)),
    [detail?.pattern, patterns],
  );
  const hasCreatePattern = Boolean(form.pattern) !== Boolean(form.dynamicPattern);
  const hasEditPattern = editForm && Boolean(editForm.pattern) !== Boolean(editForm.dynamicPattern);
  const save = async (event) => {
    event.preventDefault();
    try {
      const created = await createGame({
        ...form,
        pattern: form.pattern || null,
        dynamicPattern: form.dynamicPattern || null,
        betAmount: Number(form.betAmount),
        totalWinning: form.totalWinning ? Number(form.totalWinning) : null,
        totalCutPercent: Number(form.totalCutPercent),
        note: form.note.trim() || null,
        scheduledStartAt:
          form.startMode === "TIMER"
            ? new Date(form.scheduledStartAt).toISOString()
            : null,
      });
      setOpen(false);
      setForm(initialGameForm(user));
      await load(filters);
      setDetail(created);
      setParticipants([]);
    } catch (e) {
      setError(e.response?.data?.detail || "Unable to create game.");
    }
  };
  const lifecycle = async (action) => {
    setLifecycleSaving(true);
    try {
      const updated = await updateGameLifecycle(detail.game_id, action);
      setDetail(updated);
      if (action === "START") window.dispatchEvent(new Event("shop-balance-changed"));
      await load(filters);
    } catch (requestError) {
      setError(requestErrorMessage(requestError, "Unable to update game."));
    } finally {
      setLifecycleSaving(false);
    }
  };

  const openEdit = (game) => {
    setDetail(null);
    setEditingGame(game);
    setEditForm(editFormFor(game));
    setError("");
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!editingGame || !editForm) return;
    setSavingEdit(true);
    setError("");
    try {
      const payload = editingGame.status === "PENDING" ? {
        pattern: editForm.pattern || null,
        dynamicPattern: editForm.dynamicPattern || null,
        startMode: editForm.startMode,
        scheduledStartAt: editForm.startMode === "TIMER" ? new Date(editForm.scheduledStartAt).toISOString() : null,
        betAmount: Number(editForm.betAmount),
        totalWinning: editForm.totalWinning === "" ? null : Number(editForm.totalWinning),
        totalCutPercent: Number(editForm.totalCutPercent),
        note: editForm.note.trim() || null,
      } : { note: editForm.note.trim() || null };
      const updated = await updateGame(editingGame.game_id, payload);
      setEditingGame(null);
      setEditForm(null);
      if (detail?.game_id === updated.game_id) setDetail(updated);
      await load(filters);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to update game.");
    } finally {
      setSavingEdit(false);
    }
  };

  const openDetails = async (game) => {
    setDetail(game);
    setParticipants([]);
    try {
      setParticipants(await getGameParticipants(game.game_id));
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to load game participants.");
    }
  };

  return (
    <MarketplaceLayout
      title="Games"
      subtitle="Game money collection, controls, and winner details."
      showPreviewNotice={false}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <Paper variant="outlined" sx={{ overflow: "hidden", mb: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={3}
          sx={{ p: { xs: 3, md: 5 }, bgcolor: "surface.subtle" }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">GAME OPERATIONS</Typography>
            <Typography variant="h2" sx={{ mt: 1 }}>Game money collection</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Monitor collections, payouts, and game state across your authorized locations.
            </Typography>
          </Box>
          {canEditGames && <Button variant="contained" startIcon={<AddCircleOutlineOutlined />} onClick={() => setOpen(true)}>
            New game
          </Button>}
        </Stack>
        <Box sx={{ px: { xs: 3, md: 5 }, py: 3 }}>
        <Stack direction="row" gap={2} flexWrap="wrap">
          <Summary
            icon={<CasinoOutlined />}
            label="Games"
            value={games.length}
          />
          <Summary
            icon={<EmojiEventsOutlined />}
            label="Total winnings"
            value={total("totalWinning")}
          />
          <Summary
            icon={<SavingsOutlined />}
            label="Total cut"
            value={total("totalCutAmount")}
          />
        </Stack>
        </Box>
        <Divider />
        <Stack direction="row" gap={2} flexWrap="wrap" alignItems="center" sx={{ p: { xs: 3, md: 4 } }}>
          <TextField
            type="date"
            label="Start"
            value={filters.startDate}
            InputLabelProps={{ shrink: true }}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />
          <TextField
            type="date"
            label="End"
            value={filters.endDate}
            InputLabelProps={{ shrink: true }}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />
          <TextField
            select
            label="Shop"
            value={filters.shopId}
            onChange={(e) =>
              setFilters({ ...filters, shopId: e.target.value, branchId: "" })
            }
          >
            <MenuItem value="">All shops</MenuItem>
            {shops.map((shop) => (
              <MenuItem key={shop.shop_id} value={shop.shop_id}>
                {shop.shopName}
              </MenuItem>
            ))}
          </TextField>
          <Autocomplete options={filteredBranches} disabled={!filters.shopId} getOptionLabel={(branch) => branch.branchName} value={filteredBranches.find((branch) => branch.branch_id === filters.branchId) || null} onChange={(_, branch) => setFilters({ ...filters, branchId: branch?.branch_id || "" })} renderInput={(params) => <TextField {...params} label="Branch" placeholder="Search branch" />} sx={{ minWidth: 200 }} />
          <Button variant="outlined" onClick={() => load(filters)} disabled={loading}>
            Apply filters
          </Button>
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <Box sx={{ px: { xs: 3, md: 4 }, py: 3, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <Box>
            <Typography variant="h4">Games in scope</Typography>
            <Typography variant="caption" color="text.secondary">{games.length} matching {games.length === 1 ? "game" : "games"}</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">Times shown in Addis Ababa</Typography>
        </Box>
        <Divider />
        {loading ? <Stack alignItems="center" sx={{ py: 10 }}><CircularProgress size={32} /></Stack> : <TableContainer sx={{ overflowX: "auto", "&:focus-visible": { outline: "auto" } }} tabIndex={0} role="region" aria-label="Scrollable games table">
        <Table size="small" aria-label="Games in scope" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell>Game</TableCell>
              <TableCell>Location / start</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Stake</TableCell>
              <TableCell align="right">Payout</TableCell>
              <TableCell align="right">Cut</TableCell>
              <TableCell align="right" sx={{ position: "sticky", right: 0, bgcolor: "background.paper", borderLeft: 1, borderColor: "divider" }}>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {games.map((game) => (
              <TableRow key={game.game_id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: numericFontFamily }}>{game.game_id.slice(0, 8).toUpperCase()}</Typography>
                  <Typography variant="caption" color="text.secondary">{game.dynamicPattern || "Static pattern"}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{shopName(game.shopId)}</Typography>
                  <Typography variant="caption" color="text.secondary">{branchName(game.branchId)} · {game.scheduledStartAt ? dateTime.format(new Date(game.scheduledStartAt)) : game.startMode}</Typography>
                </TableCell>
                <TableCell>
                  <GameStatusChips game={game} />
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: numericFontFamily }}>{numberFormat.format(game.betAmount)}</TableCell>
                <TableCell align="right" sx={{ fontFamily: numericFontFamily }}>{game.totalWinning == null ? "—" : numberFormat.format(game.totalWinning)}</TableCell>
                <TableCell align="right" sx={{ fontFamily: numericFontFamily }}>{game.totalCutAmount == null ? "—" : numberFormat.format(game.totalCutAmount)}</TableCell>
                <TableCell align="right" sx={{ position: "sticky", right: 0, bgcolor: "background.paper", borderLeft: 1, borderColor: "divider" }}>
                  <Stack direction="row" justifyContent="flex-end">
                    {canEditGames && game.status === "PENDING" && <IconButton aria-label={`Edit game ${game.game_id}`} onClick={() => openEdit(game)} size="small"><EditOutlined fontSize="small" /></IconButton>}
                    <IconButton aria-label={`View game ${game.game_id}`} onClick={() => openDetails(game)} size="small"><VisibilityOutlined fontSize="small" /></IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {!games.length && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 10 }}><Typography variant="subtitle1">No games match this view</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Adjust the date or location filters to review another period.</Typography></TableCell></TableRow>}
          </TableBody>
        </Table>
        </TableContainer>}
      </Paper>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={save}>
          <DialogTitle>Create game</DialogTitle>
          <DialogContent>
            <Stack gap={3} sx={{ pt: 1 }}>
              <Box><Typography variant="h5">Location</Typography><Typography variant="body2" color="text.secondary">Set the shop and branch that will host this game.</Typography></Box>
              <TextField
                select
                required
                label="Shop"
                value={form.shopId}
                onChange={(e) => setForm({ ...form, shopId: e.target.value })}
              >
                {shops.map((shop) => (
                  <MenuItem key={shop.shop_id} value={shop.shop_id}>
                    {shop.shopName}
                  </MenuItem>
                ))}
              </TextField>
              <Divider />
              <Box><Typography variant="h5">Winning pattern</Typography><Typography variant="body2" color="text.secondary">Choose one pattern type. Static and dynamic patterns cannot be combined.</Typography></Box>
              <Autocomplete options={branches.filter((branch) => branch.shopId === form.shopId)} getOptionLabel={(branch) => branch.branchName} value={branches.find((branch) => branch.branch_id === form.branchId) || null} onChange={(_, branch) => setForm({ ...form, branchId: branch?.branch_id || "" })} renderInput={(params) => <TextField {...params} required label="Branch" placeholder="Search branch" />} />
              <TextField
                select
                label="Static pattern"
                helperText={form.dynamicPattern ? "Clear the dynamic pattern to use a static pattern." : "Choose one static pattern, or use a dynamic pattern below."}
                value={form.pattern}
                onChange={(e) => setForm({ ...form, pattern: e.target.value, dynamicPattern: e.target.value ? "" : form.dynamicPattern })}
              >
                <MenuItem value="">None</MenuItem>
                {patterns.map((pattern) => (
                  <MenuItem key={pattern.id} value={pattern.id}>
                    <Stack direction="row" gap={2} alignItems="center">
                      <Typography>{pattern.name}</Typography>
                      {pattern.grid && (
                        <PatternGrid
                          grid={pattern.grid}
                          editable={false}
                          size={10}
                        />
                      )}
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>
              {chosenPattern?.grid && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption">
                    Static pattern preview
                  </Typography>
                  <PatternGrid
                    grid={chosenPattern.grid}
                    editable={false}
                    size={22}
                  />
                </Paper>
              )}
              <TextField
                select
                label="Dynamic pattern"
                helperText={form.pattern ? "Clear the static pattern to use a dynamic pattern." : "Choose one dynamic pattern, or use a static pattern above."}
                value={form.dynamicPattern}
                onChange={(e) =>
                  setForm({ ...form, dynamicPattern: e.target.value, pattern: e.target.value ? "" : form.pattern })
                }
              >
                <MenuItem value="">None</MenuItem>
                {dynamicPatterns.map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              <Divider />
              <Box><Typography variant="h5">Schedule and collection</Typography><Typography variant="body2" color="text.secondary">Configure the start method and financial terms before opening the game.</Typography></Box>
              <TextField
                select
                label="Start mode"
                value={form.startMode}
                onChange={(e) =>
                  setForm({ ...form, startMode: e.target.value })
                }
              >
                <MenuItem value="MANUAL">Manual</MenuItem>
                <MenuItem value="TIMER">Timer</MenuItem>
              </TextField>
              {form.startMode === "TIMER" && (
                <TextField
                  required
                  type="datetime-local"
                  label="Scheduled start"
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) =>
                    setForm({ ...form, scheduledStartAt: e.target.value })
                  }
                />
              )}
              <TextField
                multiline
                minRows={3}
                label="Game note"
                helperText="Optional operational context. System lifecycle messages will also appear here."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
              <TextField
                required
                type="number"
                label="Bet amount"
                onChange={(e) =>
                  setForm({ ...form, betAmount: e.target.value })
                }
              />
              <TextField
                type="number"
                label="Total winning"
                onChange={(e) =>
                  setForm({ ...form, totalWinning: e.target.value })
                }
              />
              <TextField
                required
                type="number"
                inputProps={{ min: 10 }}
                label="Total cut percent"
                value={form.totalCutPercent}
                onChange={(e) =>
                  setForm({ ...form, totalCutPercent: e.target.value })
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!hasCreatePattern}>
              Create
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Dialog open={Boolean(editingGame)} onClose={() => !savingEdit && setEditingGame(null)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={saveEdit}>
          <DialogTitle>Edit pending game</DialogTitle>
          <DialogContent>
            <Stack gap={3} sx={{ pt: 1 }}>
              <Alert severity="info" variant="outlined">Configuration is editable while a game is pending. The operational note remains editable after start.</Alert>
              <TextField label="Location" value={editingGame ? `${shopName(editingGame.shopId)} · ${branchName(editingGame.branchId)}` : ""} disabled />
              <TextField select disabled={editingGame?.status !== "PENDING"} label="Static pattern" value={editForm?.pattern || ""} onChange={(event) => setEditForm((current) => ({ ...current, pattern: event.target.value, dynamicPattern: event.target.value ? "" : current.dynamicPattern }))}>
                <MenuItem value="">None</MenuItem>
                {patterns.map((pattern) => <MenuItem key={pattern.id} value={pattern.id}>{pattern.name}</MenuItem>)}
              </TextField>
              {chosenEditPattern?.grid && <Paper variant="outlined" sx={{ p: 2 }}><Typography variant="caption" color="text.secondary">Static pattern preview</Typography><PatternGrid grid={chosenEditPattern.grid} editable={false} size={22} /></Paper>}
              <TextField select disabled={editingGame?.status !== "PENDING"} label="Dynamic pattern" value={editForm?.dynamicPattern || ""} onChange={(event) => setEditForm((current) => ({ ...current, dynamicPattern: event.target.value, pattern: event.target.value ? "" : current.pattern }))}>
                <MenuItem value="">None</MenuItem>
                {dynamicPatterns.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
              </TextField>
              <TextField select disabled={editingGame?.status !== "PENDING"} label="Start mode" value={editForm?.startMode || "MANUAL"} onChange={(event) => setEditForm((current) => ({ ...current, startMode: event.target.value, scheduledStartAt: event.target.value === "MANUAL" ? "" : current.scheduledStartAt }))}>
                <MenuItem value="MANUAL">Manual</MenuItem><MenuItem value="TIMER">Timer</MenuItem>
              </TextField>
              {editForm?.startMode === "TIMER" && <TextField required disabled={editingGame?.status !== "PENDING"} type="datetime-local" label="Scheduled start" InputLabelProps={{ shrink: true }} value={editForm.scheduledStartAt} onChange={(event) => setEditForm((current) => ({ ...current, scheduledStartAt: event.target.value }))} />}
              <TextField required disabled={editingGame?.status !== "PENDING"} type="number" inputProps={{ min: 0.000001, step: "any" }} label="Bet amount" value={editForm?.betAmount || ""} onChange={(event) => setEditForm((current) => ({ ...current, betAmount: event.target.value }))} />
              <TextField disabled={editingGame?.status !== "PENDING"} type="number" inputProps={{ min: 0, step: "any" }} label="Total winning" value={editForm?.totalWinning || ""} onChange={(event) => setEditForm((current) => ({ ...current, totalWinning: event.target.value }))} />
              <TextField required disabled={editingGame?.status !== "PENDING"} type="number" inputProps={{ min: 10, step: "any" }} label="Total cut percent" value={editForm?.totalCutPercent || ""} onChange={(event) => setEditForm((current) => ({ ...current, totalCutPercent: event.target.value }))} />
              <TextField multiline minRows={4} label="Game note" helperText="Manual notes and system lifecycle messages are retained here." value={editForm?.note || ""} onChange={(event) => setEditForm((current) => ({ ...current, note: event.target.value }))} />
            </Stack>
          </DialogContent>
          <DialogActions><Button color="inherit" onClick={() => setEditingGame(null)} disabled={savingEdit}>Cancel</Button><Button type="submit" variant="contained" disabled={savingEdit || (editingGame?.status === "PENDING" && (!hasEditPattern || !editForm?.betAmount || !editForm?.totalCutPercent || (editForm?.startMode === "TIMER" && !editForm?.scheduledStartAt)))}>{savingEdit ? "Saving…" : "Save game"}</Button></DialogActions>
        </Box>
      </Dialog>
      <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} fullWidth maxWidth="md">
        <DialogTitle>Game details</DialogTitle>
        <DialogContent>
          {detail && (
            <Stack gap={3}>
              <Stack direction="row" gap={1} flexWrap="wrap">
                <GameStatusChips game={detail} />
                <Chip label={`Cut ${detail.totalCutPercent}%`} />
              </Stack>
              <Box><Typography variant="h3">{shopName(detail.shopId)}</Typography><Typography variant="body2" color="text.secondary">{branchName(detail.branchId)} · Created by {detail.createdByPhone}</Typography></Box>
              <Stack direction={{ xs: "column", sm: "row" }} gap={2} divider={<Divider flexItem orientation="vertical" />}>
                <DetailMetric label="Stake per cartela" value={numberFormat.format(detail.betAmount)} />
                <DetailMetric label="Total payout" value={detail.totalWinning == null ? "Pending" : numberFormat.format(detail.totalWinning)} />
                <DetailMetric label="Total cut" value={detail.totalCutAmount == null ? "Pending" : numberFormat.format(detail.totalCutAmount)} />
              </Stack>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h5">Pattern and timing</Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2, mt: 2 }}>
                  <DetailText label="Static pattern" value={chosenDetailPattern?.name || detail.pattern || "Not selected"} />
                  <DetailText label="Dynamic pattern" value={detail.dynamicPattern || "Not selected"} />
                  <DetailText label="Start mode" value={detail.startMode} />
                  <DetailText label="Scheduled start" value={detail.scheduledStartAt ? dateTime.format(new Date(detail.scheduledStartAt)) : "Not scheduled"} />
                </Box>
                {chosenDetailPattern?.grid && <Box sx={{ mt: 3 }}><Typography variant="caption" color="text.secondary">Selected static pattern</Typography><PatternGrid grid={chosenDetailPattern.grid} editable={false} size={24} /></Box>}
              </Paper>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h5">Record and audit</Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2, mt: 2 }}>
                  <DetailText label="Game ID" value={detail.game_id} numeric />
                  <DetailText label="Creator" value={detail.createdByPhone} numeric />
                  <DetailText label="Created" value={dateTime.format(new Date(detail.createdAt))} />
                  <DetailText label="Last updated" value={dateTime.format(new Date(detail.updatedAt))} />
                  <DetailText label="Freeze authority" value={detail.isFrozen ? `${detail.frozenByRole} · ${detail.frozenByPhone}` : "Not frozen"} />
                  <DetailText label="Shop / branch IDs" value={`${detail.shopId} / ${detail.branchId}`} numeric />
                </Box>
              </Paper>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h5">Game note</Typography>
                <Typography variant="body2" color={detail.note ? "text.primary" : "text.secondary"} sx={{ mt: 1, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{detail.note || "No notes have been added."}</Typography>
              </Paper>
              <Divider />
              <Typography variant="h5">Participants and winners</Typography>
            <Table size="small">
              <TableHead><TableRow><TableCell>Player</TableCell><TableCell>Cartela</TableCell><TableCell>Result</TableCell><TableCell align="right">Prize</TableCell></TableRow></TableHead>
              <TableBody>
                {participants.map((item) => (
                  <TableRow key={item.gp_id}>
                    <TableCell>{item.playerPhone}</TableCell>
                    <TableCell>{item.cartelaId}</TableCell>
                    <TableCell>{item.isWinner ? <Chip size="small" color="success" label="Winner" /> : <Typography variant="caption" color="text.secondary">Playing</Typography>}</TableCell>
                    <TableCell align="right" sx={{ fontFamily: numericFontFamily }}>{item.winAmount == null ? "—" : numberFormat.format(item.winAmount)}</TableCell>
                  </TableRow>
                ))}
                {!participants.length && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5 }}><Typography variant="body2" color="text.secondary">No cartelas have been recorded for this game.</Typography></TableCell></TableRow>}
              </TableBody>
            </Table>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {canEditGames && detail && <Button startIcon={<EditOutlined />} onClick={() => openEdit(detail)}>{detail.status === "PENDING" ? "Edit game" : "Edit note"}</Button>}
          {canControlGames && detail && detail.status !== "VOID" && detail.status !== "COMPLETE" && <>
            {detail.status === "PENDING" && <Button color="success" variant="contained" disabled={lifecycleSaving || detail.isFrozen} onClick={() => lifecycle("START")}>Start game</Button>}
            <Button disabled={lifecycleSaving} onClick={() => lifecycle(detail.isFrozen ? "UNFREEZE" : "FREEZE")}>{detail.isFrozen ? "Unfreeze" : "Freeze"}</Button>
            <Button color="error" disabled={lifecycleSaving} onClick={() => setVoidConfirm(true)}>Void game</Button>
          </>}
          <Button onClick={() => setDetail(null)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={voidConfirm} onClose={() => !lifecycleSaving && setVoidConfirm(false)} fullWidth maxWidth="xs">
        <DialogTitle>Void this game?</DialogTitle>
        <DialogContent><Alert severity="warning" variant="outlined">This action is irreversible. The game will be marked VOID and cannot be returned to its previous state.</Alert><Typography variant="body2" sx={{ mt: 3 }}>Completed games cannot be voided. Confirm only if this game must be permanently cancelled.</Typography></DialogContent>
        <DialogActions><Button color="inherit" onClick={() => setVoidConfirm(false)} disabled={lifecycleSaving}>Keep game</Button><Button color="error" variant="contained" disabled={lifecycleSaving} onClick={async () => { await lifecycle("VOID"); setVoidConfirm(false); }}>Void permanently</Button></DialogActions>
      </Dialog>
    </MarketplaceLayout>
  );
}
function Summary({ icon, label, value }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 3, minWidth: 164, flex: "1 1 164px", bgcolor: "background.paper" }}
    >
      <Stack direction="row" gap={2} alignItems="center">
        {icon}
        <Box>
          <Typography variant="caption">{label}</Typography>
          <Typography variant="h3">{value}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function GameStatusChips({ game }) {
  const statusColor = game.status === "COMPLETE" ? "success" : game.status === "VOID" ? "error" : game.status === "ACTIVE" ? "primary" : "default";
  return <Stack direction="row" gap={1} flexWrap="wrap"><Chip size="small" color={statusColor} label={game.status} />{game.isFrozen && <Chip size="small" color="warning" label="FROZEN" />}</Stack>;
}

function DetailMetric({ label, value }) {
  return <Box sx={{ minWidth: 140 }}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="h4" sx={{ mt: 0.5, fontFamily: numericFontFamily }}>{value}</Typography></Box>;
}

function DetailText({ label, value, numeric = false }) {
  return <Box><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="body2" sx={{ mt: 0.5, fontFamily: numeric ? numericFontFamily : undefined, overflowWrap: "anywhere" }}>{value}</Typography></Box>;
}

Summary.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
};

GameStatusChips.propTypes = { game: PropTypes.shape({ status: PropTypes.string.isRequired, isFrozen: PropTypes.bool }).isRequired };
DetailMetric.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.node.isRequired };
DetailText.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.node.isRequired, numeric: PropTypes.bool };

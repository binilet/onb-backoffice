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
  IconButton,
  InputAdornment,
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
  Tooltip,
  Typography,
} from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import EditOutlined from "@mui/icons-material/EditOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import { numericFontFamily } from "../../theme";
import MarketplaceLayout from "../marketplace/MarketplaceLayout";
import {
  createShop,
  deleteShop,
  getBranches,
  getShops,
  getStaff,
  updateShop,
} from "../marketplace/shopApi";
import ShopBranchesDialog from "./ShopBranchesDialog";

const initialForm = {
  representativePhone: "",
  shopName: "",
  systemCutPercent: "",
  address: "",
  isActive: true,
  banUntil: "",
};
const dateTime = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeZone: "Africa/Addis_Ababa",
});

const apiError = (error, fallback) => error.response?.data?.detail || fallback;

function toForm(shop) {
  return {
    representativePhone: shop.representativePhone || shop.agentId,
    shopName: shop.shopName,
    systemCutPercent: String(shop.systemCutPercent),
    address: shop.address,
    isActive: shop.isActive,
    banUntil: shop.banUntil ? shop.banUntil.slice(0, 16) : "",
  };
}

function statusFor(shop) {
  if (shop.banUntil && new Date(shop.banUntil) > new Date())
    return { label: "Banned", color: "warning" };
  if (!shop.isActive) return { label: "Inactive", color: "default" };
  return { label: "Active", color: "success" };
}

export default function ShopList() {
  const currentUser = useSelector((state) => state.auth._current_user);
  const role = currentUser?.role;
  const canManage = role === "system";
  const canView = ["system", "agent", "subagent"].includes(role);
  const [shops, setShops] = useState([]);
  const [representatives, setRepresentatives] = useState([]);
  const [branchCounts, setBranchCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [shopToDelete, setShopToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [branchShop, setBranchShop] = useState(null);

  const loadShops = useCallback(async () => {
    if (!canView) return;
    setLoading(true);
    setError("");
    try {
      const [shopData, staffData, branchData] = await Promise.all([
        getShops(),
        canManage ? getStaff() : Promise.resolve([]),
        getBranches(),
      ]);
      setShops(shopData);
      setRepresentatives(
        staffData.filter((staff) => ["agent", "subagent", "admin"].includes(staff.role)),
      );
      setBranchCounts(
        branchData.reduce(
          (counts, branch) => ({
            ...counts,
            [branch.shopId]: (counts[branch.shopId] || 0) + 1,
          }),
          {},
        ),
      );
    } catch (requestError) {
      setError(apiError(requestError, "Unable to load shops."));
    } finally {
      setLoading(false);
    }
  }, [canManage, canView]);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  const representativeNames = useMemo(
    () =>
      Object.fromEntries(
        representatives.map((person) => [person.phone, person.username || person.phone]),
      ),
    [representatives],
  );
  const filteredShops = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return query
      ? shops.filter((shop) =>
          `${shop.shopName} ${shop.address} ${shop.shop_id} ${shop.representativePhone || shop.agentId}`
            .toLocaleLowerCase()
            .includes(query),
        )
      : shops;
  }, [search, shops]);

  const openCreate = () => {
    setEditingShop(null);
    setForm(initialForm);
    setError("");
    setFormOpen(true);
  };
  const openEdit = (shop) => {
    setEditingShop(shop);
    setForm(toForm(shop));
    setError("");
    setFormOpen(true);
  };
  const closeForm = () => {
    if (!saving) setFormOpen(false);
  };
  const setField = (field) => (event) =>
    setForm((current) => ({
      ...current,
      [field]:
        field === "isActive"
          ? event.target.value === "true"
          : event.target.value,
    }));

  const saveShop = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      representativePhone: form.representativePhone,
      shopName: form.shopName.trim(),
      systemCutPercent: Number(form.systemCutPercent),
      address: form.address.trim(),
      isActive: form.isActive,
      banUntil: form.banUntil ? new Date(form.banUntil).toISOString() : null,
    };
    try {
      if (editingShop) {
        await updateShop(editingShop.shop_id, payload);
        setNotice(`Updated ${payload.shopName}.`);
      } else {
        await createShop(payload);
        setNotice(`Created ${payload.shopName}.`);
      }
      setFormOpen(false);
      await loadShops();
    } catch (requestError) {
      setError(apiError(requestError, "Unable to save the shop."));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!shopToDelete) return;
    setDeleting(true);
    setError("");
    try {
      await deleteShop(shopToDelete.shop_id);
      setNotice(`Deleted ${shopToDelete.shopName}.`);
      setShopToDelete(null);
      await loadShops();
    } catch (requestError) {
      setError(apiError(requestError, "Unable to delete the shop."));
    } finally {
      setDeleting(false);
    }
  };

  const copyShopId = async (shopId) => {
    await navigator.clipboard.writeText(shopId);
    setNotice(`Copied Shop ID ${shopId}.`);
  };

  return (
    <MarketplaceLayout
      title="Shops"
      subtitle="Create and maintain Shop records, their public IDs, representatives, and platform cut."
      showPreviewNotice={false}
    >
      {error && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{ mb: 4 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}
      {notice && (
        <Alert
          severity="success"
          variant="outlined"
          sx={{ mb: 4 }}
          onClose={() => setNotice("")}
        >
          {notice}
        </Alert>
      )}
      {!canView && (
        <Paper variant="outlined" sx={{ p: 8, textAlign: "center" }}>
          <Typography variant="subtitle1">Restricted access</Typography>
          <Typography variant="body2" color="text.secondary">
            Only system, agent, and subagent roles can view Shops.
          </Typography>
        </Paper>
      )}
      {canView && (
        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={3}
            flexWrap="wrap"
            sx={{ p: 4 }}
          >
            <Box>
              <Typography component="h2" variant="h3">
                Shop directory
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                role="status"
              >
                {filteredShops.length}{" "}
                {filteredShops.length === 1 ? "shop" : "shops"}
              </Typography>
            </Box>
            <Stack direction="row" gap={3} flexWrap="wrap">
              <TextField
                label="Search shops"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              {canManage && (
                <Button
                  variant="contained"
                  startIcon={<AddOutlined />}
                  onClick={openCreate}
                >
                  Create shop
                </Button>
              )}
            </Stack>
          </Stack>
          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
              <CircularProgress size={32} />
            </Stack>
          ) : (
            <TableContainer
              tabIndex={0}
              role="region"
              aria-label="Shop directory"
            >
              <Table aria-label="Shop directory">
                <TableHead>
                  <TableRow>
                    <TableCell>Shop</TableCell>
                    <TableCell>Representative</TableCell>
                    <TableCell align="right">System cut</TableCell>
                    <TableCell>Branches</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredShops.map((shop) => {
                    const shopStatus = statusFor(shop);
                    return (
                      <TableRow key={shop.shop_id} hover>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2">
                            {shop.shopName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {shop.address}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Typography variant="caption" sx={{ fontFamily: numericFontFamily }}>
                              {shop.shop_id}
                            </Typography>
                            <Tooltip title="Copy player Shop ID">
                              <IconButton size="small" aria-label={`Copy Shop ID ${shop.shop_id}`} onClick={() => copyShopId(shop.shop_id)}>
                                <ContentCopyOutlined sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {representativeNames[shop.representativePhone || shop.agentId] || shop.representativePhone || shop.agentId}
                          <Typography variant="caption" display="block" color="text.secondary">
                            {shop.representativeRole || "agent"}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontFamily: numericFontFamily }}
                        >
                          {shop.systemCutPercent}%
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`${branchCounts[shop.shop_id] || 0} ${branchCounts[shop.shop_id] === 1 ? "branch" : "branches"}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={shopStatus.color}
                            label={shopStatus.label}
                          />
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: numericFontFamily,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {dateTime.format(new Date(shop.createdAt))}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Manage branches">
                            <IconButton
                              aria-label={`Manage branches for ${shop.shopName}`}
                              onClick={() => setBranchShop(shop)}
                            >
                              <AccountTreeOutlined />
                            </IconButton>
                          </Tooltip>
                          {canManage && (
                            <>
                              <Tooltip title="Edit shop">
                                <IconButton
                                  aria-label={`Edit ${shop.shopName}`}
                                  onClick={() => openEdit(shop)}
                                >
                                  <EditOutlined />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete shop">
                                <IconButton
                                  color="error"
                                  aria-label={`Delete ${shop.shopName}`}
                                  onClick={() => setShopToDelete(shop)}
                                >
                                  <DeleteOutline />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!filteredShops.length && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                        <Typography variant="subtitle1">
                          No shops found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {search
                            ? "Try another search."
                            : "Create a shop to get started."}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
      <Dialog open={formOpen} onClose={closeForm} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={saveShop}>
          <DialogTitle>{editingShop ? "Edit shop" : "Create shop"}</DialogTitle>
          <DialogContent>
            <Stack gap={4} sx={{ pt: 1 }}>
              <TextField
                required
                label="Shop name"
                value={form.shopName}
                onChange={setField("shopName")}
              />
              <TextField
                required
                label="Address"
                value={form.address}
                onChange={setField("address")}
              />
              <Autocomplete
                options={representatives}
                value={representatives.find((person) => person.phone === form.representativePhone) || null}
                onChange={(_, person) =>
                  setForm((current) => ({ ...current, representativePhone: person?.phone || "" }))
                }
                getOptionLabel={(person) => `${person.username || person.phone} · ${person.phone} · ${person.role}`}
                isOptionEqualToValue={(option, value) => option.phone === value.phone}
                renderInput={(params) => (
                  <TextField {...params} required label="Shop representative" placeholder="Search name, phone, or role" />
                )}
              />
              <TextField
                required
                label="System cut percent"
                type="number"
                inputProps={{ min: 0.000001, step: "any" }}
                value={form.systemCutPercent}
                onChange={setField("systemCutPercent")}
              />
              <TextField
                select
                label="Status"
                value={String(form.isActive)}
                onChange={setField("isActive")}
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </TextField>
              <TextField
                label="Banned until"
                type="datetime-local"
                value={form.banUntil}
                onChange={setField("banUntil")}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button color="inherit" onClick={closeForm} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                saving ||
                !form.representativePhone ||
                !form.shopName.trim() ||
                !form.address.trim() ||
                !form.systemCutPercent
              }
            >
              {saving
                ? "Saving…"
                : editingShop
                  ? "Save changes"
                  : "Create shop"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Dialog
        open={Boolean(shopToDelete)}
        onClose={() => !deleting && setShopToDelete(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete shop?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This permanently removes {shopToDelete?.shopName}. Delete or
            reassign its branches first.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            color="inherit"
            onClick={() => setShopToDelete(null)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete shop"}
          </Button>
        </DialogActions>
      </Dialog>
      <ShopBranchesDialog
        shop={branchShop}
        open={Boolean(branchShop)}
        onClose={() => setBranchShop(null)}
        onChanged={loadShops}
      />
    </MarketplaceLayout>
  );
}

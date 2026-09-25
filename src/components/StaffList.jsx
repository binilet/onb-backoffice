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
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Switch,
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
import AddOutlined from "@mui/icons-material/AddOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import { numericFontFamily } from "../../theme";
import MarketplaceLayout from "../marketplace/MarketplaceLayout";
import {
  createStaff,
  getBranches,
  getShops,
  getStaff,
  updateStaff,
} from "../marketplace/shopApi";

const initialForm = {
  phone: "",
  username: "",
  password: "",
  role: "",
  shopId: "",
  branchId: "",
  parentCutPercent: "",
};
const dateTime = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeZone: "Africa/Addis_Ababa",
});
const apiError = (error, fallback) => error.response?.data?.detail || fallback;

function rolesFor(role) {
  if (role === "system") return ["agent", "subagent", "admin", "cashier"];
  if (role === "agent") return ["subagent", "admin", "cashier"];
  if (role === "subagent") return ["admin", "cashier"];
  if (role === "admin") return ["cashier"];
  return [];
}

function requiresAssignedCut(assignerRole, recipientRole) {
  return ["system", "agent", "subagent"].includes(assignerRole) &&
    ["agent", "subagent", "admin", "cashier"].includes(recipientRole);
}

export default function StaffList() {
  const currentUser = useSelector((state) => state.auth._current_user);
  const role = currentUser?.role;
  const canView = ["system", "agent", "subagent", "admin", "cashier"].includes(role);
  const canCreate = rolesFor(role).length > 0;
  const [staff, setStaff] = useState([]);
  const [shops, setShops] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [roleTab, setRoleTab] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    password: "",
    isActive: true,
    banUntil: "",
    branchId: "",
    parentCutPercent: "",
    role: "",
    shopId: "",
    forShop: true,
  });
  const [updating, setUpdating] = useState(false);

  const loadStaff = useCallback(async () => {
    if (!canView) return;
    setLoading(true);
    setError("");
    try {
      const [staffData, branchData, shopData] = await Promise.all([
        getStaff(),
        getBranches(),
        ["system", "agent", "subagent"].includes(role) ? getShops() : Promise.resolve([]),
      ]);
      setStaff(staffData);
      setBranches(branchData);
      setShops(shopData);
    } catch (requestError) {
      setError(apiError(requestError, "Unable to load staff."));
    } finally {
      setLoading(false);
    }
  }, [canView, role]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const shopNames = useMemo(
    () =>
      Object.fromEntries(shops.map((shop) => [shop.shop_id, shop.shopName])),
    [shops],
  );
  const branchNames = useMemo(
    () =>
      Object.fromEntries(
        branches.map((branch) => [branch.branch_id, branch.branchName]),
      ),
    [branches],
  );
  const searchedStaff = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return query
      ? staff.filter((person) =>
          `${person.username} ${person.phone} ${person.role} ${shopNames[person.shopId] || person.shopId || ""} ${branchNames[person.branchId] || person.branchId || ""}`
            .toLocaleLowerCase()
            .includes(query),
        )
      : staff;
  }, [branchNames, search, shopNames, staff]);
  const staffCounts = useMemo(
    () =>
      staff.reduce(
        (counts, person) => ({
          ...counts,
          [person.role]: (counts[person.role] || 0) + 1,
        }),
        {},
      ),
    [staff],
  );
  const filteredStaff = useMemo(
    () =>
      roleTab === "all"
        ? searchedStaff
        : searchedStaff.filter((person) => person.role === roleTab),
    [roleTab, searchedStaff],
  );
  const formBranches = useMemo(
    () => branches.filter((branch) => branch.shopId === form.shopId),
    [branches, form.shopId],
  );

  const openCreate = () => {
    const availableRoles = rolesFor(role);
    const defaultRole = availableRoles[0] || "";
    const defaultShopId = role === "admin" ? currentUser?.shopId || "" : "";
    setForm({ ...initialForm, role: defaultRole, shopId: defaultShopId });
    setError("");
    setFormOpen(true);
  };
  const closeForm = () => {
    if (!saving) setFormOpen(false);
  };
  const openEdit = (person) => {
    setEditingPerson(person);
    setEditForm({
      username: person.username,
      password: "",
      isActive: person.isActive,
      banUntil: person.banUntil ? person.banUntil.slice(0, 16) : "",
      branchId: person.branchId || "",
      parentCutPercent: person.parentCutPercent || "",
      role: person.role,
      shopId: person.shopId || "",
      forShop: true,
    });
    setError("");
  };
  const closeEdit = () => {
    if (!updating) setEditingPerson(null);
  };
  const setField = (field) => (event) =>
    setForm((current) => {
      const next = { ...current, [field]: event.target.value };
      if (field === "role" && ["agent", "subagent"].includes(event.target.value))
        return { ...next, shopId: "", branchId: "" };
      if (field === "shopId") return { ...next, branchId: "" };
      return next;
    });
  const setEditField = (field) => (event) =>
    setEditForm((current) => {
      const value =
        field === "isActive"
          ? event.target.value === "true"
          : event.target.value;
      const next = { ...current, [field]: value };
      if (field === "role" && ["agent", "subagent"].includes(value))
        return { ...next, shopId: "", branchId: "" };
      if (field === "role" && value !== "cashier")
        return { ...next, branchId: "" };
      if (field === "shopId") return { ...next, branchId: "" };
      return next;
    });

  const saveStaff = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      phone: form.phone.trim(),
      username: form.username.trim(),
      password: form.password,
      role: form.role,
      isActive: true,
      verified: true,
      forShop: true,
      shopId: ["agent", "subagent"].includes(form.role) ? null : form.shopId || null,
      branchId: form.role === "cashier" ? form.branchId : null,
      parentCutPercent:
        requiresAssignedCut(role, form.role)
          ? Number(form.parentCutPercent)
          : null,
    };
    try {
      await createStaff(payload);
      setNotice(`Created ${payload.username}.`);
      setFormOpen(false);
      await loadStaff();
    } catch (requestError) {
      setError(apiError(requestError, "Unable to create staff."));
    } finally {
      setSaving(false);
    }
  };

  const shopRequired = form.role === "cashier";
  const branchRequired = form.role === "cashier";
  const showShopSelect =
    (form.role === "admin" || form.role === "cashier") && role !== "admin";
  const cutRequired =
    requiresAssignedCut(role, form.role);
  const editBranches = useMemo(
    () => branches.filter((branch) => branch.shopId === editForm.shopId),
    [branches, editForm.shopId],
  );
  const canEdit = (person) =>
    role !== "cashier" || person.phone === currentUser?.phone;
  const canChangeRole = (person) =>
    person?.phone !== currentUser?.phone &&
    (role === "system" || person?.parentPhone === currentUser?.phone);

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!editingPerson) return;
    setUpdating(true);
    setError("");
    const payload = { username: editForm.username.trim() };
    const roleChanged = editForm.role !== editingPerson.role;
    if (canChangeRole(editingPerson) && roleChanged) {
      payload.role = editForm.role;
      payload.shopId = ["admin", "cashier"].includes(editForm.role)
        ? editForm.shopId || null
        : null;
      payload.branchId = editForm.role === "cashier" ? editForm.branchId : null;
    }
    if (
      editForm.role === "cashier" &&
      editingPerson.phone !== currentUser?.phone
    )
      payload.branchId = editForm.branchId;
    if (editingPerson.phone !== currentUser?.phone) {
      payload.isActive = editForm.isActive;
      payload.forShop = editForm.forShop;
      payload.banUntil = editForm.banUntil
        ? new Date(editForm.banUntil).toISOString()
        : null;
      if (editForm.password) payload.password = editForm.password;
      if (
        requiresAssignedCut(role, editForm.role) &&
        (role === "system" || editingPerson.parentPhone === currentUser?.phone)
      )
        payload.parentCutPercent = Number(editForm.parentCutPercent);
    }
    try {
      await updateStaff(editingPerson.phone, payload);
      setNotice(`Updated ${editForm.username}.`);
      setEditingPerson(null);
      await loadStaff();
    } catch (requestError) {
      setError(apiError(requestError, "Unable to update staff."));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <MarketplaceLayout
      title="Staff"
      subtitle="View staff in your hierarchy and create the roles your account is authorized to add."
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
            Only shop-hierarchy staff can view this directory.
          </Typography>
        </Paper>
      )}
      {canView && (
        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1.5}
            flexWrap="wrap"
            sx={{ p: 2 }}
          >
            <Typography variant="caption" color="text.secondary" role="status">
                {filteredStaff.length}{" "}
                {filteredStaff.length === 1
                  ? "staff account"
                  : "staff accounts"}
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <TextField
                label="Search staff"
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
              {canCreate && (
                <Button
                  variant="contained"
                  startIcon={<AddOutlined />}
                  onClick={openCreate}
                >
                  Create staff
                </Button>
              )}
            </Stack>
          </Stack>
          <Alert severity="info" variant="outlined" sx={{ mx: 4, mb: 4 }}>
            A manager password reset creates a temporary password and requires
            the staff member to change it at their next sign-in.
          </Alert>
          <Tabs
            value={roleTab}
            onChange={(_, value) => setRoleTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Staff role groups"
            sx={{ px: 3, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab value="all" label={`All (${staff.length})`} />
            <Tab value="agent" label={`Agents (${staffCounts.agent || 0})`} />
            <Tab
              value="subagent"
              label={`Subagents (${staffCounts.subagent || 0})`}
            />
            <Tab value="admin" label={`Admins (${staffCounts.admin || 0})`} />
            <Tab
              value="cashier"
              label={`Cashiers (${staffCounts.cashier || 0})`}
            />
          </Tabs>
          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
              <CircularProgress size={32} />
            </Stack>
          ) : (
            <TableContainer
              tabIndex={0}
              role="region"
              aria-label="Staff directory"
            >
              <Table aria-label="Staff directory">
                <TableHead>
                  <TableRow>
                    <TableCell>Staff member</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="right">Assigned cut</TableCell>
                    <TableCell>Shop</TableCell>
                    <TableCell>Branch</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStaff.map((person) => (
                    <TableRow key={person.phone} hover>
                      <TableCell component="th" scope="row">
                        <Typography variant="body2">
                          {person.username}
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
                        sx={{ fontFamily: numericFontFamily, whiteSpace: "nowrap" }}
                      >
                        {person.parentCutPercent == null
                          ? "—"
                          : `${person.parentCutPercent}%`}
                      </TableCell>
                      <TableCell>
                        {shopNames[person.shopId] || person.shopId || "—"}
                      </TableCell>
                      <TableCell>
                        {branchNames[person.branchId] || person.branchId || "—"}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: numericFontFamily,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {dateTime.format(new Date(person.createdAt))}
                      </TableCell>
                      <TableCell align="right">
                        {canEdit(person) && (
                          <Button
                            size="small"
                            startIcon={<EditOutlined />}
                            onClick={() => openEdit(person)}
                          >
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filteredStaff.length && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography variant="subtitle1">
                          No staff found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {search
                            ? "Try another search."
                            : "There are no staff accounts in your scope."}
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
        <Box component="form" onSubmit={saveStaff}>
          <DialogTitle>Create staff</DialogTitle>
          <DialogContent>
            <Stack gap={4} sx={{ pt: 1 }}>
              <TextField
                required
                label="Username"
                value={form.username}
                onChange={setField("username")}
              />
              <TextField
                required
                label="Phone"
                value={form.phone}
                onChange={setField("phone")}
              />
              <TextField
                required
                label="Temporary password"
                type="password"
                helperText="At least 6 characters"
                value={form.password}
                onChange={setField("password")}
              />
              <TextField
                required
                select
                label="Role"
                value={form.role}
                onChange={setField("role")}
              >
                {rolesFor(role).map((staffRole) => (
                  <MenuItem key={staffRole} value={staffRole}>
                    {staffRole}
                  </MenuItem>
                ))}
              </TextField>
              {showShopSelect && (
                <Autocomplete
                  options={shops}
                  value={
                    shops.find((shop) => shop.shop_id === form.shopId) || null
                  }
                  onChange={(_, shop) =>
                    setForm((current) => ({
                      ...current,
                      shopId: shop?.shop_id || "",
                      branchId: "",
                    }))
                  }
                  getOptionLabel={(shop) =>
                    `${shop.shopName} · ${shop.shop_id}`
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.shop_id === value.shop_id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required={shopRequired}
                      label="Shop"
                      placeholder="Search by Shop name or ID"
                    />
                  )}
                />
              )}
              {cutRequired && (
                <TextField
                  required
                  type="number"
                  label="Assigned cut percentage"
                  inputProps={{ min: 0.000001, step: "any" }}
                  value={form.parentCutPercent}
                  onChange={setField("parentCutPercent")}
                />
              )}
              {shopRequired && role === "admin" && (
                <TextField
                  label="Shop"
                  value={shopNames[form.shopId] || form.shopId}
                  disabled
                />
              )}
              {branchRequired && (
                <TextField
                  required
                  select
                  label="Branch"
                  value={form.branchId}
                  onChange={setField("branchId")}
                  disabled={!form.shopId}
                >
                  {formBranches.map((branch) => (
                    <MenuItem key={branch.branch_id} value={branch.branch_id}>
                      {branch.branchName}
                    </MenuItem>
                  ))}
                </TextField>
              )}
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
                !form.phone.trim() ||
                !form.username.trim() ||
                form.password.length < 6 ||
                !form.role ||
                (shopRequired && !form.shopId) ||
                (branchRequired && !form.branchId) ||
                (cutRequired && !(Number(form.parentCutPercent) > 0))
              }
            >
              {saving ? "Creating…" : "Create staff"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Dialog
        open={Boolean(editingPerson)}
        onClose={closeEdit}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={saveEdit}>
          <DialogTitle>Edit staff</DialogTitle>
          <DialogContent>
            <Stack gap={4} sx={{ pt: 1 }}>
              <TextField
                required
                label="Username"
                value={editForm.username}
                onChange={setEditField("username")}
              />
              {canChangeRole(editingPerson) && (
                <TextField
                  label="Reset temporary password"
                  type="password"
                  helperText="Leave blank to keep the password. If set, the staff member must change it after signing in."
                  value={editForm.password}
                  onChange={setEditField("password")}
                />
              )}
              {canChangeRole(editingPerson) && (
                <TextField
                  required
                  select
                  label="Role"
                  value={editForm.role}
                  onChange={setEditField("role")}
                >
                  {rolesFor(role).map((staffRole) => (
                    <MenuItem key={staffRole} value={staffRole}>
                      {staffRole}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {canChangeRole(editingPerson) &&
                ["admin", "cashier"].includes(editForm.role) &&
                role !== "admin" && (
                  <Autocomplete
                    options={shops}
                    value={
                      shops.find((shop) => shop.shop_id === editForm.shopId) ||
                      null
                    }
                    onChange={(_, shop) =>
                      setEditForm((current) => ({
                        ...current,
                        shopId: shop?.shop_id || "",
                        branchId: "",
                      }))
                    }
                    getOptionLabel={(shop) =>
                      `${shop.shopName} · ${shop.shop_id}`
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.shop_id === value.shop_id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required={editForm.role === "cashier"}
                        label="Shop"
                        placeholder="Search by Shop name or ID"
                      />
                    )}
                  />
                )}
              {editForm.role === "cashier" &&
                editingPerson?.phone !== currentUser?.phone && (
                  <TextField
                    required
                    select
                    label="Branch"
                    value={editForm.branchId || ""}
                    onChange={setEditField("branchId")}
                  >
                    {editBranches.map((branch) => (
                      <MenuItem key={branch.branch_id} value={branch.branch_id}>
                        {branch.branchName}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              {editingPerson?.phone !== currentUser?.phone && (
                <>
                  {requiresAssignedCut(role, editForm.role) &&
                    (role === "system" || editingPerson?.parentPhone === currentUser?.phone) && (
                      <TextField
                        required
                        type="number"
                        label="Assigned cut percentage"
                        inputProps={{ min: 0.000001, step: "any" }}
                        value={editForm.parentCutPercent}
                        onChange={setEditField("parentCutPercent")}
                      />
                    )}
                  <TextField
                    select
                    label="Status"
                    value={String(editForm.isActive)}
                    onChange={setEditField("isActive")}
                  >
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </TextField>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      Shop staff access
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Switch
                        checked={editForm.forShop}
                        onChange={(event) =>
                          setEditForm((current) => ({
                            ...current,
                            forShop: event.target.checked,
                          }))
                        }
                        inputProps={{ "aria-label": "Shop staff access" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {editForm.forShop ? "Included in shop staff" : "Legacy user only"}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Removing access keeps this account in Legacy Users but removes it from this Staff directory.
                    </Typography>
                  </Box>
                  <TextField
                    label="Banned until"
                    type="datetime-local"
                    value={editForm.banUntil}
                    onChange={setEditField("banUntil")}
                    InputLabelProps={{ shrink: true }}
                  />
                </>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button color="inherit" onClick={closeEdit} disabled={updating}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                updating ||
                !editForm.username.trim() ||
                (editForm.password && editForm.password.length < 6) ||
                (editForm.role === "cashier" &&
                  editingPerson?.phone !== currentUser?.phone &&
                  (!editForm.shopId || !editForm.branchId)) ||
                (requiresAssignedCut(role, editForm.role) &&
                  (role === "system" || editingPerson?.parentPhone === currentUser?.phone) &&
                  !(Number(editForm.parentCutPercent) > 0))
              }
            >
              {updating ? "Saving…" : "Save changes"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </MarketplaceLayout>
  );
}

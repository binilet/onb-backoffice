import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import AddOutlined from '@mui/icons-material/AddOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import { numericFontFamily } from '../../theme';
import MarketplaceLayout from '../marketplace/MarketplaceLayout';
import { createStaff, getBranches, getShops, getStaff, updateStaff } from '../marketplace/shopApi';

const initialForm = { phone: '', username: '', password: '', role: '', shopId: '', branchId: '' };
const dateTime = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'Africa/Addis_Ababa' });
const apiError = (error, fallback) => error.response?.data?.detail || fallback;

function rolesFor(role) {
  if (role === 'system') return ['agent', 'admin', 'cashier'];
  if (role === 'agent') return ['admin', 'cashier'];
  if (role === 'admin') return ['cashier'];
  return [];
}

export default function StaffList() {
  const currentUser = useSelector((state) => state.auth._current_user);
  const role = currentUser?.role;
  const canView = ['system', 'agent', 'admin', 'cashier'].includes(role);
  const canCreate = rolesFor(role).length > 0;
  const [staff, setStaff] = useState([]);
  const [shops, setShops] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', password: '', isActive: true, banUntil: '', branchId: '' });
  const [updating, setUpdating] = useState(false);

  const loadStaff = useCallback(async () => {
    if (!canView) return;
    setLoading(true);
    setError('');
    try {
      const [staffData, branchData, shopData] = await Promise.all([
        getStaff(),
        getBranches(),
        ['system', 'agent'].includes(role) ? getShops() : Promise.resolve([]),
      ]);
      setStaff(staffData);
      setBranches(branchData);
      setShops(shopData);
    } catch (requestError) {
      setError(apiError(requestError, 'Unable to load staff.'));
    } finally {
      setLoading(false);
    }
  }, [canView, role]);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const shopNames = useMemo(() => Object.fromEntries(shops.map((shop) => [shop.shop_id, shop.shopName])), [shops]);
  const branchNames = useMemo(() => Object.fromEntries(branches.map((branch) => [branch.branch_id, branch.branchName])), [branches]);
  const filteredStaff = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return query ? staff.filter((person) => `${person.username} ${person.phone} ${person.role} ${shopNames[person.shopId] || person.shopId || ''} ${branchNames[person.branchId] || person.branchId || ''}`.toLocaleLowerCase().includes(query)) : staff;
  }, [branchNames, search, shopNames, staff]);
  const formBranches = useMemo(() => branches.filter((branch) => branch.shopId === form.shopId), [branches, form.shopId]);

  const openCreate = () => {
    const availableRoles = rolesFor(role);
    const defaultRole = availableRoles[0] || '';
    const defaultShopId = role === 'admin' ? currentUser?.shopId || '' : '';
    setForm({ ...initialForm, role: defaultRole, shopId: defaultShopId });
    setError('');
    setFormOpen(true);
  };
  const closeForm = () => { if (!saving) setFormOpen(false); };
  const openEdit = (person) => { setEditingPerson(person); setEditForm({ username: person.username, password: '', isActive: person.isActive, banUntil: person.banUntil ? person.banUntil.slice(0, 16) : '', branchId: person.branchId || '' }); setError(''); };
  const closeEdit = () => { if (!updating) setEditingPerson(null); };
  const setField = (field) => (event) => setForm((current) => {
    const next = { ...current, [field]: event.target.value };
    if (field === 'role' && event.target.value === 'agent') return { ...next, shopId: '', branchId: '' };
    if (field === 'shopId') return { ...next, branchId: '' };
    return next;
  });
  const setEditField = (field) => (event) => setEditForm((current) => ({ ...current, [field]: field === 'isActive' ? event.target.value === 'true' : event.target.value }));

  const saveStaff = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      phone: form.phone.trim(),
      username: form.username.trim(),
      password: form.password,
      role: form.role,
      shopId: form.role === 'agent' ? null : form.shopId,
      branchId: form.role === 'cashier' ? form.branchId : null,
    };
    try {
      await createStaff(payload);
      setNotice(`Created ${payload.username}.`);
      setFormOpen(false);
      await loadStaff();
    } catch (requestError) {
      setError(apiError(requestError, 'Unable to create staff.'));
    } finally {
      setSaving(false);
    }
  };

  const shopRequired = form.role === 'admin' || form.role === 'cashier';
  const branchRequired = form.role === 'cashier';
  const showShopSelect = shopRequired && role !== 'admin';
  const editBranches = useMemo(() => branches.filter((branch) => branch.shopId === editingPerson?.shopId), [branches, editingPerson]);
  const canEdit = (person) => role !== 'cashier' || person.phone === currentUser?.phone;

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!editingPerson) return;
    setUpdating(true);
    setError('');
    const payload = { username: editForm.username.trim() };
    if (editingPerson.role === 'cashier' && editingPerson.phone !== currentUser?.phone) payload.branchId = editForm.branchId;
    if (editingPerson.phone !== currentUser?.phone) {
      payload.isActive = editForm.isActive;
      payload.banUntil = editForm.banUntil ? new Date(editForm.banUntil).toISOString() : null;
      if (editForm.password) payload.password = editForm.password;
    }
    try {
      await updateStaff(editingPerson.phone, payload);
      setNotice(`Updated ${editForm.username}.`);
      setEditingPerson(null);
      await loadStaff();
    } catch (requestError) {
      setError(apiError(requestError, 'Unable to update staff.'));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <MarketplaceLayout title="Staff" subtitle="View staff in your hierarchy and create the roles your account is authorized to add." showPreviewNotice={false}>
      {error && <Alert severity="error" variant="outlined" sx={{ mb: 4 }} onClose={() => setError('')}>{error}</Alert>}
      {notice && <Alert severity="success" variant="outlined" sx={{ mb: 4 }} onClose={() => setNotice('')}>{notice}</Alert>}
      {!canView && <Paper variant="outlined" sx={{ p: 8, textAlign: 'center' }}><Typography variant="subtitle1">Restricted access</Typography><Typography variant="body2" color="text.secondary">Only shop-hierarchy staff can view this directory.</Typography></Paper>}
      {canView && <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={3} flexWrap="wrap" sx={{ p: 4 }}>
          <Box><Typography component="h2" variant="h3">Staff directory</Typography><Typography variant="caption" color="text.secondary" role="status">{filteredStaff.length} {filteredStaff.length === 1 ? 'staff account' : 'staff accounts'}</Typography></Box>
          <Stack direction="row" gap={3} flexWrap="wrap"><TextField label="Search staff" value={search} onChange={(event) => setSearch(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> }} />{canCreate && <Button variant="contained" startIcon={<AddOutlined />} onClick={openCreate}>Create staff</Button>}</Stack>
        </Stack>
        <Alert severity="info" variant="outlined" sx={{ mx: 4, mb: 4 }}>A manager password reset creates a temporary password and requires the staff member to change it at their next sign-in.</Alert>
        {loading ? <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}><CircularProgress size={32} /></Stack> : <TableContainer tabIndex={0} role="region" aria-label="Staff directory"><Table aria-label="Staff directory"><TableHead><TableRow><TableCell>Staff member</TableCell><TableCell>Role</TableCell><TableCell>Shop</TableCell><TableCell>Branch</TableCell><TableCell>Created</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>
          {filteredStaff.map((person) => <TableRow key={person.phone} hover><TableCell component="th" scope="row"><Typography variant="body2">{person.username}</Typography><Typography variant="caption" color="text.secondary" sx={{ fontFamily: numericFontFamily }}>{person.phone}</Typography></TableCell><TableCell><Chip size="small" label={person.role} /></TableCell><TableCell>{shopNames[person.shopId] || person.shopId || '—'}</TableCell><TableCell>{branchNames[person.branchId] || person.branchId || '—'}</TableCell><TableCell sx={{ fontFamily: numericFontFamily, whiteSpace: 'nowrap' }}>{dateTime.format(new Date(person.createdAt))}</TableCell><TableCell align="right">{canEdit(person) && <Button size="small" startIcon={<EditOutlined />} onClick={() => openEdit(person)}>Edit</Button>}</TableCell></TableRow>)}
          {!filteredStaff.length && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 10 }}><Typography variant="subtitle1">No staff found</Typography><Typography variant="body2" color="text.secondary">{search ? 'Try another search.' : 'There are no staff accounts in your scope.'}</Typography></TableCell></TableRow>}
        </TableBody></Table></TableContainer>}
      </Paper>}
      <Dialog open={formOpen} onClose={closeForm} fullWidth maxWidth="sm"><Box component="form" onSubmit={saveStaff}><DialogTitle>Create staff</DialogTitle><DialogContent><Stack gap={4} sx={{ pt: 1 }}><TextField required label="Username" value={form.username} onChange={setField('username')} /><TextField required label="Phone" value={form.phone} onChange={setField('phone')} /><TextField required label="Temporary password" type="password" helperText="At least 6 characters" value={form.password} onChange={setField('password')} /><TextField required select label="Role" value={form.role} onChange={setField('role')}>{rolesFor(role).map((staffRole) => <MenuItem key={staffRole} value={staffRole}>{staffRole}</MenuItem>)}</TextField>{showShopSelect && <TextField required select label="Shop" value={form.shopId} onChange={setField('shopId')}>{shops.map((shop) => <MenuItem key={shop.shop_id} value={shop.shop_id}>{shop.shopName}</MenuItem>)}</TextField>}{shopRequired && role === 'admin' && <TextField label="Shop" value={shopNames[form.shopId] || form.shopId} disabled />}{branchRequired && <TextField required select label="Branch" value={form.branchId} onChange={setField('branchId')} disabled={!form.shopId}>{formBranches.map((branch) => <MenuItem key={branch.branch_id} value={branch.branch_id}>{branch.branchName}</MenuItem>)}</TextField>}</Stack></DialogContent><DialogActions><Button color="inherit" onClick={closeForm} disabled={saving}>Cancel</Button><Button type="submit" variant="contained" disabled={saving || !form.phone.trim() || !form.username.trim() || form.password.length < 6 || !form.role || (shopRequired && !form.shopId) || (branchRequired && !form.branchId)}>{saving ? 'Creating…' : 'Create staff'}</Button></DialogActions></Box></Dialog>
      <Dialog open={Boolean(editingPerson)} onClose={closeEdit} fullWidth maxWidth="sm"><Box component="form" onSubmit={saveEdit}><DialogTitle>Edit staff</DialogTitle><DialogContent><Stack gap={4} sx={{ pt: 1 }}><TextField required label="Username" value={editForm.username} onChange={setEditField('username')} />{editingPerson?.phone !== currentUser?.phone && <TextField label="Reset temporary password" type="password" helperText="Leave blank to keep the password. If set, the staff member must change it after signing in." value={editForm.password} onChange={setEditField('password')} />}{editingPerson?.role === 'cashier' && editingPerson?.phone !== currentUser?.phone && <TextField required select label="Branch" value={editForm.branchId} onChange={setEditField('branchId')}>{editBranches.map((branch) => <MenuItem key={branch.branch_id} value={branch.branch_id}>{branch.branchName}</MenuItem>)}</TextField>}{editingPerson?.phone !== currentUser?.phone && <><TextField select label="Status" value={String(editForm.isActive)} onChange={setEditField('isActive')}><MenuItem value="true">Active</MenuItem><MenuItem value="false">Inactive</MenuItem></TextField><TextField label="Banned until" type="datetime-local" value={editForm.banUntil} onChange={setEditField('banUntil')} InputLabelProps={{ shrink: true }} /></>}</Stack></DialogContent><DialogActions><Button color="inherit" onClick={closeEdit} disabled={updating}>Cancel</Button><Button type="submit" variant="contained" disabled={updating || !editForm.username.trim() || (editForm.password && editForm.password.length < 6) || (editingPerson?.role === 'cashier' && editingPerson?.phone !== currentUser?.phone && !editForm.branchId)}>{updating ? 'Saving…' : 'Save changes'}</Button></DialogActions></Box></Dialog>
    </MarketplaceLayout>
  );
}

import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import AddOutlined from '@mui/icons-material/AddOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import EditOutlined from '@mui/icons-material/EditOutlined';
import { numericFontFamily } from '../../theme';
import { createBranch, deleteBranch, getBranches, updateBranch } from '../marketplace/shopApi';

const initialForm = { branchName: '', address: '', depositPhone: '', telebirrAccountName: '', isActive: true, banUntil: '' };
const dateTime = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'Africa/Addis_Ababa' });
const apiError = (error, fallback) => error.response?.data?.detail || fallback;

function toForm(branch) {
  return { branchName: branch.branchName, address: branch.address, depositPhone: branch.depositPhone || '', telebirrAccountName: branch.telebirrAccountName || '', isActive: branch.isActive, banUntil: branch.banUntil ? branch.banUntil.slice(0, 16) : '' };
}

function statusFor(branch) {
  if (branch.banUntil && new Date(branch.banUntil) > new Date()) return { label: 'Banned', color: 'warning' };
  if (!branch.isActive) return { label: 'Inactive', color: 'default' };
  return { label: 'Active', color: 'success' };
}

export default function ShopBranchesDialog({ shop, open, onClose, onChanged }) {
  const role = useSelector((state) => state.auth._current_user?.role);
  const canManage = role === 'system' || role === 'agent';
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadBranches = useCallback(async () => {
    if (!shop || !open) return;
    setLoading(true);
    setError('');
    try {
      const data = await getBranches();
      setBranches(data.filter((branch) => branch.shopId === shop.shop_id));
    } catch (requestError) {
      setError(apiError(requestError, 'Unable to load branches.'));
    } finally {
      setLoading(false);
    }
  }, [open, shop]);

  useEffect(() => { loadBranches(); }, [loadBranches]);

  const closeForm = () => { if (!saving) setFormOpen(false); };
  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: field === 'isActive' ? event.target.value === 'true' : event.target.value }));
  const openCreate = () => { setEditingBranch(null); setForm(initialForm); setError(''); setFormOpen(true); };
  const openEdit = (branch) => { setEditingBranch(branch); setForm(toForm(branch)); setError(''); setFormOpen(true); };

  const saveBranch = async (event) => {
    event.preventDefault();
    if (!shop) return;
    setSaving(true);
    setError('');
    const payload = { branchName: form.branchName.trim(), address: form.address.trim(), depositPhone: form.depositPhone.trim(), telebirrAccountName: form.telebirrAccountName.trim(), isActive: form.isActive, banUntil: form.banUntil ? new Date(form.banUntil).toISOString() : null };
    try {
      if (editingBranch) {
        await updateBranch(editingBranch.branch_id, payload);
        setNotice(`Updated ${payload.branchName}.`);
      } else {
        await createBranch(shop.shop_id, payload);
        setNotice(`Created ${payload.branchName}.`);
      }
      setFormOpen(false);
      await loadBranches();
      onChanged();
    } catch (requestError) {
      setError(apiError(requestError, 'Unable to save the branch.'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!branchToDelete) return;
    setDeleting(true);
    setError('');
    try {
      await deleteBranch(branchToDelete.branch_id);
      setNotice(`Deleted ${branchToDelete.branchName}.`);
      setBranchToDelete(null);
      await loadBranches();
      onChanged();
    } catch (requestError) {
      setError(apiError(requestError, 'Unable to delete the branch.'));
    } finally {
      setDeleting(false);
    }
  };

  return <Dialog open={open} onClose={() => !saving && !deleting && onClose()} fullWidth maxWidth="md">
    <DialogTitle>{shop?.shopName} branches</DialogTitle>
    <DialogContent dividers>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={3} flexWrap="wrap" sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">Branches are managed as part of this shop.</Typography>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={openCreate}>Create branch</Button>
      </Stack>
      {error && <Alert severity="error" variant="outlined" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {notice && <Alert severity="success" variant="outlined" sx={{ mb: 3 }} onClose={() => setNotice('')}>{notice}</Alert>}
      {loading ? <Stack alignItems="center" justifyContent="center" sx={{ py: 7 }}><CircularProgress size={32} /></Stack> : <TableContainer><Table aria-label={`${shop?.shopName || 'Shop'} branches`}><TableHead><TableRow><TableCell>Branch</TableCell><TableCell>Telebirr deposit</TableCell><TableCell>Status</TableCell><TableCell>Created</TableCell>{canManage && <TableCell align="right">Actions</TableCell>}</TableRow></TableHead><TableBody>
        {branches.map((branch) => { const status = statusFor(branch); return <TableRow key={branch.branch_id} hover><TableCell component="th" scope="row"><Typography variant="body2">{branch.branchName}</Typography><Typography variant="caption" color="text.secondary">{branch.address}</Typography></TableCell><TableCell sx={{ fontFamily: numericFontFamily }}><Typography variant="body2">{branch.depositPhone || '—'}</Typography><Typography variant="caption" color="text.secondary">{branch.telebirrAccountName || 'Account name missing'}</Typography></TableCell><TableCell><Chip size="small" color={status.color} label={status.label} /></TableCell><TableCell sx={{ fontFamily: numericFontFamily, whiteSpace: 'nowrap' }}>{dateTime.format(new Date(branch.createdAt))}</TableCell>{canManage && <TableCell align="right"><Tooltip title="Edit branch"><IconButton aria-label={`Edit ${branch.branchName}`} onClick={() => openEdit(branch)}><EditOutlined /></IconButton></Tooltip><Tooltip title="Delete branch"><IconButton color="error" aria-label={`Delete ${branch.branchName}`} onClick={() => setBranchToDelete(branch)}><DeleteOutline /></IconButton></Tooltip></TableCell>}</TableRow>; })}
        {!branches.length && <TableRow><TableCell colSpan={canManage ? 5 : 4} align="center" sx={{ py: 7 }}><Typography variant="subtitle2">No branches yet</Typography><Typography variant="body2" color="text.secondary">Create the first branch for this shop.</Typography></TableCell></TableRow>}
      </TableBody></Table></TableContainer>}
    </DialogContent>
    <DialogActions><Button color="inherit" onClick={onClose} disabled={saving || deleting}>Close</Button></DialogActions>
    <Dialog open={formOpen} onClose={closeForm} fullWidth maxWidth="sm"><Box component="form" onSubmit={saveBranch}><DialogTitle>{editingBranch ? 'Edit branch' : 'Create branch'}</DialogTitle><DialogContent><Stack gap={4} sx={{ pt: 1 }}><TextField required label="Branch name" value={form.branchName} onChange={setField('branchName')} /><TextField required label="Address" value={form.address} onChange={setField('address')} /><TextField required label="Player deposit phone" helperText="Players transfer to this Telebirr number for the branch." value={form.depositPhone} onChange={setField('depositPhone')} /><TextField required label="Telebirr account name" helperText="Must exactly match the account name displayed on the player's receipt." value={form.telebirrAccountName} onChange={setField('telebirrAccountName')} /><Alert severity="warning" variant="outlined">The deposit phone and full account name must exactly match the player&apos;s Telebirr receipt. Deposits sent to mismatched details may not be processed automatically.</Alert><TextField select label="Status" value={String(form.isActive)} onChange={setField('isActive')}><MenuItem value="true">Active</MenuItem><MenuItem value="false">Inactive</MenuItem></TextField><TextField label="Banned until" type="datetime-local" value={form.banUntil} onChange={setField('banUntil')} InputLabelProps={{ shrink: true }} /></Stack></DialogContent><DialogActions><Button color="inherit" onClick={closeForm} disabled={saving}>Cancel</Button><Button type="submit" variant="contained" disabled={saving || !form.branchName.trim() || !form.address.trim() || !form.depositPhone.trim() || !form.telebirrAccountName.trim()}>{saving ? 'Saving…' : editingBranch ? 'Save changes' : 'Create branch'}</Button></DialogActions></Box></Dialog>
    <Dialog open={Boolean(branchToDelete)} onClose={() => !deleting && setBranchToDelete(null)} fullWidth maxWidth="xs"><DialogTitle>Delete branch?</DialogTitle><DialogContent><Typography variant="body2">This permanently removes {branchToDelete?.branchName}.</Typography></DialogContent><DialogActions><Button color="inherit" onClick={() => setBranchToDelete(null)} disabled={deleting}>Cancel</Button><Button color="error" variant="contained" onClick={confirmDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete branch'}</Button></DialogActions></Dialog>
  </Dialog>;
}

ShopBranchesDialog.propTypes = {
  shop: PropTypes.shape({
    shop_id: PropTypes.string.isRequired,
    shopName: PropTypes.string.isRequired,
  }),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onChanged: PropTypes.func.isRequired,
};

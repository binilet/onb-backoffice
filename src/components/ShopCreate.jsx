import { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import MarketplaceLayout from '../marketplace/MarketplaceLayout';
import { systemUsers } from '../marketplace/mocks';

const owners = systemUsers.filter((user) => user.role === 'owner');
const agents = systemUsers.filter((user) => user.role === 'agent');

const initialForm = {
  shopName: '',
  address: '',
  ownerId: '',
  agentId: '',
  isActive: true,
  banUntil: '',
  note: '',
};

export default function ShopCreate({ onToggleTheme, currentUser }) {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(null);
  const isSuper = currentUser?.role === 'super';

  const setField = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isSuper) return;
    setSubmitted({
      shop_id: 'shop-mock',
      shopName: form.shopName,
      address: form.address,
      ownerId: form.ownerId,
      agentId: form.agentId || null,
      isActive: true,
      banUntil: null,
      superLock: false,
      superBanUntil: null,
      note: form.note,
    });
  };

  const reset = () => {
    setForm(initialForm);
    setSubmitted(null);
  };

  if (!isSuper) {
    return (
      <MarketplaceLayout title="Create shop" subtitle="Super-only action." scopeLabel={currentUser ? `Mock ${currentUser.role} scope` : 'No scope'} currentUser={currentUser} onToggleTheme={onToggleTheme}>
        <Paper variant="outlined" sx={{ p: 10, textAlign: 'center' }}>
          <Typography variant="subtitle1">Restricted action</Typography>
          <Typography variant="body2" color="text.secondary">Only super can create shops.</Typography>
        </Paper>
      </MarketplaceLayout>
    );
  }

  return (
    <MarketplaceLayout title="Create shop" subtitle="Register a shop and assign its owner." scopeLabel="Super · All shops" currentUser={currentUser} onToggleTheme={onToggleTheme}>
      <Paper variant="outlined" component="form" onSubmit={handleSubmit} sx={{ p: { xs: 4, md: 8 } }}>
        <Stack gap={6}>
          <Stack gap={4}>
            <Typography component="h2" variant="h3">Shop</Typography>
            <TextField required label="Shop name" value={form.shopName} onChange={setField('shopName')} />
            <TextField required label="Address" value={form.address} onChange={setField('address')} />
            <TextField required select label="Owner" value={form.ownerId} onChange={setField('ownerId')}>
              {owners.map((owner) => <MenuItem key={owner.user_id} value={owner.user_id}>{owner.username}</MenuItem>)}
            </TextField>
            <TextField select label="Agent (optional)" value={form.agentId} onChange={setField('agentId')}>
              <MenuItem value="">Unassigned</MenuItem>
              {agents.map((agent) => <MenuItem key={agent.user_id} value={agent.user_id}>{agent.username}</MenuItem>)}
            </TextField>
          </Stack>
          <Stack gap={4}>
            <Typography component="h2" variant="h3">Access</Typography>
            <TextField select label="Status" value={form.isActive ? 'active' : 'inactive'} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.value === 'active' }))}>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
            <TextField label="Banned until (optional)" type="datetime-local" value={form.banUntil} onChange={setField('banUntil')} />
            <TextField multiline minRows={3} label="Note (internal)" value={form.note} onChange={setField('note')} />
          </Stack>
          <Stack direction="row" gap={4} justifyContent="flex-end">
            <Button color="inherit" onClick={reset}>Reset</Button>
            <Button type="submit" variant="contained" disabled={!form.shopName || !form.address || !form.ownerId}>Create shop</Button>
          </Stack>
        </Stack>
      </Paper>
      {submitted && (
        <Alert severity="success" variant="outlined" sx={{ mt: 4 }}>
          Mock created: {submitted.shopName} ({submitted.ownerId}{submitted.agentId ? `, agent ${submitted.agentId}` : ''}). Backend wiring happens in a later session.
        </Alert>
      )}
    </MarketplaceLayout>
  );
}

ShopCreate.propTypes = {
  onToggleTheme: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({ role: PropTypes.oneOf(['super', 'agent', 'owner', 'admin', 'cashier']), user_id: PropTypes.string }).isRequired,
};

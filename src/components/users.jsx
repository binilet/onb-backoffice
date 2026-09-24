import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { FilterAltOutlined, PhoneOutlined, SearchOutlined } from '@mui/icons-material';
import UsersTable from './grids/UsersTable';
import UserFormModal from './modals/userFormModal';

import { get_users_by_role_user, resetStatus } from '../state/slices/userSlice';
import { fetchCreditHistoriesByPhoneNumber } from '../state/slices/creditBalanceSlice';

const Users = () => {
  const dispatch = useDispatch();
  const _users = useSelector((state) => state.users.users);

  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const today = new Date().toISOString().slice(0, 10);
  const [filters, setFilters] = useState({ startDate: today, endDate: today, phone: '' });

  useEffect(() => {
    loadUsers();
  }, [dispatch]);

  const loadUsers = (showAll = false) => {
    const endOfSelectedDay = (date) => {
      const [year, month, day] = date.split('-').map(Number);
      return new Date(Date.UTC(year, month - 1, day + 1)).toISOString();
    };
    const phone = filters.phone.trim();
    const params = showAll ? { limit: 100000 } : phone ? { phone } : {
      startAt: `${filters.startDate}T00:00:00+03:00`,
      endAt: endOfSelectedDay(filters.endDate),
    };
    dispatch(get_users_by_role_user(params));
  };

  const filterPanel = (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, mb: 2, borderRadius: 3, bgcolor: 'background.paper' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
        <Box sx={{ minWidth: { md: 205 } }}>
          <Stack direction="row" spacing={1} alignItems="center"><FilterAltOutlined color="primary" fontSize="small" /><Typography fontWeight={700}>Find legacy users</Typography></Stack>
          <Typography variant="caption" color="text.secondary">Phone lookup uses a partial match and ignores dates.</Typography>
        </Box>
        <TextField size="small" label="From" type="date" value={filters.startDate} onChange={(event) => setFilters((value) => ({ ...value, startDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
        <TextField size="small" label="To" type="date" value={filters.endDate} onChange={(event) => setFilters((value) => ({ ...value, endDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
        <TextField size="small" label="Phone number" value={filters.phone} onChange={(event) => setFilters((value) => ({ ...value, phone: event.target.value }))} InputProps={{ startAdornment: <PhoneOutlined fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }} sx={{ minWidth: { md: 220 }, flex: 1 }} />
        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<SearchOutlined />} onClick={() => loadUsers()}>Search</Button>
          <Button variant="outlined" onClick={() => loadUsers(true)}>Show all</Button>
        </Stack>
      </Stack>
    </Paper>
  );

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingUser(null);
  };

  const handleEdit = (user) => {
    dispatch(resetStatus());
    setEditingUser(user);
    setOpenModal(true);
  };

  const handleTransactionhistory = async (user) => {
    await dispatch(fetchCreditHistoriesByPhoneNumber({ phone: user?.phone }));
  };

  return (
    <Box>
      <UsersTable users={_users} handleEdit={handleEdit} handleTransactionhistory={handleTransactionhistory} filterPanel={filterPanel} />
      <UserFormModal
        openModal={openModal}
        handleCloseModal={handleCloseModal}
        editingUser={editingUser}
      />
    </Box>
  );
};

export default Users;

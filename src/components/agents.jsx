import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import UsersTable from './grids/UsersTable';
import UserFormModal from './modals/userFormModal';
import { get_users_by_role_agent, resetStatus } from '../state/slices/userSlice';
import { fetchCreditHistoriesByPhoneNumber } from '../state/slices/creditBalanceSlice';

const Agents = () => {
  const dispatch = useDispatch();
  const _users = useSelector((state) => state.users.agents);

  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    dispatch(get_users_by_role_agent());
  }, [dispatch]);

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
      <UsersTable users={_users} handleEdit={handleEdit} handleTransactionhistory={handleTransactionhistory} />
      <UserFormModal
        openModal={openModal}
        handleCloseModal={handleCloseModal}
        editingUser={editingUser}
      />
    </Box>
  );
};

export default Agents;

import React, { useState,useEffect } from 'react';
import {
  Box, Typography,
   useMediaQuery, useTheme,
} from '@mui/material';
import UsersTable from './grids/UsersTable';
import UserFormModal from './modals/userFormModal';
import { get_users_by_role_agent,resetStatus } from '../state/slices/userSlice';
import { useSelector,useDispatch } from 'react-redux';

const Agents = () => {
  const dispatch = useDispatch();
  const _users = useSelector((state) => state.users.agents);
  const [users, setUsers] = useState(_users);
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [newUser, setNewUser] = useState({
    username: '',
    phone: '',
    role: '',
    isActive: true,
    owner: '',
    remark: '',
  });

   useEffect(()=>{
      dispatch(get_users_by_role_agent());
    },[])

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingUser(null);
    setNewUser({
      username: '',
      phone: '',
      role: '',
      isActive: true,
      owner: '',
      remark: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };


  const handleEdit = (user) => {
    dispatch(resetStatus())
    setEditingUser(user);
    setNewUser(user);
    setOpenModal(true);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{mb: 3, textAlign: 'center' }}>
        Agents Management
      </Typography>

      <UsersTable users={_users} handleEdit={handleEdit} />

      <UserFormModal openModal={openModal}
                    handleCloseModal={handleCloseModal}
                    editingUser={editingUser}
                    isMobile={isMobile}
                    />
                        
    </Box>
  );
};

export default Agents;

// Users.jsx
import React,{useState,useEffect} from 'react';
import { useSelector,useDispatch } from 'react-redux';
import { Box, Typography,useTheme,useMediaQuery } from '@mui/material';
import UsersTable from './grids/UsersTable';
import UserFormModal from './modals/userFormModal';
// import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

import { get_users_by_role_user,resetStatus } from '../state/slices/userSlice';

const Users = () => {
  
  const dispatch = useDispatch();
  const _users = useSelector((state) => state.users.users);
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  

  useEffect(()=>{
    dispatch(get_users_by_role_user());
  },[])

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingUser(null);

  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleEdit = async(user) => {
    dispatch(resetStatus())
    await setEditingUser(user);
    setOpenModal(true);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
        Users Management
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

export default Users;

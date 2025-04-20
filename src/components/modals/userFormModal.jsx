import { Modal, Box,Grid, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Switch, InputAdornment, IconButton } from '@mui/material';
  import PersonIcon from '@mui/icons-material/Person';
  import PhoneIcon from '@mui/icons-material/Phone';
  import ContentCutIcon from '@mui/icons-material/ContentCut';
  import NoteIcon from '@mui/icons-material/Note';
  import React, { useEffect } from 'react';
  import { useDispatch, useSelector } from 'react-redux';
  import { updateUser } from '../../state/slices/userSlice';

  const UserFormModal = ({ openModal, handleCloseModal,editingUser, isMobile}) => {
    const dispatch = useDispatch();
    
    const [id, setId] = React.useState(editingUser? editingUser._id : '');
    const [agent_id, setAgentId] = React.useState(editingUser? editingUser.agent_id : '');
    const [agent_percent, setAgentPercent] = React.useState(editingUser? editingUser.agent_percent : '');
    const [verified, setVerified] = React.useState(editingUser? editingUser.verified : false);
    const [isActive, setIsActive] = React.useState(editingUser? editingUser.is_active : false);
    const [role, setRole] = React.useState(editingUser? editingUser.role : 'user');
    const [username, setUsername] = React.useState(editingUser? editingUser.username : '');
    const [phone, setPhone] = React.useState(
      editingUser ? editingUser.username : ""
    );
    const [ban_until, setBanUntil] = React.useState(
      editingUser ? editingUser.ban_until : ""
    );

    useEffect(()=>{
      if(editingUser){
        setId(editingUser._id);
        setAgentPercent(editingUser.agent_percent);
        setVerified(editingUser.verified);
        setIsActive(editingUser.is_active);
        setRole(editingUser.role);
        setUsername(editingUser.username);
        setPhone(editingUser.phone);
        setBanUntil(editingUser.ban_until);
        setAgentId(editingUser.agent_id);
      }else{
        setId('');
        setAgentPercent('');
        setVerified(false);
        setIsActive(false);
        setRole('');
        setUsername('');
        setPhone('');
        setBanUntil('');
        setAgentId('');
      } 
      setStatus(null);
    },[editingUser]);

    const _update_status = useSelector((state) => state.users.update_status);
    const _error = useSelector((state) => state.users.error);

    const [status, setStatus] = React.useState(null);

    const handleSubmit = async () => {
      if(!id){
        setStatus("Id not set. please refresh the page and try again.");
        return;
      }

      if(!role){
        setStatus("Please select a role");
        return;
      }

      const userData = {
        agent_percent,
        verified,
        isActive,
        role,
        username,
        phone,
        ban_until,
        agent_id,
      };
  
      if (editingUser) {
        // Update existing user
        await dispatch(updateUser({userId:editingUser._id, updates:userData}));
      }
      //handleCloseModal();
    }
  
    return (
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "95%" : 800,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 3,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h5" sx={{ mb: 3 }}>
            {editingUser ? `Edit User (${editingUser?._id})` : "Add New User"}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              name="username"
              label="User Name"
              fullWidth
              value={username}
              onChange={()=>setUsername(event.target.value)}
              readOnly
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />

            <TextField
              name="phone"
              label="Phone"
              fullWidth
              value={phone}
              onChange={()=>setPhone(event.target.value)}
              readOnly
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />

            <TextField
              name="cut"
              label="Cut"
              type="number"
              fullWidth
              value={agent_percent}
              onChange={()=>setAgentPercent(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ContentCutIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />

            <FormControl fullWidth>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                label="Role"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="agent">agent</MenuItem>
                <MenuItem value="user">user</MenuItem>
                {/* <MenuItem value="admin">Admin</MenuItem> */}
              </Select>
            </FormControl>

            <TextField
              name="banUntil"
              label="Ban Until"
              type="date"
              fullWidth
              value={
                ban_until
                  ? new Date(ban_until).toISOString().split("T")[0]
                  : ""
              }
              onChange={(event => setBanUntil(event.target.value))}
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>

          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Active
              </Typography>
              <Switch
                checked={isActive}
                onChange={()=>setIsActive(event.target.checked)}
                inputProps={{ "aria-label": "is_active" }}
                name="is_active"
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Verified
              </Typography>
              <Switch
                checked={verified}
                onChange={()=>setVerified(event.target.checked)}
                inputProps={{ "aria-label": "verified" }}
                name="verified"
              />
            </Grid>
          </Grid>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            sx={{ mt: 3 }}
          >
            {editingUser ? "Save Changes" : "Add Agent"}
          </Button>
          {_update_status && (
            <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
              {_update_status}
            </Typography>
          )}
          {_error && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {_error}
            </Typography>
          )}
          {status && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {status}
            </Typography>
          )}
        </Box>
      </Modal>
    );
  };
  
  export default UserFormModal;
  
import { Modal, CircularProgress, Box, Grid, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Switch, InputAdornment, IconButton, Autocomplete } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { generate_referral_link, updateUser } from '../../state/slices/userSlice';
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { numericFontFamily } from '../../../theme';
import { getBranches, getShops } from '../../marketplace/shopApi';

const UserFormModal = ({ openModal, handleCloseModal, editingUser, isMobile }) => {

  const dispatch = useDispatch();
  const [id, setId] = React.useState(editingUser ? editingUser._id : '');
  const [agent_id, setAgentId] = React.useState(editingUser ? editingUser.agentId : '');
  const [subagent_id, setSubagentId] = React.useState(editingUser?.subagentId || '');
  const [admin_id, setAdminId] = React.useState(editingUser ? editingUser.adminId : '');
  const [cutPercent, setCutPercent] = React.useState(editingUser ? editingUser.agentPercent : '');
  const [parentCutPercent, setParentCutPercent] = React.useState(editingUser ? editingUser.parentCutPercent || '' : '');
  const [verified, setVerified] = React.useState(editingUser ? editingUser.verified : false);
  const [isActive, setIsActive] = React.useState(editingUser ? editingUser.isActive : false);
  const [forShop, setForShop] = React.useState(editingUser ? editingUser.forShop : false);
  const [role, setRole] = React.useState(editingUser ? editingUser.role : 'user');
  const [username, setUsername] = React.useState(editingUser ? editingUser.username : '');
  const [phone, setPhone] = React.useState(
    editingUser ? editingUser.username : ""
  );
  const [ban_until, setBanUntil] = React.useState(
    editingUser ? editingUser.ban_until : ""
  );
  const [shopId, setShopId] = React.useState(editingUser?.shopId || '');
  const [branchId, setBranchId] = React.useState(editingUser?.branchId || '');
  const [shops, setShops] = React.useState([]);
  const [branches, setBranches] = React.useState([]);

  useEffect(() => {
    if (editingUser) {
      setId(editingUser._id);
      setCutPercent(editingUser.agentPercent);
      setParentCutPercent(editingUser.parentCutPercent || '');
      setVerified(editingUser.verified);
      setIsActive(editingUser.isActive);
      setForShop(Boolean(editingUser.forShop));
      setRole(editingUser.role);
      setUsername(editingUser.username);
      setPhone(editingUser.phone);
      setBanUntil(editingUser.banUntil);
      setAgentId(editingUser.agentId);
      setSubagentId(editingUser.subagentId || '');
      setAdminId(editingUser.adminId);
      setShopId(editingUser.shopId || '');
      setBranchId(editingUser.branchId || '');
    } else {
      setId('');
      setCutPercent('');
      setParentCutPercent('');
      setVerified(false);
      setIsActive(false);
      setForShop(false);
      setRole('');
      setUsername('');
      setPhone('');
      setBanUntil('');
      setAgentId('');
      setSubagentId('');
      setAdminId('');
      setShopId('');
      setBranchId('');
    }
    setStatus(null);
  }, [editingUser]);

  const _update_status = useSelector((state) => state.users.update_status);
  const _error = useSelector((state) => state.users.error);

  const _referal_link = useSelector((state) => state.users.referralUrl);
  const _referal_loading = useSelector((state) => state.users.referralUrlLoading);
  const _referal_error = useSelector((state) => state.users.referralUrlError);
  const current_user = useSelector((state) => state.auth._current_user || {});
  const [showFields, setShowFields] = React.useState(false);

  React.useEffect(() => {
    if (current_user && current_user.role) {
      if (current_user.role === 'system' || current_user.role === 'agent') {
        setShowFields(true);
      } else {
        setShowFields(false);
      }
    }
  }, [current_user]);

  React.useEffect(() => {
    if (!openModal || current_user.role !== 'system') return;
    Promise.all([getShops(), getBranches()])
      .then(([shopData, branchData]) => {
        setShops(shopData);
        setBranches(branchData);
      })
      .catch(() => setStatus('Unable to load Shop assignments.'));
  }, [current_user.role, openModal]);

  const [status, setStatus] = React.useState(null);
  const [copied, setCopied] = React.useState(false);

  const handleSubmit = async () => {
    if (!id) {
      setStatus("Id not set. please refresh the page and try again.");
      return;
    }
    if (!role) {
      setStatus("Please select a role");
      return;
    }
    if (role === 'cashier' && (!shopId || !branchId)) {
      setStatus('Select a Shop and branch for the cashier.');
      return;
    }

    let adminPercent = 0;
    let agentPercent = 0;

    if (role === 'admin') {
      adminPercent = cutPercent;
    } else if (role === 'agent') {
      agentPercent = cutPercent;
    }

    const userData = {
      agentPercent,
      parentCutPercent: ['agent', 'subagent', 'admin', 'cashier'].includes(role) ? Number(parentCutPercent) : null,
      verified,
      forShop,
      isActive,
      role,
      username,
      phone,
      ban_until,
      agentId: agent_id || undefined,
      subagentId: subagent_id || undefined,
      adminId: admin_id || undefined,
      ownerPhone: admin_id || subagent_id || agent_id || undefined,
      adminPercent,
      shopId: ['admin', 'cashier'].includes(role) ? shopId || null : null,
      branchId: role === 'cashier' ? branchId || null : null,
    };

    if (editingUser) {
      // Update existing user
      await dispatch(updateUser({ userId: editingUser._id, updates: userData }));
    }
    //handleCloseModal();
  }

  const handleGenerate = async () => {
    try {
      if (phone && phone.length > 0) {
        dispatch(generate_referral_link(phone));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleCopy = () => {
    if (_referal_link) {
      navigator.clipboard.writeText(_referal_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <Modal open={openModal} onClose={handleCloseModal} aria-labelledby="user-form-title">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: (theme) => isMobile ? `calc(100% - ${theme.spacing(6)})` : { xs: `calc(100% - ${theme.spacing(6)})`, md: '75%' },
          boxSizing: 'border-box',
          maxWidth: (theme) => theme.breakpoints.values.md,
          bgcolor: 'background.paper',
          color: 'text.primary',
          border: 1,
          borderColor: 'divider',
          boxShadow: 0,
          p: { xs: 3, sm: 5 },
          borderRadius: 2,
          maxHeight: '90dvh',
          overflowY: 'auto',
          overflowWrap: 'anywhere',
          '& input': { colorScheme: (theme) => theme.palette.mode },
          '& input[type="number"], & input[name*="phone"], & input[name*="Phone"]': { fontFamily: numericFontFamily, fontVariantNumeric: 'tabular-nums' },
          '& .MuiInputAdornment-root': { color: 'text.secondary' },
        }}
      >
        <Typography id="user-form-title" variant="h3" component="h2" sx={{ mb: 4, pb: 3, borderBottom: 1, borderColor: 'divider' }}>
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
            onChange={() => setUsername(event.target.value)}
            readOnly
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 0 }}
          />

          <TextField
            name="phone"
            label="Phone"
            fullWidth
            value={phone}
            onChange={(event) => {
              const input = event.target.value;
              // Allow only digits and max 10 characters
              if (/^\d{0,10}$/.test(input)) {
                setPhone(input);
              }
            }}
            readOnly
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 0 }}
          />

          {showFields && (
            <TextField
              name="agent phone"
              label="Agent Phone"
              fullWidth
              value={agent_id}
              //onChange={() => setAgentId(event.target.value)}
              onChange={(event) => {
                const input = event.target.value;
                // Allow only digits and max 10 characters
                if (/^\d{0,10}$/.test(input)) {
                  setAgentId(input);
                }
              }}
              disabled={current_user.role === "agent"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 0 }}
            />
          )}

          <TextField
            name="adminPhone"
            label="Admin Phone"
            fullWidth
            value={admin_id}
            onChange={(event) => {
              const input = event.target.value;
              // Allow only digits and max 10 characters
              if (/^\d{0,10}$/.test(input)) {
                setAdminId(input);
              }
            }}
            inputProps={{ maxLength: 10 }}
            disabled={current_user.role === "admin"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 0 }}
          />

          {showFields && (
            <TextField
              name="cut"
              label="Cut"
              type="number"
              fullWidth
              value={cutPercent}
              onChange={() => setCutPercent(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ContentCutIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 0 }}
            />
          )}

          <FormControl fullWidth>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={role}
              onChange={(event) => {
                const nextRole = event.target.value;
                setRole(nextRole);
                if (!['admin', 'cashier'].includes(nextRole)) setShopId('');
                if (nextRole !== 'cashier') setBranchId('');
              }}
              label="Role"
              sx={{ borderRadius: 2 }}
            >
              {current_user.role === "system" && <MenuItem value="agent">agent</MenuItem>}
              {current_user.role === "system" && <MenuItem value="subagent">subagent</MenuItem>}
              {current_user.role === "system" && <MenuItem value="admin">admin</MenuItem>}
              {current_user.role === "system" && <MenuItem value="cashier">cashier</MenuItem>}
              {current_user.role === "system" && <MenuItem value="employee">employee</MenuItem>}
              <MenuItem value="user">user</MenuItem>
              {/* <MenuItem value="admin">Admin</MenuItem> */}
            </Select>
          </FormControl>

          {current_user.role === 'system' && ['admin', 'cashier'].includes(role) && (
            <Autocomplete
              options={shops}
              value={shops.find((shop) => shop.shop_id === shopId) || null}
              onChange={(_, shop) => {
                setShopId(shop?.shop_id || '');
                setBranchId('');
              }}
              getOptionLabel={(shop) => `${shop.shopName} · ${shop.shop_id}`}
              isOptionEqualToValue={(option, value) => option.shop_id === value.shop_id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required={role === 'cashier'}
                  label="Shop"
                  placeholder="Search by Shop name or ID"
                />
              )}
            />
          )}

          {current_user.role === "system" && (
            <TextField
              name="subagentPhone"
              label="Subagent Phone"
              fullWidth
              value={subagent_id}
              onChange={(event) => {
                const input = event.target.value;
                if (/^\d{0,10}$/.test(input)) setSubagentId(input);
              }}
              inputProps={{ maxLength: 10 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 0 }}
            />
          )}

          {current_user.role === "system" && ['agent', 'subagent', 'admin', 'cashier'].includes(role) && (
            <TextField
              required
              name="parentCutPercent"
              label="Assigned cut percent"
              type="number"
              inputProps={{ min: 0.000001, step: "any" }}
              fullWidth
              value={parentCutPercent}
              onChange={(event) => setParentCutPercent(event.target.value)}
              sx={{ minWidth: 0 }}
            />
          )}

          {current_user.role === 'system' && role === 'cashier' && (
            <TextField
              required
              select
              label="Branch"
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
              disabled={!shopId}
            >
              {branches
                .filter((branch) => branch.shopId === shopId)
                .map((branch) => (
                  <MenuItem key={branch.branch_id} value={branch.branch_id}>
                    {branch.branchName}
                  </MenuItem>
                ))}
            </TextField>
          )}

          <TextField
            name="banUntil"
            label="Ban Until"
            type="date"
            fullWidth
            value={
              ban_until ? new Date(ban_until).toISOString().split("T")[0] : ""
            }
            onChange={(event) => setBanUntil(event.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 0 }}
          />

          <Box display="flex" flexDirection="column" gap={1} maxWidth={400}>
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                size="small"
                onClick={handleGenerate}
                disabled={_referal_loading}
                sx={{ borderRadius: 2, minWidth: 120 }}
              >
                {_referal_loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  "Generate Invite Link"
                )}
              </Button>
              {_referal_error && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{ alignSelf: "center" }}
                >
                  {_referal_error}
                </Typography>
              )}
            </Box>

            {_referal_link && (
              <TextField
                size="small"
                value={_referal_link}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleCopy}
                        edge="end"
                        size="small"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  minWidth: 0,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            )}

            {copied && (
              <Typography variant="caption" color="primary">
                Copied to clipboard!
              </Typography>
            )}
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mt: 3 }}>
          {current_user.role === "system" && <Grid item xs={6}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Active
            </Typography>
            <Switch
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              inputProps={{ "aria-label": "isActive" }}
              name="isActive"
            />
          </Grid>
          }
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Verified
            </Typography>
            <Switch
              checked={verified}
              onChange={(event) => setVerified(event.target.checked)}
              inputProps={{ "aria-label": "verified" }}
              name="verified"
            />
          </Grid>
          {current_user.role === "system" && <Grid item xs={6}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Shop staff
            </Typography>
            <Switch
              checked={forShop}
              onChange={(event) => setForShop(event.target.checked)}
              inputProps={{ "aria-label": "forShop" }}
              name="forShop"
            />
          </Grid>}

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

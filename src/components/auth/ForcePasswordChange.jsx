import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import { changePassword, fetchUserInfo } from '../../state/slices/authSlice';

export default function ForcePasswordChange() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth._current_user);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('The new password and confirmation do not match.');
      return;
    }
    setSaving(true);
    setError('');
    const result = await dispatch(changePassword({ currentPassword, newPassword }));
    if (changePassword.fulfilled.match(result)) {
      await dispatch(fetchUserInfo());
      navigate(user?.role === 'employee' ? '/hagere-invite' : '/', { replace: true });
    } else {
      setError(result.payload || 'Unable to change password.');
    }
    setSaving(false);
  };

  return <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', px: 4 }}><Container maxWidth="sm" sx={{ px: 0 }}><Paper variant="outlined" sx={{ p: 6 }}><Stack gap={4} component="form" onSubmit={submit}><Box><Typography variant="h3">Set your password</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Your temporary password must be replaced before you can access the dashboard.</Typography></Box>{error && <Alert severity="error" variant="outlined">{error}</Alert>}<TextField required autoFocus label="Current temporary password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /><TextField required label="New password" type="password" helperText="At least 6 characters" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /><TextField required label="Confirm new password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /><Button type="submit" variant="contained" disabled={saving || newPassword.length < 6 || !currentPassword || newPassword !== confirmPassword}>{saving ? 'Saving…' : 'Change password'}</Button></Stack></Paper></Container></Box>;
}

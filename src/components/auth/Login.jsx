import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, fetchUserInfo } from '../../state/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Divider,
  InputAdornment,
  IconButton,
  Container,
  Alert,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Phone as PhoneIcon,
  LockOutlined as LockIcon,
} from '@mui/icons-material';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      return alert('Please enter both phone number and password.');
    }
    const result = await dispatch(loginUser({ phone, password: password.trim() }));
    if (loginUser.fulfilled.match(result)) {
      const userAction = await dispatch(fetchUserInfo());
      if (fetchUserInfo.fulfilled.match(userAction)) {
        const user = userAction.payload;
        if (user.role === 'employee') {
          navigate('/hagere-invite');
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 4,
      }}
    >
      <Container maxWidth="sm" sx={{ px: 0 }}>
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography variant="h2" fontWeight={700} color="text.primary">
            Hagere Online
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Admin console — sign in to continue
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            width: '100%',
            p: 6,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ mb: 5 }}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Sign in
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Use your registered phone number and password.
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <TextField
            label="Phone number"
            fullWidth
            variant="outlined"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon sx={{ color: 'text.secondary', fontSize: '1.125rem' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: 'text.secondary', fontSize: '1.125rem' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                    size="small"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {error && (
            <Alert severity="error" variant="outlined" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            fullWidth
            disableElevation
            sx={{ mt: 4, py: 1.5, fontSize: '0.9375rem' }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign in'}
          </Button>
        </Paper>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 4 }}
        >
          Hagere Online admin console · Authorized personnel only
        </Typography>
      </Container>
    </Box>
  );
}

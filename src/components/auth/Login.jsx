import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser,fetchUserInfo } from '../../state/slices/authSlice';
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
  alpha,
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
    const result = await dispatch(loginUser({ phone, password:password.trim() }));
    if (loginUser.fulfilled.match(result)) {
      await dispatch(fetchUserInfo());
      navigate('/');
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        px={2}
         width="100%"
      >
        <Paper
          elevation={6}
          sx={{
            width: '100%',
            p: 4,
            borderRadius: 2,
            background: 'linear-gradient(145deg, #ffffff 0%, #f7fbff 100%)',
            border: '1px solid',
            borderColor: alpha('#2979ff', 0.1),
            boxShadow: `0 12px 28px ${alpha('#2979ff', 0.1)}`
          }}
        >
          <Box mb={4} textAlign="center">
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ 
                color: '#1565c0',
                mb: 1,
                letterSpacing: '-0.5px'
              }}
            >
              Hagere Games
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your account to continue
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 4, borderColor: alpha('#2979ff', 0.1) }} />
          
          <TextField
            label="Phone Number"
            fullWidth
            margin="normal"
            variant="outlined"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon sx={{ color: '#2979ff' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#2979ff',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2979ff',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#2979ff',
              },
            }}
          />
          
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#2979ff' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#2979ff',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2979ff',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#2979ff',
              },
            }}
          />
          
          {error && (
            <Typography 
              color="error" 
              variant="body2" 
              mt={1} 
              mb={2}
              textAlign="center"
              bgcolor={alpha('#f44336', 0.1)}
              p={1}
              borderRadius={1}
            >
              {error}
            </Typography>
          )}
          
          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: '10px',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              background: 'linear-gradient(90deg, #2979ff 0%, #1565c0 100%)',
              boxShadow: `0 4px 12px ${alpha('#2979ff', 0.4)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: `0 6px 16px ${alpha('#2979ff', 0.6)}`,
                transform: 'translateY(-2px)',
              }
            }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>
          
          {/* <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Typography
                component="span"
                variant="body2"
                sx={{
                  color: '#2979ff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
                onClick={() => navigate('/register')}
              >
                Sign up
              </Typography>
            </Typography>
          </Box> */}
        </Paper>
      </Box>
    </Container>
  );
}
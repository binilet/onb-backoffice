import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, fetchUserInfo } from '../../state/slices/authSlice';
import { useLocation, useNavigate } from 'react-router-dom';
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
  FormControl,
  MenuItem,
  Select,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Phone as PhoneIcon,
  LockOutlined as LockIcon,
  TranslateOutlined,
} from '@mui/icons-material';
import { languageOptions, useLanguage } from '../../i18n';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const sessionExpired = new URLSearchParams(location.search).get('expired') === '1';
  const from = location.state?.from;
  const returnTo = from?.pathname && from.pathname !== '/login' ? `${from.pathname}${from.search || ''}` : '/';
  const { language, setLanguage, t } = useLanguage();

  const handleLogin = async () => {
    if (!phone || !password) {
      return alert(t('requiredCredentials'));
    }
    const result = await dispatch(loginUser({ phone, password: password.trim() }));
    if (loginUser.fulfilled.match(result)) {
      const userAction = await dispatch(fetchUserInfo());
      if (fetchUserInfo.fulfilled.match(userAction)) {
        const user = userAction.payload;
        if (user.mustChangePassword) {
          navigate('/change-password');
        } else if (user.role === 'employee') {
          navigate('/hagere-invite');
        } else {
          navigate(returnTo, { replace: true });
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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 148 }}>
            <Select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              aria-label={t('language')}
              startAdornment={<TranslateOutlined fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              {languageOptions.map((option) => (
                <MenuItem key={option.code} value={option.code}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography variant="h2" fontWeight={700} color="text.primary">
            {t('hagereOnline')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {t('adminConsole')}
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
              {t('signIn')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {t('signInHelp')}
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {sessionExpired && <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>{t('expired')}</Alert>}

          <TextField
            label={t('phoneNumber')}
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
            label={t('password')}
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
                    aria-label={showPassword ? t('hidePassword') : t('showPassword')}
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
            {loading ? <CircularProgress size={20} color="inherit" /> : t('signIn')}
          </Button>
        </Paper>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 4 }}
        >
          {t('authorizedOnly')}
        </Typography>
      </Container>
    </Box>
  );
}

import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import SendIcon from '@mui/icons-material/Send';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PhoneIcon from '@mui/icons-material/Phone';
import MessageIcon from '@mui/icons-material/Message';

import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { sendHagereInvite } from '../state/slices/userSlice';

const HagereOnlineInvite = () => {
  const dispatch = useDispatch();

  const smsMessage = useSelector(state => state.users.smsMessage);
  const smsSending = useSelector(state => state.users.isSmsSending);
  const current_user = useSelector((state) => state.auth._current_user || {});

  const [phone, setPhone] = useState('');
  const [copied, setCopied] = useState(false);
  const invite = 'ሃገሬ ቢንጎን ተቀላቅለው አጓጊ ሽልማቶችን ያሸንፉ፡ [https://hagere-online.com/signup?ref==xxyy4534kdfysfsfs=]';

  const handleSendInvite = async () => {
    if (!phone) {
      alert('እባክዎ የስልክ ቁጥሩን ይሙሉ።');
      return;
    }

    await dispatch(sendHagereInvite({ phone: phone, sender: current_user?.phone }));
    setPhone('');
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(invite);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        //background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 480,
          width: '100%',
          borderRadius: 4,
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2065d1 0%, #1976d2 100%)',
            p: 3,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: 100,
              height: 100,
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              transform: 'translate(30px, -30px)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <CasinoIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                ሃገሬ ኦንላይን
              </Typography>
              <Chip
                label="የኮሚሽን ድርሻ"
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </Box>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.5 }}>
            ተጫዋቾችን ጋብዘው የኮሚሽን ተካፋይ ይሁኑ!
          </Typography>
        </Box>

        {/* Content Section */}
        <Box sx={{ p: 3 }}>
          {/* Phone Input Card */}
          <Card
            elevation={0}
            sx={{
              mb: 3,
              border: '1px solid rgba(32, 101, 209, 0.1)',
              borderRadius: 2,
              background: 'rgba(32, 101, 209, 0.02)',
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon sx={{ color: '#2065d1', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2065d1' }}>
                  የስልክ ቁጥር
                </Typography>
              </Box>
              <TextField
                fullWidth
                variant="outlined"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="912345678"
                type="tel"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2065d1',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2065d1',
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Message Preview Card */}
          <Card
            elevation={0}
            sx={{
              mb: 3,
              border: '1px solid rgba(25, 118, 210, 0.1)',
              borderRadius: 2,
              background: 'rgba(25, 118, 210, 0.02)',
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MessageIcon sx={{ color: '#1976d2', mr: 1, fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                    የግብዣ መልእክት
                  </Typography>
                </Box>
                <Tooltip title={copied ? 'ተቀድቷል!' : 'መልእክቱን ቅዳ'}>
                  <IconButton
                    size="small"
                    onClick={handleCopyMessage}
                    sx={{
                      color: copied ? 'success.main' : '#1976d2',
                      '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' },
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.5,
                  p: 2,
                  bgcolor: 'rgba(0, 0, 0, 0.03)',
                  borderRadius: 1.5,
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                }}
              >
                {invite}
              </Typography>
            </CardContent>
          </Card>

          {/* Send Button */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleSendInvite}
            disabled={!phone || smsSending}
            sx={{
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #2065d1 0%, #1976d2 100%)',
              boxShadow: '0 4px 12px rgba(32, 101, 209, 0.3)',
              fontWeight: 700,
              fontSize: '1rem',
              '&:hover': {
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                boxShadow: '0 6px 16px rgba(32, 101, 209, 0.4)',
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
                boxShadow: 'none',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {smsSending ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                እየላከ ነው...
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SendIcon />
                ግብዣ ላክ
              </Box>
            )}
          </Button>

          {/* Status Messages */}
          {smsMessage && (
            <Alert
              severity="success"
              sx={{
                mt: 2,
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontWeight: 500,
                },
              }}
            >
              {smsMessage}
            </Alert>
          )}

          {copied && (
            <Alert
              severity="info"
              sx={{
                mt: 2,
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontWeight: 500,
                },
              }}
            >
              መልእክቱ ተቀድቷል! አሁን በሌላ መተግበሪያ ውስጥ መለጠፍ ይችላሉ።
            </Alert>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: 3,
            pb: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
            ለበለጠ መረጃ ወደ ሃገሬ ኦንላይን ይሂዱ
          </Typography>
          <Button
            variant="text"
            size="small"
            href="https://hagere-online.com"
            target="_blank"
            sx={{
              color: '#2065d1',
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': {
                bgcolor: 'rgba(32, 101, 209, 0.05)',
              },
            }}
          >
            hagere-online.com
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default HagereOnlineInvite;
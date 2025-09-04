import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import SendIcon from '@mui/icons-material/Send';

import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { sendHagereInvite } from '../state/slices/userSlice';


const HagereOnlineInvite = () => {
    const dispatch = useDispatch();

    const smsMessage = useSelector(state => state.users.smsMessage);
    const smsSending = useSelector(state => state.users.isSmsSending);
    const current_user = useSelector((state) => state.auth._current_user || {});

    const [phone, setPhone] = useState('');
    const [invite, setInvite] = useState('ሃገሬ ቢንጎን ተቀላቅለው አጓጊ ሽልማቶችን ያሸንፉ፡ [https://hagere-online.com/signup?ref==xxyy4534kdfysfsfs=]');

    const handleSendInvite = async () => {
        // Implement invite sending logic here
        //alert(`Invite sent to ${phone} with message: "${invite}"`);
        setPhone('');

        if(!phone ){
            alert('Please fill in both phone number and invite message.');
            return;
        }

        //dispatch({ type: 'companies/setSmsSending', payload: true });
        await dispatch(sendHagereInvite({ phone:phone,sender:current_user?.phone }));

    };

    return (
        <Box
            sx={{
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f7fafc',
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    p: 4,
                    maxWidth: 400,
                    width: '100%',
                    borderRadius: 3,
                    bgcolor: '#ffffffff',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CasinoIcon sx={{ color: '#2065d1', fontSize: 40, mr: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2065d1' }}>
                        <a href="https://hagere-online.com" target="_blank">ሃገሬ ኦንላይን</a>
                    </Typography>
                </Box>
                <Typography variant="h6" sx={{ mb: 3, color: '#2065d1' }}>
                    ወደ ሃገሬ ኦንላይን ተጫዋቾችን እየጋብዙ የኮሚሽን ተካፋይ ይሁኑ !
                </Typography>
                <TextField
                    label="ስልክ ቁጥር"
                    variant="outlined"
                    fullWidth
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    sx={{ mb: 2 }}
                    type="tel"
                    placeholder="912345678"
                />
                <TextField
                    label="መልእክት "
                    variant="outlined"
                    fullWidth
                    value={invite}
                    onChange={e => setInvite(e.target.value)}
                    sx={{ mb: 3 }}
                    multiline
                    rows={3}
                    //placeholder="Type your bingo invite..."
                    disabled={true}
                />
                <Button
                    variant="contained"
                    color="success"
                    endIcon={<SendIcon />}
                    fullWidth
                    onClick={handleSendInvite}
                    //disabled={!phone || !invite}
                    sx={{
                        fontWeight: 'bold',
                        bgcolor: '#2065d1',
                        '&:hover': { bgcolor: '#2065d1' },
                        color: '#ffffff',
                    }}
                >
                    Send Invite
                </Button>
                {smsSending && (
                    <Typography variant="body2" sx={{ mt: 2, color: 'green' }}>
                        {'sending sms...'}
                    </Typography>
                )}
                {smsMessage && (
                    <Typography variant="body2" sx={{ mt: 2, color: 'green' }}>
                        {smsMessage}
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default HagereOnlineInvite;
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

const ErrorModal = ({ open, onClose, message }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{ 
        style: { 
          borderRadius: '12px', 
          padding: '10px', 
          minWidth: '350px' 
        } 
      }}
    >
      <DialogTitle
        style={{
          backgroundColor: '#d32f2f',
          color: '#fff',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <WarningIcon />
        Error
      </DialogTitle>
      <DialogContent style={{ padding: '20px' }}>
        <Typography align="center" style={{ marginTop: '10px' }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'center', paddingBottom: '20px' }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="error"
          style={{
            borderRadius: '20px',
            fontWeight: 'bold',
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorModal;
// src/components/NotFoundPage.js (or your preferred location)
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // Using a Material UI icon

const NotFoundPage = () => {
  return (
    <Container component="main" maxWidth="sm" display="flex"
    justifyContent="center"
    alignItems="center">
      <Box
        sx={{
          minHeight: '90vh', // Use minHeight to ensure it takes at least the viewport height
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          py: 4, // Add some vertical padding
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 80, mb: 2, color: 'warning.main' }} />

        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          404
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          color="text.secondary"
        >
          Oops! Page Not Found.
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Sorry, we couldn't find the page you were looking for. It might have
          been removed, had its name changed, or is temporarily unavailable.
        </Typography>

        <Button
          component={RouterLink} // Use RouterLink for client-side navigation
          to="/" // Link to the dashboard/home page
          variant="contained"
          size="large"
        >
          Go to Homepage
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
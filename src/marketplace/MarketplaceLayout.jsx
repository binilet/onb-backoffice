import { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Stack, Typography } from '@mui/material';

export default function MarketplaceLayout({ title, subtitle, scopeLabel, children }) {
  const [noticeOpen, setNoticeOpen] = useState(true);

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack gap={2} sx={{ mb: 6 }}>
        <Typography variant="caption" color="text.secondary">Marketplace · Development preview</Typography>
        <Typography component="h1" variant="h1">{title}</Typography>
        <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
      </Stack>
      {noticeOpen && (
        <Alert severity="info" variant="outlined" onClose={() => setNoticeOpen(false)} sx={{ mb: 4 }}>
          Mock {scopeLabel}. No live data or marketplace authorization is connected.
        </Alert>
      )}
      {children}
    </Box>
  );
}

MarketplaceLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  scopeLabel: PropTypes.string.isRequired,
  children: PropTypes.node,
};

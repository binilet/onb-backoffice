import { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Stack, Typography } from '@mui/material';

export default function MarketplaceLayout({ title, subtitle, showPreviewNotice = true, children }) {
  const [noticeOpen, setNoticeOpen] = useState(true);

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack gap={2} sx={{ mb: 6 }}>
        <Typography variant="caption" color="text.secondary">Hagere Shops</Typography>
        <Typography component="h1" variant="h1">{title}</Typography>
        <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
      </Stack>
      {showPreviewNotice && noticeOpen && (
        <Alert severity="info" variant="outlined" onClose={() => setNoticeOpen(false)} sx={{ mb: 4 }}>
          This area only shows data and actions available to your shop role.
        </Alert>
      )}
      {children}
    </Box>
  );
}

MarketplaceLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  showPreviewNotice: PropTypes.bool,
  children: PropTypes.node,
};

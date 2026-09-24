import { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Stack, Typography } from '@mui/material';
import { useLanguage } from '../i18n';

export default function MarketplaceLayout({ title, subtitle, showPreviewNotice = true, children }) {
  const [noticeOpen, setNoticeOpen] = useState(true);
  const { t } = useLanguage();
  const titleKeys = {
    Shops: 'shops',
    Staff: 'staff',
    'Shop balance': 'shopBalance',
    'Player room wallets': 'playerRoomWallets',
    Games: 'games',
    'Action log': 'actionLog',
  };

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack gap={2} sx={{ mb: 6 }}>
        <Typography variant="caption" color="text.secondary">{t('hagereShops')}</Typography>
        <Typography component="h1" variant="h1">{t(titleKeys[title] || title)}</Typography>
        <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
      </Stack>
      {showPreviewNotice && noticeOpen && (
        <Alert severity="info" variant="outlined" onClose={() => setNoticeOpen(false)} sx={{ mb: 4 }}>
          {t('shopRoleNotice')}
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

import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import LinkOutlined from '@mui/icons-material/LinkOutlined';
import LinkOffOutlined from '@mui/icons-material/LinkOffOutlined';
import SendOutlined from '@mui/icons-material/SendOutlined';
import { numericFontFamily } from '../../theme';
import { createShopTelegramLinkCode, getShopTelegram, sendShopTelegramTest, unlinkShopTelegram } from '../marketplace/shopApi';

const TARGETS = [
  { key: 'general', label: "Players' chat", where: 'Your players channel or group', posts: 'New games, winners and cancelled games' },
  { key: 'deposits', label: 'Deposits', where: 'The "Deposits" topic of your private staff group', posts: 'Every deposit request and its result' },
  { key: 'withdrawals', label: 'Withdrawals', where: 'The "Withdrawals" topic of your private staff group', posts: 'Every withdrawal request and its result' },
];
const time = new Intl.DateTimeFormat('en', { timeStyle: 'short', timeZone: 'Africa/Addis_Ababa' });
const apiError = (error, fallback) => error.response?.data?.detail || fallback;

function TargetStatus({ target }) {
  if (!target) return <Chip size="small" variant="outlined" label="Not linked" />;
  if (target.status === 'BROKEN') return <Chip size="small" color="error" label="Disconnected" />;
  return <Chip size="small" color="success" label="Linked" />;
}
TargetStatus.propTypes = { target: PropTypes.object };

export default function ShopTelegramDialog({ shop, open, onClose }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  // The code currently shown, per target: { code, command, expiresAt }.
  const [codes, setCodes] = useState({});

  const load = useCallback(async (quiet = false) => {
    if (!shop || !open) return;
    if (!quiet) setLoading(true);
    try {
      setSettings(await getShopTelegram(shop.shop_id));
    } catch (requestError) {
      if (!quiet) setError(apiError(requestError, 'Unable to load Telegram settings.'));
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [open, shop]);

  useEffect(() => {
    setCodes({});
    setError('');
    setNotice('');
    load();
  }, [load]);

  // While a code is waiting to be used, watch for the link to appear.
  const waiting = Object.keys(codes).length > 0;
  useEffect(() => {
    if (!waiting) return undefined;
    const timer = setInterval(() => load(true), 4000);
    return () => clearInterval(timer);
  }, [waiting, load]);

  // Drop a shown code once its destination becomes linked or it expires.
  useEffect(() => {
    setCodes((current) => {
      const next = Object.fromEntries(Object.entries(current).filter(([key, value]) =>
        new Date(value.expiresAt) > new Date() && (settings?.[key]?.linkedAt ?? null) === value.linkedBefore));
      return Object.keys(next).length === Object.keys(current).length ? current : next;
    });
  }, [settings]);

  const run = async (key, action) => {
    setBusy(key);
    setError('');
    setNotice('');
    try {
      await action();
    } catch (requestError) {
      setError(apiError(requestError, 'Something went wrong. Please try again.'));
    } finally {
      setBusy('');
    }
  };

  const getCode = (target) => run(`${target.key}:code`, async () => {
    const code = await createShopTelegramLinkCode(shop.shop_id, target.key);
    // linkedBefore lets us spot the new link without comparing server and browser clocks.
    setCodes((current) => ({ ...current, [target.key]: { ...code, linkedBefore: settings?.[target.key]?.linkedAt ?? null } }));
  });
  const sendTest = (target) => run(`${target.key}:test`, async () => {
    await sendShopTelegramTest(shop.shop_id, target.key);
    setNotice(`Test message queued for ${target.label}. It should arrive within a few seconds.`);
  });
  const unlink = (target) => run(`${target.key}:unlink`, async () => {
    setSettings(await unlinkShopTelegram(shop.shop_id, target.key));
    setNotice(`${target.label} unlinked.`);
  });
  const copy = async (text) => {
    await navigator.clipboard.writeText(text);
    setNotice(`Copied ${text}`);
  };

  const bot = settings?.botUsername ? `@${settings.botUsername}` : 'the notification bot';

  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle>{shop?.shopName} · Telegram notifications</DialogTitle>
    <DialogContent dividers>
      {error && <Alert severity="error" variant="outlined" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {notice && <Alert severity="success" variant="outlined" sx={{ mb: 3 }} onClose={() => setNotice('')}>{notice}</Alert>}
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>Setup</Typography>
        <Typography component="ol" variant="body2" color="text.secondary" sx={{ pl: 4, m: 0, '& li': { mb: 1 } }}>
          <li>Create a <b>private</b> staff group, turn on <b>Topics</b>, and add a &quot;Deposits&quot; and a &quot;Withdrawals&quot; topic. Keep players out of it: it shows their phone numbers and amounts.</li>
          <li>Create a channel or group for your players.</li>
          <li>Add {bot} to both. In a channel, make it an admin that can post messages.</li>
          <li>For each row below, press <b>Get code</b>, then send the command inside that chat or topic as a chat admin.</li>
        </Typography>
      </Paper>
      {loading ? <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress size={28} /></Stack> : (
        <Stack gap={3}>
          {TARGETS.map((target) => {
            const linked = settings?.[target.key];
            const code = codes[target.key];
            return <Paper key={target.key} variant="outlined" sx={{ p: 3 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2}>
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" gap={2}>
                    <Typography variant="subtitle1">{target.label}</Typography>
                    <TargetStatus target={linked} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{target.where} · {target.posts}</Typography>
                  {linked && <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {linked.chatTitle || 'Chat'} <Box component="span" sx={{ fontFamily: numericFontFamily, color: 'text.secondary' }}>({linked.chatId}{linked.threadId ? ` · topic ${linked.threadId}` : ''})</Box>
                  </Typography>}
                  {linked?.status === 'BROKEN' && <Typography variant="caption" color="error" display="block">{(linked.lastError || 'Telegram refused the last message').replace(/\.?$/, '.')} Fix the bot&apos;s access, then send a test or link again.</Typography>}
                </Box>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Button size="small" variant={linked ? 'outlined' : 'contained'} startIcon={<LinkOutlined />} disabled={Boolean(busy)} onClick={() => getCode(target)}>
                    {linked ? 'Relink' : 'Get code'}
                  </Button>
                  {linked && <Button size="small" variant="outlined" startIcon={<SendOutlined />} disabled={Boolean(busy)} onClick={() => sendTest(target)}>Send test</Button>}
                  {linked && <Button size="small" color="error" startIcon={<LinkOffOutlined />} disabled={Boolean(busy)} onClick={() => unlink(target)}>Unlink</Button>}
                </Stack>
              </Stack>
              {code && <Alert severity="info" variant="outlined" sx={{ mt: 3 }} icon={false}>
                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography variant="body2">Send this in {target.where.charAt(0).toLowerCase() + target.where.slice(1)}:</Typography>
                  <Box component="code" sx={{ fontFamily: numericFontFamily, fontWeight: 700, px: 1.5, py: 0.5, borderRadius: 1, bgcolor: 'action.hover' }}>{code.command}</Box>
                  <Tooltip title="Copy command"><IconButton size="small" aria-label="Copy command" onClick={() => copy(code.command)}><ContentCopyOutlined sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                </Stack>
                <Typography variant="caption" color="text.secondary">Works once, until {time.format(new Date(code.expiresAt))}. This page updates when the bot confirms.</Typography>
              </Alert>}
            </Paper>;
          })}
        </Stack>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={() => load()} disabled={loading}>Refresh</Button>
      <Button variant="contained" onClick={onClose}>Done</Button>
    </DialogActions>
  </Dialog>;
}

ShopTelegramDialog.propTypes = {
  shop: PropTypes.shape({ shop_id: PropTypes.string, shopName: PropTypes.string }),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

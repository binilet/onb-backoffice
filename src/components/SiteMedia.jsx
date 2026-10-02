import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Paper, Slider, Stack, Switch, TextField, Typography } from '@mui/material';
import AddPhotoAlternateOutlined from '@mui/icons-material/AddPhotoAlternateOutlined';
import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import { useLanguage } from '../i18n';
import { deleteSiteMedia, getSiteMedia, resetSiteMedia, updateSiteMedia, uploadSiteMedia } from '../marketplace/shopApi';

const slots = ['auth_hero', 'signup_hero', 'home_hero', 'shop_hero'];
const MAX_SIZE = 2 * 1024 * 1024;
const errorMessage = (error, fallback) => {
  const detail = error.response?.data?.detail;
  return typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map(item => item.msg).join('. ') : fallback;
};

export default function SiteMedia() {
  const role = useSelector(state => state.auth._current_user?.role);
  const { t, language } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editor, setEditor] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await getSiteMedia()); }
    catch (e) { setError(errorMessage(e, t('media.loadError'))); }
    finally { setLoading(false); }
  }, [t]);
  useEffect(() => { if (role === 'system') load(); }, [load, role]);
  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const openEditor = (slot, item) => {
    setFile(null); setError('');
    setEditor(item ? { ...item, alt: { en: '', am: '', om: '', ...item.alt } } : { slot, alt: { en: '', am: '', om: '' }, focalX: 50, focalY: 50, activate: true });
  };
  const perform = async (operation, message = 'media.updated') => {
    setBusy(true); setError(''); setNotice('');
    try { await operation(); setNotice(t(message)); await load(); return true; }
    catch (e) { setError(errorMessage(e, t('media.saveError'))); return false; }
    finally { setBusy(false); }
  };
  const save = async () => {
    const ok = await perform(async () => {
      if (editor.id) {
        await updateSiteMedia(editor.id, { alt: editor.alt, focalX: editor.focalX, focalY: editor.focalY });
      } else {
        const payload = new FormData();
        payload.append('file', file); payload.append('slot', editor.slot);
        for (const lang of ['en', 'am', 'om']) payload.append(`alt_${lang}`, editor.alt[lang]);
        payload.append('focalX', editor.focalX); payload.append('focalY', editor.focalY);
        payload.append('activate', editor.activate);
        await uploadSiteMedia(payload);
      }
    });
    if (ok) { setEditor(null); setFile(null); }
  };
  const position = `${editor?.focalX ?? 50}% ${editor?.focalY ?? 50}%`;
  const source = preview || editor?.url;
  if (role !== 'system') return <Alert severity="info">{t('media.restricted')}</Alert>;

  return <Stack gap={2}>
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Typography variant="h5">{t('media.title')}</Typography>
      <Button size="small" startIcon={<RefreshOutlined />} disabled={loading || busy} onClick={load}>{t('media.refresh')}</Button>
    </Stack>
    {error && !editor && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
    {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}
    {loading && !items.length && <CircularProgress size={24} />}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
      {slots.map(slot => {
        const history = items.filter(item => item.slot === slot);
        const active = history.find(item => item.isActive);
        return <Paper key={slot} variant="outlined" sx={{ p: 2, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} mb={2} flexWrap="wrap">
            <Typography variant="subtitle1">{t(`media.${slot}`)}</Typography>
            <Chip size="small" variant="outlined" color={active ? 'success' : 'default'} label={t(active ? 'media.active' : 'media.default')} />
          </Stack>
          {active && <Box component="img" src={active.url} alt={active.alt?.[language] || active.alt?.en || ''} sx={{ width: '100%', height: 144, objectFit: 'cover', objectPosition: `${active.focalX}% ${active.focalY}%`, borderRadius: 1 }} />}
          <Stack direction="row" gap={1} flexWrap="wrap" my={1}>
            <Button size="small" variant="contained" startIcon={<AddPhotoAlternateOutlined />} disabled={busy} onClick={() => openEditor(slot)}>{t('media.upload')}</Button>
            {active && <Button size="small" disabled={busy} onClick={() => openEditor(slot, active)}>{t('media.edit')}</Button>}
            {active && <Button size="small" color="inherit" disabled={busy} onClick={() => perform(() => resetSiteMedia(slot))}>{t('media.reset')}</Button>}
          </Stack>
          <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreOutlined />} sx={{ px: 0 }}><Typography variant="body2">{t('media.history')} ({history.length})</Typography></AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              {!history.length && <Typography variant="caption" color="text.secondary">{t('media.noHistory')}</Typography>}
              <Stack gap={1}>{history.map(item => <Stack key={item.id} direction="row" gap={1.5} alignItems="center" sx={{ borderTop: 1, borderColor: 'divider', pt: 1 }}>
                <Box component="img" src={item.variants?.[0]?.url || item.url} alt="" loading="lazy" sx={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 1 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{item.originalName}</Typography>
                  <Typography variant="caption" color="text.secondary">{new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))} · {item.uploadedBy}</Typography>
                  <Stack direction="row" gap={0.5} flexWrap="wrap">
                    <Button size="small" disabled={busy} onClick={() => openEditor(slot, item)}>{t('media.edit')}</Button>
                    {!item.isActive && <Button size="small" disabled={busy} onClick={() => perform(() => updateSiteMedia(item.id, { isActive: true }))}>{t('media.activate')}</Button>}
                    {!item.isActive && <Button size="small" color="error" disabled={busy} onClick={() => setDeleting(item)}>{t('media.delete')}</Button>}
                  </Stack>
                </Box>
              </Stack>)}</Stack>
            </AccordionDetails>
          </Accordion>
        </Paper>;
      })}
    </Box>
    <Dialog open={Boolean(editor)} onClose={() => !busy && setEditor(null)} fullWidth maxWidth="md">
      <DialogTitle>{t(editor?.id ? 'media.edit' : 'media.upload')} · {editor && t(`media.${editor.slot}`)}</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {editor && <Stack gap={2}>
          {!editor.id && <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
            <Button component="label" variant="outlined" disabled={busy}>{t('media.choose')}
              <input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={event => {
                const selected = event.target.files?.[0]; event.target.value = '';
                if (!selected) return;
                if (selected.size > MAX_SIZE) { setError(t('media.tooLarge')); return; }
                setError(''); setFile(selected);
              }} />
            </Button>
            <Typography variant="caption" color="text.secondary">{file?.name || t('media.fileRule')}</Typography>
          </Stack>}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Stack gap={1}>
              {source && <Box sx={{ alignSelf: 'center', position: 'relative', maxWidth: '100%', width: 'fit-content' }}>
                <Box component="img" src={source} alt={t('media.focal')} onClick={event => {
                  if (busy) return;
                  const rect = event.currentTarget.getBoundingClientRect();
                  setEditor({ ...editor, focalX: Math.round((event.clientX - rect.left) / rect.width * 100), focalY: Math.round((event.clientY - rect.top) / rect.height * 100) });
                }} sx={{ display: 'block', maxWidth: '100%', maxHeight: 280, cursor: 'crosshair' }} />
                <Box sx={{ position: 'absolute', pointerEvents: 'none', left: `${editor.focalX}%`, top: `${editor.focalY}%`, transform: 'translate(-50%, -50%)', width: 18, height: 18, border: 2, borderColor: 'primary.main', bgcolor: 'background.paper', borderRadius: '50%' }} />
              </Box>}
              {['focalX', 'focalY'].map((key, index) => <Box key={key} sx={{ px: 1 }}>
                <Typography variant="caption">{t(index ? 'media.vertical' : 'media.horizontal')} · {editor[key]}%</Typography>
                <Slider size="small" disabled={busy} aria-label={t(index ? 'media.vertical' : 'media.horizontal')} min={0} max={100} value={editor[key]} onChange={(_, value) => setEditor({ ...editor, [key]: value })} />
              </Box>)}
              {['en', 'am', 'om'].map(lang => <TextField key={lang} size="small" label={t(`media.alt_${lang}`)} value={editor.alt[lang]} disabled={busy} inputProps={{ maxLength: 500 }} onChange={event => setEditor({ ...editor, alt: { ...editor.alt, [lang]: event.target.value } })} />)}
            </Stack>
            {source && <Stack gap={2}>
              {[false, true].map(desktop => <Box key={String(desktop)}>
                <Typography variant="caption" color="text.secondary">{t(desktop ? 'media.desktop' : 'media.phone')}</Typography>
                <Box component="img" src={source} alt="" sx={{ display: 'block', width: '100%', objectFit: 'cover', objectPosition: position, borderRadius: 1,
                  ...(editor.slot === 'home_hero' ? { aspectRatio: desktop ? '3 / 1' : '2 / 1' } : editor.slot === 'shop_hero' ? { aspectRatio: '3 / 1' } : desktop ? { height: 'auto', maxHeight: 270, objectFit: 'contain' } : { aspectRatio: '16 / 9' }) }} />
              </Box>)}
            </Stack>}
          </Box>
          {!editor.id && <FormControlLabel control={<Switch checked={editor.activate} disabled={busy} onChange={(_, checked) => setEditor({ ...editor, activate: checked })} />} label={t('media.activateAfterUpload')} />}
        </Stack>}
      </DialogContent>
      <DialogActions><Button disabled={busy} onClick={() => setEditor(null)}>{t('media.cancel')}</Button><Button variant="contained" disabled={busy || (!editor?.id && !file)} onClick={save}>{t(busy ? 'media.saving' : 'media.save')}</Button></DialogActions>
    </Dialog>
    <Dialog open={Boolean(deleting)} onClose={() => !busy && setDeleting(null)} maxWidth="xs" fullWidth>
      <DialogTitle>{t('media.deleteTitle')}</DialogTitle><DialogContent>{t('media.deleteBody')}</DialogContent>
      <DialogActions><Button disabled={busy} onClick={() => setDeleting(null)}>{t('media.cancel')}</Button><Button color="error" disabled={busy} onClick={async () => { if (await perform(() => deleteSiteMedia(deleting.id), 'media.removed')) setDeleting(null); }}>{t('media.delete')}</Button></DialogActions>
    </Dialog>
  </Stack>;
}

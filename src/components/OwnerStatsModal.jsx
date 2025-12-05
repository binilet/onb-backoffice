import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Divider,
    Chip
} from '@mui/material';
import {
    People as PeopleIcon,
    Person as PersonIcon,
    AdminPanelSettings as AdminIcon,
    SupportAgent as AgentIcon,
    HelpOutline as UnknownIcon,
    ErrorOutline as NotFoundIcon
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%', bgcolor: `${color}.lighter`, color: `${color}.darker` }}>
        <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
                        {title}
                    </Typography>
                    <Typography variant="h4">{value}</Typography>
                </Box>
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: `${color}.main`,
                        color: 'white',
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const OwnerStatsModal = ({ open, onClose, stats, loading }) => {
    if (!stats && !loading) return null;

    const {
        total_players = 0,
        found_users = 0,
        admins = {},
        agents = {},
        unowned = 0,
        not_found_in_users_db = 0
    } = stats || {};

    const renderList = (data, title) => {
        const entries = Object.entries(data);
        if (entries.length === 0) return null;

        return (
            <Box mt={2}>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Phone</TableCell>
                                <TableCell align="right">Player Count</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {entries.map(([key, value]) => (
                                <TableRow key={key}>
                                    <TableCell component="th" scope="row">
                                        {key}
                                    </TableCell>
                                    <TableCell align="right">{value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Owner Statistics</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            title="Total Players"
                            value={total_players}
                            icon={<PeopleIcon />}
                            color="primary"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            title="Found Users"
                            value={found_users}
                            icon={<PersonIcon />}
                            color="success"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            title="Unowned"
                            value={unowned}
                            icon={<UnknownIcon />}
                            color="warning"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            title="Not Found in DB"
                            value={not_found_in_users_db}
                            icon={<NotFoundIcon />}
                            color="error"
                        />
                    </Grid>
                </Grid>

                <Box mt={3}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            {Object.keys(admins).length > 0 ? (
                                renderList(admins, 'Admins')
                            ) : (
                                <Box p={2} textAlign="center" bgcolor="background.neutral" borderRadius={1}>
                                    <Typography variant="body2" color="text.secondary">No Admins Found</Typography>
                                </Box>
                            )}
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {Object.keys(agents).length > 0 ? (
                                renderList(agents, 'Agents')
                            ) : (
                                <Box p={2} textAlign="center" bgcolor="background.neutral" borderRadius={1}>
                                    <Typography variant="body2" color="text.secondary">No Agents Found</Typography>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </Box>

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OwnerStatsModal;

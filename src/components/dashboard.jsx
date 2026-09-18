import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Grid, Paper, Card, CardContent, useTheme, useMediaQuery, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { useDispatch, useSelector } from 'react-redux';
import {
  selectSummaryDistributions,
  selectWinningDistributionsByRange,
  selectWinningsLoading,
  selectWinningsError,
  fetchDistributionSummary,
} from '../state/slices/distributionSlice';
import DistributionListPanel from './grids/DashboardDistributions';

const SummaryCard = ({ title, amount }) => (
  <Card elevation={0} sx={{ height: '100%' }}>
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {Number(amount || 0).toLocaleString()}
      </Typography>
    </CardContent>
  </Card>
);

SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  amount: PropTypes.number,
};

SummaryCard.defaultProps = {
  amount: 0,
};

const DashboardComponent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [timeRange, setTimeRange] = useState(0);
  const dispatch = useDispatch();

  const loading = useSelector(selectWinningsLoading);
  const error = useSelector(selectWinningsError);
  const summaryFromDB = useSelector(selectSummaryDistributions);
  const distributions = useSelector(selectWinningDistributionsByRange);

  const [summaries, setSummaries] = useState([
    { title: 'Today', amount: 0 },
    { title: 'Week To Date', amount: 0 },
    { title: 'Month To Date', amount: 0 },
    { title: 'Year To Date', amount: 0 },
  ]);

  useEffect(() => {
    dispatch(fetchDistributionSummary());
  }, [dispatch]);

  useEffect(() => {
    if (summaryFromDB) {
      setSummaries([
        { title: 'Today', amount: summaryFromDB.today },
        { title: 'Week To Date', amount: summaryFromDB.weekToDate },
        { title: 'Month To Date', amount: summaryFromDB.monthToDate },
        { title: 'Year To Date', amount: summaryFromDB.yearToDate },
      ]);
    }
  }, [summaryFromDB]);

  const handleTimeRangeChange = (event, newValue) => {
    setTimeRange(newValue);
  };

  const aggregateByDate = (items) => {
    const aggregatedData = items.reduce((acc, distribution) => {
      const date = new Date(distribution.date).toLocaleDateString();

      if (!acc[date]) {
        acc[date] = {
          date,
          betAmount: 0,
          distributable: 0,
          amount: 0,
        };
      }

      acc[date].betAmount += distribution.betAmount;
      acc[date].distributable += distribution.distributable;
      acc[date].amount += distribution.amount;

      return acc;
    }, {});

    return Object.values(aggregatedData);
  };

  const chartData = aggregateByDate(distributions);
  const gridStroke = theme.palette.divider;
  const axisColor = theme.palette.text.secondary;
  const seriesBet = theme.palette.primary.main;
  const seriesWinning = theme.palette.success.main;
  const seriesCut = theme.palette.warning.main;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: 3,
          gap: 1,
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Tabs
          value={timeRange}
          onChange={handleTimeRangeChange}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
        >
          <Tab label="Daily" />
          <Tab label="Weekly" />
          <Tab label="Monthly" />
          <Tab label="Yearly" />
        </Tabs>
      </Box>

      <Grid container spacing={1} sx={{ mb: 3 }}>
        {summaries.map((summary, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <SummaryCard {...summary} />
          </Grid>
        ))}
      </Grid>

      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DistributionListPanel />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <>
          <Paper elevation={0} sx={{ mt: 3, p: { xs: 2, sm: 3 }, border: 1, borderColor: 'divider' }}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
              Bet vs winning
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="area-bet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={seriesBet} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={seriesBet} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="area-winning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={seriesWinning} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={seriesWinning} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="area-cut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={seriesCut} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={seriesCut} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="date" stroke={axisColor} tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: gridStroke }} />
                <YAxis stroke={axisColor} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={64} />
                <Tooltip
                  contentStyle={{
                    bgcolor: 'background.paper',
                    border: `1px solid ${gridStroke}`,
                    borderRadius: 8,
                    fontSize: 12,
                    color: theme.palette.text.primary,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="betAmount" stroke={seriesBet} fill="url(#area-bet)" strokeWidth={2} name="Total bet" />
                <Area type="monotone" dataKey="distributable" stroke={seriesWinning} fill="url(#area-winning)" strokeWidth={2} name="Distributable" />
                <Area type="monotone" dataKey="amount" stroke={seriesCut} fill="url(#area-cut)" strokeWidth={2} name="Your amount" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>

          <Paper elevation={0} sx={{ mt: 3, p: { xs: 2, sm: 3 }, border: 1, borderColor: 'divider' }}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
              Daily totals
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="date" stroke={axisColor} tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: gridStroke }} />
                <YAxis stroke={axisColor} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={64} />
                <Tooltip
                  cursor={{ fill: theme.palette.action.hover }}
                  contentStyle={{
                    bgcolor: 'background.paper',
                    border: `1px solid ${gridStroke}`,
                    borderRadius: 8,
                    fontSize: 12,
                    color: theme.palette.text.primary,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="betAmount" fill={seriesBet} name="Total bet" radius={[2, 2, 0, 0]} />
                <Bar dataKey="distributable" fill={seriesWinning} name="Distributable" radius={[2, 2, 0, 0]} />
                <Bar dataKey="amount" fill={seriesCut} name="Your amount" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default DashboardComponent;

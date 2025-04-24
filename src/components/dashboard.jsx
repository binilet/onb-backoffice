import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent, useTheme, useMediaQuery, Tabs, Tab } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadialBarChart, RadialBar, ScatterChart, Scatter, ZAxis } from 'recharts';

// Mock data (replace with actual data from your backend)
const transactionData = [
  { date: 'Aug 1', totalBet: 1000, totalWinning: 800, cutAmount: 200 },
  { date: 'Aug 2', totalBet: 1200, totalWinning: 1000, cutAmount: 200 },
  { date: 'Aug 3', totalBet: 800, totalWinning: 600, cutAmount: 200 },
  { date: 'Aug 4', totalBet: 1500, totalWinning: 1200, cutAmount: 300 },
  { date: 'Aug 5', totalBet: 1100, totalWinning: 900, cutAmount: 200 },
  { date: 'Aug 6', totalBet: 1300, totalWinning: 1100, cutAmount: 200 },
  { date: 'Aug 7', totalBet: 1700, totalWinning: 1400, cutAmount: 300 },
];

const userRoleData = [
  { name: 'Users', value: 300, fill: '#4361ee' },
  { name: 'Agents', value: 50, fill: '#3a0ca3' },
  { name: 'Admins', value: 10, fill: '#7209b7' },
];

const transactionHistoryData = [
  { date: 'Aug 1', credit: 5000, debit: 3000 },
  { date: 'Aug 2', credit: 6000, debit: 4000 },
  { date: 'Aug 3', credit: 7000, debit: 2000 },
  { date: 'Aug 4', credit: 8000, debit: 5000 },
  { date: 'Aug 5', credit: 9000, debit: 6000 },
  { date: 'Aug 6', credit: 8500, debit: 5500 },
  { date: 'Aug 7', credit: 10000, debit: 7000 },
];

const betTypeData = [
  { name: 'Sport', value: 45, fill: '#0088FE' },
  { name: 'Casino', value: 30, fill: '#00C49F' },
  { name: 'Poker', value: 15, fill: '#FFBB28' },
  { name: 'Lottery', value: 10, fill: '#FF8042' },
];

const userActivityData = [
  { hour: '00:00', active: 120 },
  { hour: '03:00', active: 80 },
  { hour: '06:00', active: 40 },
  { hour: '09:00', active: 180 },
  { hour: '12:00', active: 250 },
  { hour: '15:00', active: 320 },
  { hour: '18:00', active: 380 },
  { hour: '21:00', active: 270 },
];

const profitLossData = [
  { day: 'Mon', profit: 4000, loss: -2400 },
  { day: 'Tue', profit: 3000, loss: -1398 },
  { day: 'Wed', profit: 2000, loss: -3800 },
  { day: 'Thu', profit: 2780, loss: -3908 },
  { day: 'Fri', profit: 1890, loss: -4800 },
  { day: 'Sat', profit: 6390, loss: -3800 },
  { day: 'Sun', profit: 5490, loss: -4300 },
];

const userSpendingData = [
  { amount: 200, users: 50, age: 20 },
  { amount: 400, users: 30, age: 25 },
  { amount: 650, users: 25, age: 30 },
  { amount: 1000, users: 15, age: 35 },
  { amount: 1500, users: 10, age: 40 },
  { amount: 2000, users: 5, age: 45 },
];

const SummaryCard = ({ title, amount, trend, color }) => (
  <Card sx={{ 
    height: '100%', 
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', 
    borderRadius: 2,
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
    }
  }}>
    <Box sx={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      height: '4px', 
      width: '100%', 
      backgroundColor: color || '#4361ee' 
    }} />
    <CardContent>
      <Typography variant="body2" sx={{ fontWeight: 500, opacity: 0.7 }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ my: 1, fontWeight: 700 }}>
        ${amount.toLocaleString()}
      </Typography>
      <Typography variant="body2" sx={{ 
        color: trend > 0 ? 'success.main' : 'error.main',
        display: 'flex',
        alignItems: 'center'
      }}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from previous period
      </Typography>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1, bgcolor: 'rgba(255, 255, 255, 0.95)', boxShadow: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>{label}</Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

const DashboardComponent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [timeRange, setTimeRange] = useState(0);

  // Calculate summary amounts with trends
  const summaries = [
    { title: "Today", amount: 1100, trend: 5.2, color: '#4361ee' },
    { title: "Week To Date", amount: 5500, trend: 12.3, color: '#3a0ca3' },
    { title: "Month To Date", amount: 22000, trend: -3.5, color: '#7209b7' },
    { title: "Year To Date", amount: 135000, trend: 24.8, color: '#f72585' }
  ];

  const handleTimeRangeChange = (event, newValue) => {
    setTimeRange(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, bgcolor: '#f5f7fa' }}>
      {/* Header with options */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: { xs: 2, md: 0 } }}>
          Analytics Dashboard
        </Typography>
        <Tabs
          value={timeRange}
          onChange={handleTimeRangeChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
        >
          <Tab label="Daily" />
          <Tab label="Weekly" />
          <Tab label="Monthly" />
          <Tab label="Yearly" />
        </Tabs>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaries.map((summary, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <SummaryCard {...summary} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Main Transaction Overview Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Transaction Overview
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={transactionData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="totalBet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4361ee" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4361ee" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="totalWinning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3a0ca3" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3a0ca3" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="cutAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7209b7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#7209b7" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="totalBet" stroke="#4361ee" fillOpacity={1} fill="url(#totalBet)" />
                <Area type="monotone" dataKey="totalWinning" stroke="#3a0ca3" fillOpacity={1} fill="url(#totalWinning)" />
                <Area type="monotone" dataKey="cutAmount" stroke="#7209b7" fillOpacity={1} fill="url(#cutAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* User Role Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              User Role Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                />
                <Tooltip formatter={(value) => [`${value} Users`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Bet Type Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Bet Type Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <RadialBarChart 
                innerRadius="30%" 
                outerRadius="90%" 
                data={betTypeData} 
                startAngle={180} 
                endAngle={0}
                cx="50%"
                cy="60%"
              >
                <RadialBar 
                  minAngle={15} 
                  background 
                  clockWise={true} 
                  dataKey="value" 
                  label={{ fill: '#666', position: 'insideStart' }}
                />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* User Activity by Hour */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              User Activity by Hour
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="active" fill="#4361ee" name="Active Users" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Transaction History Line Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Transaction History
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={transactionHistoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="credit" stroke="#4361ee" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="debit" stroke="#f72585" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* User Spending Bubble Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              User Spending Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" dataKey="age" name="Age" unit=" yrs" />
                <YAxis type="number" dataKey="amount" name="Amount" unit="$" />
                <ZAxis type="number" dataKey="users" range={[50, 500]} name="Users" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Users by Age and Spending" data={userSpendingData} fill="#7209b7" />
              </ScatterChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Profit/Loss Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Weekly Profit & Loss
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitLossData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="profit" fill="#4CC9F0" name="Profit" radius={[4, 4, 0, 0]} />
                <Bar dataKey="loss" fill="#F72585" name="Loss" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardComponent;
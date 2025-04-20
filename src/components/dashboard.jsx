import React from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// Mock data (replace with actual data from your backend)
const transactionData = [
  { date: '2024-08-01', totalBet: 1000, totalWinning: 800, cutAmount: 200 },
  { date: '2024-08-02', totalBet: 1200, totalWinning: 1000, cutAmount: 200 },
  { date: '2024-08-03', totalBet: 800, totalWinning: 600, cutAmount: 200 },
  { date: '2024-08-04', totalBet: 1500, totalWinning: 1200, cutAmount: 300 },
  { date: '2024-08-05', totalBet: 1100, totalWinning: 900, cutAmount: 200 },
];

const userRoleData = [
  { name: 'Users', value: 300 },
  { name: 'Agents', value: 50 },
  { name: 'Admins', value: 10 },
];

const transactionHistoryData = [
  { date: '2024-08-01', credit: 5000, debit: 3000 },
  { date: '2024-08-02', credit: 6000, debit: 4000 },
  { date: '2024-08-03', credit: 7000, debit: 2000 },
  { date: '2024-08-04', credit: 8000, debit: 5000 },
  { date: '2024-08-05', credit: 9000, debit: 6000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const SummaryCard = ({ title, amount }) => (
  <Card>
    <CardContent>
      <Typography color="textSecondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" component="div">
        ${amount}
      </Typography>
    </CardContent>
  </Card>
);

const DashboardComponent = () => {
  // Calculate summary amounts (replace with actual calculations from your data)
  const dailyCutAmount = 1100;
  const weeklyCutAmount = 5500;
  const monthlyCutAmount = 22000;
  const yearlyCutAmount = 35000;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <SummaryCard title="Today" amount={dailyCutAmount} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <SummaryCard title="Week To Date" amount={weeklyCutAmount} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <SummaryCard title="Month To Date" amount={monthlyCutAmount} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <SummaryCard title="Year To Date" amount={yearlyCutAmount} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Transaction Overview Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Transaction Overview
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalBet" fill="#8884d8" />
                <Bar dataKey="totalWinning" fill="#82ca9d" />
                <Bar dataKey="cutAmount" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* User Role Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Role Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Transaction History Line Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Transaction History
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={transactionHistoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="credit" stroke="#8884d8" />
                <Line type="monotone" dataKey="debit" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardComponent;



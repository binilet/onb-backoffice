// Transactions.jsx
import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid } from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

const mockTransactions = [
  { id: 1, gameId: 'GAME001', date: '2024-08-01', players: 4, betAmount: 1000, totalWinning: 800, cutAmount: 200, isVoid: false },
  { id: 2, gameId: 'GAME002', date: '2024-08-02', players: 6, betAmount: 1500, totalWinning: 1200, cutAmount: 300, isVoid: false },
  { id: 3, gameId: 'GAME003', date: '2024-08-03', players: 3, betAmount: 750, totalWinning: 600, cutAmount: 150, isVoid: true },
];

const COLORS = ['#0088FE', '#FF8042']; // Blue for 'No', Orange for 'Yes'

// Prepare data for charts
const voidData = [
  { name: 'Valid', value: mockTransactions.filter(t => !t.isVoid).length },
  { name: 'Void', value: mockTransactions.filter(t => t.isVoid).length },
];

const barData = mockTransactions.map(transaction => ({
  gameId: transaction.gameId,
  betAmount: transaction.betAmount,
  totalWinning: transaction.totalWinning,
}));

const lineData = mockTransactions.map(transaction => ({
  date: transaction.date,
  players: transaction.players,
}));

const Transactions = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom >
        Transactions
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom >
            Void Transactions
          </Typography>
          <PieChart width={300} height={300}>
            <Pie
              data={voidData}
              cx={150}
              cy={150}
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {voidData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Bet Amount vs. Total Winning
          </Typography>
          <BarChart width={600} height={300} data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="gameId" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="betAmount" fill="#8884d8" />
            <Bar dataKey="totalWinning" fill="#82ca9d" />
          </BarChart>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6">
            Players Over Time
          </Typography>
          <LineChart width={800} height={400} data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="players" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ mt: 5 }}>
        <Table sx={{ minWidth: 650 }} aria-label="transactions table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Game ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Players</TableCell>
              <TableCell>Bet Amount</TableCell>
              <TableCell>Total Winning</TableCell>
              <TableCell>Cut Amount</TableCell>
              <TableCell>Is Void</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell component="th" scope="row">{transaction.id}</TableCell>
                <TableCell>{transaction.gameId}</TableCell>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.players}</TableCell>
                <TableCell>${transaction.betAmount}</TableCell>
                <TableCell>${transaction.totalWinning}</TableCell>
                <TableCell>${transaction.cutAmount}</TableCell>
                <TableCell>{transaction.isVoid ? 'Yes' : 'No'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Transactions;

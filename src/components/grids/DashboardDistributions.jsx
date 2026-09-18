import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  selectWinningDistributionsByRange,
  fetchDistributionByDateRange,
} from "../../state/slices/distributionSlice";
import { numericFontFamily } from "../../../theme";

const DistributionListPanel = () => {
  const dispatch = useDispatch();
  const distributions = useSelector(selectWinningDistributionsByRange);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    dispatch(fetchDistributionByDateRange({ start: null, end: null, phone: null }));
  }, [dispatch]);

  const handleFilter = () => {
    dispatch(fetchDistributionByDateRange({ start: startDate, end: endDate, phone: null }));
    setPage(0);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    dispatch(fetchDistributionByDateRange({ start: null, end: null, phone: null }));
    setPage(0);
  };

  const totalAmount = distributions.reduce((acc, d) => acc + d.amount, 0);

  const paginatedDistributions = distributions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.max(1, Math.ceil(distributions.length / rowsPerPage));

  const formatMoney = (value) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: 1, borderColor: "divider" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ mb: 2 }}
      >
        <TextField
          label="Start date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="End date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
        <Button variant="contained" disableElevation onClick={handleFilter}>
          Apply
        </Button>
        <Button variant="outlined" color="inherit" onClick={handleReset}>
          Reset
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {distributions.length} result(s)
        </Typography>
        <Typography variant="subtitle2" sx={{ fontFamily: numericFontFamily }}>
          Total {formatMoney(totalAmount)}
        </Typography>
      </Stack>

      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Bet</TableCell>
              <TableCell align="right">Your %</TableCell>
              <TableCell align="right">Distributable</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedDistributions.map((distribution, index) => (
              <TableRow key={index} hover sx={{ "&:last-child td": { border: 0 } }}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: numericFontFamily }}>
                    {new Date(distribution.date).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: numericFontFamily }}>
                    {distribution.phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={distribution.role} size="small" variant="outlined" sx={{ height: 22, fontWeight: 600 }} />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontFamily: numericFontFamily, fontWeight: 600 }}>
                    {formatMoney(distribution.amount)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontFamily: numericFontFamily }}>
                    {formatMoney(distribution.betAmount)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontFamily: numericFontFamily }}>
                    {distribution.yourPercent}%
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontFamily: numericFontFamily }}>
                    {formatMoney(distribution.distributable)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={distribution.approved ? "Approved" : "Pending"}
                    color={distribution.approved ? "success" : "warning"}
                    size="small"
                    variant="outlined"
                    sx={{ height: 22, fontWeight: 600 }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {distributions.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No distributions found. Try adjusting your filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1} sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Page {page + 1} of {totalPages}
        </Typography>
        <Button size="small" variant="outlined" color="inherit" disabled={page === 0} onClick={() => setPage(0)}>
          First
        </Button>
        <Button size="small" variant="outlined" color="inherit" disabled={page === 0} onClick={() => setPage(page - 1)}>
          Prev
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          disabled={page >= totalPages - 1}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          disabled={page >= totalPages - 1}
          onClick={() => setPage(totalPages - 1)}
        >
          Last
        </Button>
      </Stack>
    </Paper>
  );
};

export default DistributionListPanel;

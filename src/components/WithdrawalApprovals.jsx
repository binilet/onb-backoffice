import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import MarketplaceLayout from "../marketplace/MarketplaceLayout";
import {
  disbursePlayerRoomWithdrawal,
  getPlayerRoomWithdrawals,
} from "../marketplace/shopApi";
const STATUSES = ["PENDING", "CASH_DISBURSED", "PLAYER_CONFIRMED", "SETTLED"];
// Highlight for the request a Telegram link points at.
const focusRowSx = {
  "&.Mui-selected, &.Mui-selected:hover": {
    bgcolor: "action.selected",
    boxShadow: (theme) => `inset 4px 0 0 ${theme.palette.warning.main}`,
  },
};
const isDay = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || "");

export default function WithdrawalApprovals() {
  // Telegram "Go for approval" links open ?status=…&date=…&focus=<withdrawalId>.
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get("focus");
  const focusRef = useRef(null);
  const [status, setStatus] = useState(() => (STATUSES.includes(searchParams.get("status")) ? searchParams.get("status") : "PENDING")),
    [items, setItems] = useState([]),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState(""),
    [selected, setSelected] = useState(null),
    [date, setDate] = useState(() => (isDay(searchParams.get("date")) ? searchParams.get("date") : new Date().toISOString().slice(0, 10)));
  const load = () =>
    getPlayerRoomWithdrawals({ status, startAt: `${date}T00:00:00+03:00`, endAt: new Date(new Date(`${date}T00:00:00+03:00`).getTime() + 86400000).toISOString() })
      .then((data) => {
        setItems(data);
        setLoaded(true);
      })
      .catch((e) =>
        setError(e.response?.data?.detail || "Unable to load withdrawals"),
      );
  useEffect(() => {
    load();
  }, [status, date]);
  useEffect(() => {
    focusRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [items]);
  const focusMissing = Boolean(focusId) && loaded && !items.some((x) => x.withdrawalId === focusId);
  const disburse = async (id) => {
    try {
      await disbursePlayerRoomWithdrawal(id);
      load();
    } catch (e) {
      setError(e.response?.data?.detail || "Unable to mark cash disbursed");
    }
  };
  return (
    <MarketplaceLayout
      title="Withdrawal approvals"
      subtitle="Cash is settled only after both the branch and player confirm."
      showPreviewNotice={false}
    >
      {error && <Alert severity="error">{error}</Alert>}
      {focusMissing && (
        <Alert severity="info" sx={{ mb: 2 }}>
          The withdrawal from the Telegram link is not in this list. It may already be handled, or it is outside your shop scope.
        </Alert>
      )}
      <Paper>
        <Stack direction="row" gap={1} sx={{ p: 2 }}><TextField size="small" type="date" label="Withdrawal date" value={date} onChange={(event) => setDate(event.target.value)} InputLabelProps={{ shrink: true }} /><Button variant="outlined" onClick={load}>Refresh</Button></Stack>
        <Tabs value={status} onChange={(_, v) => setStatus(v)}>
          <Tab value="PENDING" label="Pending" />
          <Tab value="CASH_DISBURSED" label="Cash disbursed" />
          <Tab value="PLAYER_CONFIRMED" label="Player confirmed" />
          <Tab value="SETTLED" label="Settled" />
        </Tabs>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((x) => (
              <TableRow
                key={x.id}
                selected={x.withdrawalId === focusId}
                sx={focusRowSx}
                ref={x.withdrawalId === focusId ? focusRef : undefined}
              >
                <TableCell>{x.playerPhone}</TableCell>
                <TableCell>{x.branchId}</TableCell>
                <TableCell>{x.amount}</TableCell>
                <TableCell>{x.status}</TableCell>
                <TableCell>
                  {["PENDING", "PLAYER_CONFIRMED"].includes(x.status) && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setSelected(x)}
                    >
                      Mark cash disbursed
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!items.length && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography>No withdrawals in this status.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)}><DialogTitle>Confirm cash disbursement</DialogTitle><DialogContent><Typography>Only continue after handing {selected?.amount} Birr in cash to {selected?.playerPhone}. The player must still confirm receipt before the wallet is debited.</Typography></DialogContent><DialogActions><Button onClick={() => setSelected(null)}>Cancel</Button><Button variant="contained" onClick={async () => { await disburse(selected.withdrawalId); setSelected(null); }}>Cash handed over</Button></DialogActions></Dialog>
    </MarketplaceLayout>
  );
}

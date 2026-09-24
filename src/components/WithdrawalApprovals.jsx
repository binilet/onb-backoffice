import { useEffect, useState } from "react";
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
export default function WithdrawalApprovals() {
  const [status, setStatus] = useState("PENDING"),
    [items, setItems] = useState([]),
    [error, setError] = useState(""),
    [selected, setSelected] = useState(null),
    [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const load = () =>
    getPlayerRoomWithdrawals({ status, startAt: `${date}T00:00:00+03:00`, endAt: new Date(new Date(`${date}T00:00:00+03:00`).getTime() + 86400000).toISOString() })
      .then(setItems)
      .catch((e) =>
        setError(e.response?.data?.detail || "Unable to load withdrawals"),
      );
  useEffect(() => {
    load();
  }, [status, date]);
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
              <TableRow key={x.id}>
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

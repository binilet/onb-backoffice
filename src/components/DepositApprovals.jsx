import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import PaymentsOutlined from "@mui/icons-material/PaymentsOutlined";
import PointOfSaleOutlined from "@mui/icons-material/PointOfSaleOutlined";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import { numericFontFamily } from "../../theme";
import MarketplaceLayout from "../marketplace/MarketplaceLayout";
import {
  decidePlayerRoomDeposit,
  getBranches,
  getPlayerRoomDeposits,
  getShops,
} from "../marketplace/shopApi";

const money = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
const dateTime = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Addis_Ababa",
});
const apiError = (error, fallback) => error.response?.data?.detail || fallback;
const dayEnd = (date) =>
  new Date(
    new Date(`${date}T00:00:00+03:00`).getTime() + 86400000,
  ).toISOString();

const TABS = ["TELEBIRR", "CASH", "APPROVED", "DECLINED"];
// Highlight for the request a Telegram link points at.
const focusRowSx = {
  "&.Mui-selected, &.Mui-selected:hover": {
    bgcolor: "action.selected",
    boxShadow: (theme) => `inset 4px 0 0 ${theme.palette.warning.main}`,
  },
};
const isDay = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || "");

export default function DepositApprovals() {
  // Telegram "Go for approval" links open ?tab=…&date=…&focus=<deposit id>.
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get("focus");
  const focusRef = useRef(null);
  const [tab, setTab] = useState(() => (TABS.includes(searchParams.get("tab")) ? searchParams.get("tab") : "TELEBIRR"));
  const [date, setDate] = useState(() => (isDay(searchParams.get("date")) ? searchParams.get("date") : new Date().toISOString().slice(0, 10)));
  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [deposits, branchData, shopData] = await Promise.all([
        getPlayerRoomDeposits({
          status: tab === "APPROVED" || tab === "DECLINED" ? tab : "PENDING",
          ...(tab === "TELEBIRR" || tab === "CASH"
            ? { depositMethod: tab }
            : {}),
          startAt: `${date}T00:00:00+03:00`,
          endAt: dayEnd(date),
        }),
        getBranches(),
        getShops(),
      ]);
      setItems(deposits);
      setBranches(branchData);
      setShops(shopData);
    } catch (requestError) {
      setError(apiError(requestError, "Unable to load deposit requests."));
    } finally {
      setLoading(false);
    }
  }, [date, tab]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (!loading) focusRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [loading, items]);
  const focusMissing = Boolean(focusId) && !loading && !items.some((item) => item.id === focusId);

  const branchNames = useMemo(
    () =>
      Object.fromEntries(
        branches.map((branch) => [branch.branch_id, branch.branchName]),
      ),
    [branches],
  );
  const shopNames = useMemo(
    () =>
      Object.fromEntries(shops.map((shop) => [shop.shop_id, shop.shopName])),
    [shops],
  );
  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.amount), 0),
    [items],
  );
  const decide = async (item, action) => {
    setSaving(item.id);
    setError("");
    try {
      await decidePlayerRoomDeposit(item.id, { action });
      setItems((current) =>
        current.filter((deposit) => deposit.id !== item.id),
      );
      setNotice(`${item.playerPhone}'s deposit was ${action.toLowerCase()}d.`);
    } catch (requestError) {
      setError(apiError(requestError, "Unable to review this deposit."));
    } finally {
      setSaving("");
    }
  };

  return (
    <MarketplaceLayout
      title="Deposit approvals"
      subtitle="Review today’s player room-wallet deposits in your assigned shop scope."
      showPreviewNotice={false}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {notice && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setNotice("")}>
          {notice}
        </Alert>
      )}
      {focusMissing && (
        <Alert severity="info" sx={{ mb: 3 }}>
          The deposit from the Telegram link is not in this list. It may already be reviewed, or it is outside your shop scope.
        </Alert>
      )}
      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <Box sx={{ p: 2, pb: 0 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ sm: "center" }}
            gap={1}
          >
            <Stack direction="row" gap={1}>
              <TextField
                size="small"
                label="Deposit date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button
                variant="outlined"
                startIcon={<RefreshOutlined />}
                onClick={load}
                disabled={loading}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </Box>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 1, mt: 1 }}
        >
          <Tab
            value="TELEBIRR"
            icon={<PaymentsOutlined />}
            iconPosition="start"
            label="Telebirr pending"
          />
          <Tab
            value="CASH"
            icon={<PointOfSaleOutlined />}
            iconPosition="start"
            label="Cash pending"
          />
          <Tab value="APPROVED" label="Approved today" />
          <Tab value="DECLINED" label="Declined today" />
        </Tabs>
        <Stack
          direction="row"
          spacing={2}
          sx={{ px: 2, py: 1, bgcolor: "action.hover" }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              REQUESTS
            </Typography>
            <Typography fontWeight={800}>{items.length}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              TOTAL
            </Typography>
            <Typography fontWeight={800} sx={{ fontFamily: numericFontFamily }}>
              {money.format(total)} Birr
            </Typography>
          </Box>
        </Stack>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Depositor</TableCell>
                  <TableCell>Shop / branch</TableCell>
                  <TableCell>Payment detail</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Decision</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    selected={item.id === focusId}
                    sx={focusRowSx}
                    ref={item.id === focusId ? focusRef : undefined}
                  >
                    <TableCell>
                      <Typography
                        fontWeight={700}
                        sx={{ fontFamily: numericFontFamily }}
                      >
                        {item.playerPhone}
                      </Typography>
                      <Chip
                        size="small"
                        variant="outlined"
                        color={
                          item.status === "APPROVED"
                            ? "success"
                            : item.status === "DECLINED"
                              ? "error"
                              : "warning"
                        }
                        label={item.status}
                        sx={{ mt: 0.5 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {shopNames[item.shopId] || item.shopId}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {branchNames[item.branchId] || item.branchId}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontFamily: numericFontFamily }}>
                      {item.depositMethod === "CASH"
                        ? item.recipientPhone || "Branch cashier"
                        : item.transactionId}
                    </TableCell>
                    <TableCell>
                      {dateTime.format(new Date(item.createdAt))}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontFamily: numericFontFamily, fontWeight: 800 }}
                    >
                      {money.format(item.amount)}
                    </TableCell>
                    <TableCell align="right">
                      {/* Failed receipt checks stay reviewable by staff. */}
                      {["PENDING", "FAILED"].includes(item.status) ? (
                        <Stack
                          direction="row"
                          justifyContent="flex-end"
                          gap={1}
                        >
                          <Button
                            size="small"
                            color="success"
                            variant="contained"
                            disabled={Boolean(saving)}
                            onClick={() => decide(item, "APPROVE")}
                          >
                            {saving === item.id ? "Saving…" : "Approve"}
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            disabled={Boolean(saving)}
                            onClick={() => decide(item, "DECLINE")}
                          >
                            Decline
                          </Button>
                        </Stack>
                      ) : (
                        <Typography variant="caption">
                          {item.reviewedByPhone || "—"}
                          <br />
                          {item.reviewedAt
                            ? dateTime.format(new Date(item.reviewedAt))
                            : ""}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!items.length && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Typography fontWeight={700}>
                        No {tab.toLowerCase()} deposits for this day
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </MarketplaceLayout>
  );
}

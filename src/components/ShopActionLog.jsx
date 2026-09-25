import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { numericFontFamily } from "../../theme";
import MarketplaceLayout from "../marketplace/MarketplaceLayout";
import { getActionLogs, getBranches, getShops } from "../marketplace/shopApi";

const today = new Date().toISOString().slice(0, 10);
const dateTime = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Addis_Ababa",
});

export default function ShopActionLog() {
  const user = useSelector((state) => state.auth._current_user);
  const role = user?.role;
  const chooseShop = ["system", "agent", "subagent"].includes(role);
  const [shops, setShops] = useState([]);
  const [branches, setBranches] = useState([]);
  const [logs, setLogs] = useState([]);
  const [date, setDate] = useState(today);
  const [shopId, setShopId] = useState(() =>
    chooseShop ? "" : user?.shopId || "",
  );
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!chooseShop) setShopId(user?.shopId || "");
  }, [chooseShop, user?.shopId]);
  useEffect(() => {
    Promise.all([getShops(), getBranches()])
      .then(([shopData, branchData]) => {
        setShops(shopData);
        setBranches(branchData);
      })
      .catch(() => setError("Unable to load shop filters."))
      .finally(() => setLoadingOptions(false));
  }, []);
  const load = useCallback(async () => {
    if (!date || (chooseShop && !shopId)) {
      setError("Choose a date and shop before loading activity.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setLogs(
        await getActionLogs({ logDate: date, ...(shopId && { shopId }) }),
      );
      setRequested(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail || "Unable to load the action log.",
      );
    } finally {
      setLoading(false);
    }
  }, [date, chooseShop, shopId]);
  const shopNames = useMemo(
    () =>
      Object.fromEntries(shops.map((shop) => [shop.shop_id, shop.shopName])),
    [shops],
  );
  const branchNames = useMemo(
    () =>
      Object.fromEntries(
        branches.map((branch) => [branch.branch_id, branch.branchName]),
      ),
    [branches],
  );
  return (
    <MarketplaceLayout
      title="Action log"
      subtitle="Review a single day of Hagere Shops activity."
      showPreviewNotice={false}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            gap={1}
            flexWrap="wrap"
            alignItems="center"
            sx={{ mt: 0 }}
          >
            <TextField
              required
              type="date"
              label="Activity date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            {chooseShop ? (
              <TextField
                required
                select
                label="Shop"
                value={shopId}
                disabled={loadingOptions}
                onChange={(event) => setShopId(event.target.value)}
                sx={{ minWidth: 220 }}
              >
                {shops.map((shop) => (
                  <MenuItem key={shop.shop_id} value={shop.shop_id}>
                    {shop.shopName}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                label="Shop"
                value={shopNames[shopId] || shopId || "Assigned shop"}
                disabled
                sx={{ minWidth: 220 }}
              />
            )}
            <Button
              variant="contained"
              onClick={load}
              disabled={
                loading || loadingOptions || !date || (chooseShop && !shopId)
              }
            >
              {loading ? "Loading…" : "Load activity"}
            </Button>
          </Stack>
        </Box>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress size={32} />
          </Stack>
        ) : requested ? (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 820 }}>
              <TableHead>
                <TableRow>
                  <TableCell>When</TableCell>
                  <TableCell>Actor</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Object</TableCell>
                  <TableCell>Scope</TableCell>
                  <TableCell>Detail</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.log_id} hover>
                    <TableCell
                      sx={{
                        whiteSpace: "nowrap",
                        fontFamily: numericFontFamily,
                      }}
                    >
                      {dateTime.format(new Date(log.createdAt))}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{log.actorPhone}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {log.actorRole}
                      </Typography>
                    </TableCell>
                    <TableCell>{log.actionType}</TableCell>
                    <TableCell>{log.entityType}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {shopNames[log.shopId] || "—"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {branchNames[log.branchId] || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{ overflowWrap: "anywhere" }}
                      >
                        {Object.entries(log.detail || {})
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(" · ") || "—"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {!logs.length && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      No activity was recorded for this date and shop.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ py: 4, textAlign: "center", borderTop: 1, borderColor: "divider" }} />
        )}
      </Paper>
    </MarketplaceLayout>
  );
}

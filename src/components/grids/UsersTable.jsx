import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  Stack,
  CardContent,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Button,
  Tooltip,
} from "@mui/material";

import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  MonetizationOn as MonetizationOnIcon,
  MoneyOff as MoneyOffIcon,
  NewReleasesSharp as NewIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

import { numericFontFamily } from "../../../theme";
import TransactionHistoryModal from "./TransactionHistoryModal";

const UsersTable = ({ users = [], handleEdit, handleTransactionhistory, filterPanel }) => {
  const [open, setOpen] = useState(false);

  const [filteredUsers, setFilteredUsers] = useState(users);

  const handleFilteredUsers = (filtered) => {
    setFilteredUsers(filtered);
  };

  const handleHistoryModal = async (user) => {
    await handleTransactionhistory(user);
    setOpen(true);
  };

  const totalUsers = filteredUsers.length;
  const activeUsers = filteredUsers.filter((user) => user.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;
  const totalHealthyCredit = filteredUsers.reduce(
    (acc, user) => acc + (user.current_balance > 0 ? user.current_balance : 0),
    0
  );
  const totalUnhealthyCredit = filteredUsers.reduce(
    (acc, user) => acc + (user.current_balance <= 0 ? user.current_balance : 0),
    0
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const newUsersCount = filteredUsers.filter((user) => {
    const createdDate = new Date(user.createdAt);
    return createdDate >= today;
  }).length;

  return (
    <Box>
      <SummaryCards
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        inactiveUsers={inactiveUsers}
        totalHealthyCredit={totalHealthyCredit}
        totalUnhealthyCredit={totalUnhealthyCredit}
        newUsers={newUsersCount}
      />

      {filterPanel}

      <UserList
        users={users}
        handleEdit={handleEdit}
        handleHistoryModal={handleHistoryModal}
        onFilteredUsersChange={handleFilteredUsers}
      />

      <TransactionHistoryModal open={open} onClose={() => setOpen(false)} />
    </Box>
  );
};

function SummaryCards({
  totalUsers,
  activeUsers,
  inactiveUsers,
  totalHealthyCredit,
  totalUnhealthyCredit,
  newUsers,
}) {
  const stats = [
    { label: "Total users", value: totalUsers?.toLocaleString() || "0", color: "primary.main", icon: <PersonIcon /> },
    { label: "Active users", value: activeUsers?.toLocaleString() || "0", color: "success.main", icon: <CheckCircleIcon /> },
    { label: "Inactive users", value: inactiveUsers?.toLocaleString() || "0", color: "error.main", icon: <CancelIcon /> },
    { label: "Healthy credit", value: totalHealthyCredit?.toLocaleString() || "0", color: "success.main", icon: <MonetizationOnIcon />, numeric: true },
    { label: "Unhealthy credit", value: totalUnhealthyCredit?.toLocaleString() || "0", color: "warning.main", icon: <MoneyOffIcon />, numeric: true },
    { label: "New today", value: newUsers?.toLocaleString() || "0", color: "primary.main", icon: <NewIcon /> },
  ];

  return (
    <Grid container spacing={1} sx={{ mb: 2 }}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              bgcolor: "background.paper",
              "&:hover": { borderColor: "primary.main" },
            }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: stat.color,
                    bgcolor: "background.default",
                    "& svg": { fontSize: 18 },
                  }}
                >
                  {stat.icon}
                </Box>
              </Box>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontFamily: stat.numeric ? numericFontFamily : undefined,
                  color: "text.primary",
                  mb: 0.5,
                  lineHeight: 1.2,
                }}
              >
                {stat.value}
              </Typography>

              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {stat.label}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

const UserList = ({ users, handleEdit, handleHistoryModal, onFilteredUsersChange }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const newUsers = useMemo(() => {
    return filteredUsers.filter((user) => {
      const createdDate = new Date(user.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate.getTime() === today.getTime();
    });
  }, [filteredUsers, today]);

  const currentTabData = activeTab === 0 ? filteredUsers : newUsers;

  const paginatedUsers = useMemo(() => {
    return currentTabData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [currentTabData, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance);
  };

  const exportToCSV = () => {
    const currentData = activeTab === 0 ? filteredUsers : newUsers;

    const headers = [
      "Username",
      "Phone",
      "Role",
      "Agent ID",
      "Admin ID",
      "Balance (birr)",
      "Status",
      "Created Date",
    ];

    const csvData = currentData.map((user) => [
      user.username || "",
      user.phone || "",
      user.role || "",
      user.agentId || "",
      user.adminId || "",
      user.current_balance || 0,
      user.isActive ? "Active" : "Inactive",
      new Date(user.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `users_${activeTab === 0 ? "all" : "new"}_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFilteredUsersChange = (filtered) => {
    setFilteredUsers(filtered);
    onFilteredUsersChange(filtered);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Card elevation={0}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <SearchBarComponent
            users={users}
            onFilteredUsersChange={handleFilteredUsersChange}
            exportToCSV={exportToCSV}
          />

          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="All users" sx={{ mr: 3 }} />
              <Tab label="New users" />
            </Tabs>
          </Box>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Agent ID</TableCell>
                  <TableCell>Admin ID</TableCell>
                  <TableCell align="right">Balance</TableCell>
                  <TableCell align="right">Promo balance</TableCell>
                  <TableCell>Invited by</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <TableRow key={user._id} hover sx={{ "&:last-child td": { border: 0 } }}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar
                            sx={{
                              bgcolor: "background.default",
                              color: "primary.main",
                              width: 32,
                              height: 32,
                              fontSize: "0.875rem",
                              fontWeight: 600,
                            }}
                          >
                            {user.username?.charAt(0).toUpperCase() || "U"}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" noWrap>
                              {user.username}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontFamily: numericFontFamily, fontSize: "0.6875rem" }}
                            >
                              {user._id}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <PhoneIcon fontSize="small" color="action" sx={{ fontSize: "1rem" }} />
                          <Typography variant="body2" sx={{ fontFamily: numericFontFamily }}>
                            {user.phone}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600, height: 22 }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: numericFontFamily }}>
                          {user.agentId}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: numericFontFamily }}>
                          {user.adminId}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontFamily: numericFontFamily,
                            color: user.current_balance >= 0 ? "text.primary" : "error.main",
                          }}
                        >
                          {formatBalance(user.current_balance)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="subtitle2" sx={{ fontFamily: numericFontFamily }}>
                          {formatBalance(user.promo_balance)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user?.invitedBy || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={user.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                          label={user.isActive ? "Active" : "Inactive"}
                          color={user.isActive ? "success" : "default"}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600, height: 22 }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleEdit(user)} size="small" color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View history">
                            <IconButton onClick={() => handleHistoryModal(user)} size="small" color="default">
                              <HistoryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No users found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={currentTabData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

const SearchBarComponent = ({ users, onFilteredUsersChange, exportToCSV }) => {
  const [generalSearch, setGeneralSearch] = useState("");
  const [agentIdSearch, setAgentIdSearch] = useState("");
  const [adminIdSearch, setAdminIdSearch] = useState("");

  const filteredUsers = useMemo(() => {
    return users?.filter((user) => {
      const matchesGeneral =
        !generalSearch ||
        user.username?.toLowerCase().includes(generalSearch.toLowerCase()) ||
        user.phone?.toLowerCase().includes(generalSearch.toLowerCase()) ||
        user.role?.toLowerCase().includes(generalSearch.toLowerCase()) ||
        user.invitedBy?.toLowerCase().includes(generalSearch.toLowerCase());

      const matchesAgentId =
        !agentIdSearch ||
        user.agentId?.toLowerCase().includes(agentIdSearch.toLowerCase());

      const matchesAdminId =
        !adminIdSearch ||
        user.adminId?.toLowerCase().includes(adminIdSearch.toLowerCase());

      return matchesGeneral && matchesAgentId && matchesAdminId;
    });
  }, [users, generalSearch, agentIdSearch, adminIdSearch]);

  React.useEffect(() => {
    if (onFilteredUsersChange) {
      onFilteredUsersChange(filteredUsers);
    }
  }, [filteredUsers, onFilteredUsersChange]);

  const hasFilters = generalSearch || agentIdSearch || adminIdSearch;

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search username, phone, role, invited by…"
            value={generalSearch}
            onChange={(e) => setGeneralSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" sx={{ fontSize: "1.125rem" }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Agent ID"
            value={agentIdSearch}
            onChange={(e) => setAgentIdSearch(e.target.value)}
          />
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Admin ID"
            value={adminIdSearch}
            onChange={(e) => setAdminIdSearch(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={12} md={4}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ md: "flex-end" }}>
            {hasFilters && (
              <Typography variant="caption" color="text.secondary">
                {filteredUsers?.length || 0} match(es)
              </Typography>
            )}
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                setGeneralSearch("");
                setAgentIdSearch("");
                setAdminIdSearch("");
              }}
              disabled={!hasFilters}
            >
              Clear
            </Button>
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportToCSV} disableElevation>
              Export CSV
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UsersTable;

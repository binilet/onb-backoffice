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
  useTheme,
  Avatar,
  Chip,
  alpha,
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
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  AccountBalanceWallet as WalletIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

import TransactionHistoryModal from "./TransactionHistoryModal";

const UsersTable = ({ users = [], handleEdit, handleTransactionhistory }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [open, setOpen] = useState(false);

  const [filteredUsers, setFilteredUsers] = useState(users);

  const handleFilteredUsers = (filtered) =>{
    setFilteredUsers(filtered);
  }

  const handleHistoryModal = async (user) => {
    await handleTransactionhistory(user);
    setOpen(true);
  };

  /*const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );*/
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );


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
    //console.log(user.createdAt);
    const createdDate = new Date(user.createdAt);
    return createdDate >= today;
  }).length;

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      {/* Summary Cards */}
      <SummaryCards
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        inactiveUsers={inactiveUsers}
        totalHealthyCredit={totalHealthyCredit}
        totalUnhealthyCredit={totalUnhealthyCredit}
        newUsers={newUsersCount}
      />

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
  const theme = useTheme();
  
  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      color: "primary",
      icon: <PersonIcon />,
      change: totalUsers !== 0 ? `${((totalUsers / totalUsers) * 100).toFixed(2)}%` : "0%",
      changeType: "positive",
    },
    {
      label: "Active Users",
      value: activeUsers,
      color: "success",
      icon: <CheckCircleIcon />,
      change: totalUsers !== 0 ? `${((activeUsers / totalUsers) * 100).toFixed(2)}%` : "0%",
      changeType: "positive",
    },
    {
      label: "Inactive Users",
      value: inactiveUsers,
      color: "error",
      icon: <CancelIcon />,
      change: totalUsers !== 0 ? `${((inactiveUsers / totalUsers) * 100).toFixed(2)}%` : "0%",
      changeType: "negative",
    },
    {
      label: "Healthy Credit",
      value: `$${totalHealthyCredit?.toLocaleString() || "0"}`,
      color: "success",
      icon: <MonetizationOnIcon />,
      change: totalUnhealthyCredit + totalHealthyCredit !== 0
        ? `${((totalHealthyCredit / (totalUnhealthyCredit + totalHealthyCredit)) * 100).toFixed(2)}%`
        : "0%",
      changeType: "positive",
    },
    {
      label: "Unhealthy Credit",
      value: `$${totalUnhealthyCredit?.toLocaleString() || "0"}`,
      color: "warning",
      icon: <MoneyOffIcon />,
      change: totalUnhealthyCredit + totalHealthyCredit !== 0
        ? `${((totalUnhealthyCredit / (totalUnhealthyCredit + totalHealthyCredit)) * 100).toFixed(2)}%`
        : "0%",
      changeType: "negative",
    },
    {
      label: "New Users",
      value: `${newUsers?.toLocaleString() || "0"}`,
      color: "primary",
      icon: <NewIcon />,
      change: totalUsers !== 0 ? `${((newUsers / totalUsers) * 100).toFixed(2)}%` : "0%",
      changeType: "positive",
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: theme.palette.background.paper,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette[stat.color].main, 0.1)}`,
                borderColor: alpha(theme.palette[stat.color].main, 0.2),
              },
            }}
          >
            <CardContent sx={{ p: 2 }}>
              {/* Header with icon and change indicator */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    backgroundColor: alpha(theme.palette[stat.color].main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.palette[stat.color].main,
                    '& svg': {
                      fontSize: 18,
                    },
                  }}
                >
                  {stat.icon}
                </Box>
                
                <Chip
                  size="small"
                  label={stat.change}
                  sx={{
                    height: 20,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: alpha(
                      stat.changeType === 'positive' 
                        ? theme.palette.success.main 
                        : theme.palette.error.main, 
                      0.1
                    ),
                    color: stat.changeType === 'positive' 
                      ? theme.palette.success.main 
                      : theme.palette.error.main,
                    border: 'none',
                    '& .MuiChip-label': {
                      px: 1,
                    },
                  }}
                />
              </Box>

              {/* Value */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 0.5,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  lineHeight: 1.2,
                }}
              >
                {stat.value}
              </Typography>

              {/* Label */}
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  lineHeight: 1.2,
                }}
              >
                {stat.label}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
const UserList = ({ users, handleEdit, handleHistoryModal,onFilteredUsersChange }) => {
  //const [users] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Get new users (created today)
  const newUsers = useMemo(() => {
    return filteredUsers.filter((user) => {
      const createdDate = new Date(user.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate.getTime() === today.getTime();
    });
  }, [filteredUsers, today]);

  // Get current tab data
  const currentTabData = activeTab === 0 ? filteredUsers : newUsers;

  // Paginate the current tab data
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
    setPage(0); // Reset page when changing tabs
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset page when searching
  };



  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "error";
      case "agent":
        return "warning";
      case "user":
        return "info";
      default:
        return "default";
    }
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance);
  };

  const exportToCSV = () => {
    const currentData = activeTab === 0 ? filteredUsers : newUsers;

    // CSV headers
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

    // Convert data to CSV format
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

    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    // Create and download file
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
  };

   
  const handleFilteredUsersChange = (filtered) => {
    setFilteredUsers(filtered);
    onFilteredUsersChange(filtered);
  };

  return (
    <Box sx={{ p: 3, bgcolor: "grey.50", minHeight: "100vh" }}>
      <Card
        elevation={0}
        sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Search Bar */}
           <SearchBarComponent
            users={users}
            onFilteredUsersChange={handleFilteredUsersChange}
            exportToCSV={exportToCSV}
          />

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 500,
                },
              }}
            >
              <Tab
                label={
                  // <Badge
                  //   badgeContent={filteredUsers.length}
                  //   color="primary"
                  //   sx={{ '& .MuiBadge-badge': { right: -12 } }}
                  // >
                  <>All Users</>
                }
                sx={{ marginRight: 4 }}
              />
              <Tab
                label={
                  // <Badge
                  //   badgeContent={newUsers.length}
                  //   color="success"
                  //   sx={{ '& .MuiBadge-badge': { right: -12 } }}
                  // >
                  <>New Users</>
                }
              />
            </Tabs>
          </Box>

          {/* Table */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: "grey.200",
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    User
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    Contact
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    Role
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    Agent ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    Admin ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    Balance
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    Promo Balance
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    Invited By
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                    Status
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, color: "text.primary" }}
                    align="center"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <TableRow
                      key={user._id}
                      hover
                      sx={{
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                        "&:last-child td": { border: 0 },
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            sx={{
                              bgcolor: "primary.light",
                              width: 40,
                              height: 40,
                              fontSize: "1rem",
                            }}
                          >
                            {user.username?.charAt(0).toUpperCase() || "U"}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {user.username}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ID: {user._id}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">{user.phone}</Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={user.role}
                          color={getRoleColor(user.role)}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {user.agentId}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {user.adminId}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          color={
                            user.current_balance >= 0
                              ? "success.main"
                              : "error.main"
                          }
                        >
                          {user.current_balance >= 0 ? "+" : ""}
                          {formatBalance(user.current_balance)} birr
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          color={
                            user.current_balance >= 0
                              ? "success.main"
                              : "error.main"
                          }
                        >
                          {user.current_balance >= 0 ? "+" : ""}
                          {formatBalance(user.promo_balance)} birr
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {user?.invitedBy || 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={user.isActive ? "Active" : "Inactive"}
                          color={user.isActive ? "success" : "error"}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          <Tooltip title="Edit User">
                            <IconButton
                              onClick={() => handleEdit(user)}
                              size="small"
                              sx={{
                                color: "primary.main",
                                "&:hover": { bgcolor: "primary.lighter" },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View History">
                            <IconButton
                              onClick={() => handleHistoryModal(user)}
                              size="small"
                              sx={{
                                color: "info.main",
                                "&:hover": { bgcolor: "info.lighter" },
                              }}
                            >
                              <HistoryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        {searchQuery
                          ? "No users found matching your search criteria"
                          : "No users found"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={currentTabData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              borderTop: "1px solid",
              borderColor: "grey.200",
              mt: 0,
              "& .MuiTablePagination-toolbar": {
                px: 2,
                py: 1,
              },
            }}
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState(0);

  const handleGeneralSearchChange = (event) => {
    setGeneralSearch(event.target.value);
    setPage(0); // Reset page when searching
  };

  const handleAgentIdSearchChange = (event) => {
    setAgentIdSearch(event.target.value);
    setPage(0); // Reset page when searching
  };

  const handleAdminIdSearchChange = (event) => {
    setAdminIdSearch(event.target.value);
    setPage(0); // Reset page when searching
  };

  // Filter users based on all search queries
  const filteredUsers = useMemo(() => {
    return users?.filter((user) => {
      // General search (username, phone, role, invitedBy)
      const matchesGeneral = !generalSearch || 
        user.username?.toLowerCase().includes(generalSearch.toLowerCase()) ||
        user.phone?.toLowerCase().includes(generalSearch.toLowerCase()) ||
        user.role?.toLowerCase().includes(generalSearch.toLowerCase()) ||
        user.invitedBy?.toLowerCase().includes(generalSearch.toLowerCase());

      // Agent ID search
      const matchesAgentId = !agentIdSearch || 
        user.agentId?.toLowerCase().includes(agentIdSearch.toLowerCase());

      // Admin ID search
      const matchesAdminId = !adminIdSearch || 
        user.adminId?.toLowerCase().includes(adminIdSearch.toLowerCase());

      return matchesGeneral && matchesAgentId && matchesAdminId;
    });
  }, [users, generalSearch, agentIdSearch, adminIdSearch]);

  // Call the callback when filtered users change
  React.useEffect(() => {
    if (onFilteredUsersChange) {
      onFilteredUsersChange(filteredUsers);
    }
  }, [filteredUsers, onFilteredUsersChange]);

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        {/* General Search */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            variant="outlined"
            size="medium"
            placeholder="Search by username, phone, role, invited by..."
            value={generalSearch}
            onChange={handleGeneralSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        {/* Agent ID Search */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            variant="outlined"
            size="medium"
            placeholder="Search by agent ID"
            value={agentIdSearch}
            onChange={handleAgentIdSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        {/* Admin ID Search */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            variant="outlined"
            size="medium"
            placeholder="Search by admin ID"
            value={adminIdSearch}
            onChange={handleAdminIdSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        {/* Export Button */}
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportToCSV}
            sx={{
              bgcolor: 'success.main',
              '&:hover': {
                bgcolor: 'success.dark',
              },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              height: '56px', // Match TextField height
            }}
          >
            Export to CSV
          </Button>
        </Grid>
      </Grid>

      {/* Search Results Summary */}
      {(generalSearch || agentIdSearch || adminIdSearch) && (
        <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            Found {filteredUsers?.length || 0} user(s)
            {generalSearch && ` matching "${generalSearch}"`}
            {agentIdSearch && ` with agent ID "${agentIdSearch}"`}
            {adminIdSearch && ` with admin ID "${adminIdSearch}"`}
            {(generalSearch || agentIdSearch || adminIdSearch) && (
              <Button
                size="small"
                onClick={() => {
                  setGeneralSearch("");
                  setAgentIdSearch("");
                  setAdminIdSearch("");
                }}
                sx={{ ml: 1, textTransform: 'none', fontSize: '0.75rem' }}
              >
                Clear all
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};
export default UsersTable;

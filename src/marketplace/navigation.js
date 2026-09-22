import StoreOutlined from "@mui/icons-material/StoreOutlined";
import SportsEsportsOutlined from "@mui/icons-material/SportsEsportsOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import SavingsOutlined from "@mui/icons-material/SavingsOutlined";
import AccountBalanceWalletOutlined from "@mui/icons-material/AccountBalanceWalletOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";

export const MARKETPLACE_ROLES = ["system", "agent", "subagent", "admin", "cashier"];

export const navigationGroups = [
  {
    label: "Shop management",
    items: [
      {
        label: "Shops",
        to: "/marketplace/shops",
        icon: StoreOutlined,
        roles: ["system", "agent", "subagent"],
        ready: true,
      },
      {
        label: "Staff",
        to: "/marketplace/staff",
        icon: GroupsOutlined,
        roles: ["system", "agent", "subagent", "admin"],
        ready: true,
      },
    ],
  },
  {
    label: "Balances",
    items: [
      {
        label: "Shop balance",
        to: "/marketplace/shop-balance",
        icon: SavingsOutlined,
        roles: ["system", "agent", "subagent", "admin", "cashier"],
        ready: true,
      },
      {
        label: "Player room wallets",
        to: "/marketplace/player-room-wallets",
        icon: AccountBalanceWalletOutlined,
        roles: ["system", "agent", "subagent", "admin", "cashier"],
        ready: true,
      },
    ],
  },
  {
    label: "Games",
    items: [
      {
        label: "Games",
        to: "/marketplace/games",
        icon: SportsEsportsOutlined,
        roles: ["system", "agent", "subagent", "admin", "cashier"],
        ready: true,
      },
    ],
  },
  {
    label: "Audit",
    items: [
      {
        label: "Action log",
        to: "/marketplace/action-log",
        icon: FactCheckOutlined,
        roles: ["system", "agent", "subagent", "admin", "cashier"],
        ready: true,
      },
    ],
  },
];

export function getPreviewUser(search = "") {
  if (!import.meta.env.DEV) return null;
  const requestedRole = new URLSearchParams(search).get("role");
  const role = requestedRole === null ? "system" : requestedRole;
  if (!MARKETPLACE_ROLES.includes(role)) return null;
  console.log(`Marketplace preview user: ${role}-01`);
  return { role, user_id: `${role}-01` };
}

export function navigationFor(role) {
  console.log(`Marketplace navigation for role: ${role}`);
  return navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => role && item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);
}

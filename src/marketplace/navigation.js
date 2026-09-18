import StoreOutlined from '@mui/icons-material/StoreOutlined';
import SportsEsportsOutlined from '@mui/icons-material/SportsEsportsOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import SavingsOutlined from '@mui/icons-material/SavingsOutlined';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import PointOfSaleOutlined from '@mui/icons-material/PointOfSaleOutlined';
import InsightsOutlined from '@mui/icons-material/InsightsOutlined';
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined';

export const MARKETPLACE_ROLES = ['super', 'agent', 'owner', 'admin', 'cashier'];

export const navigation = [
  { label: 'Shops', to: '/marketplace/shops', icon: StoreOutlined, roles: ['system', 'agent'], ready: true },
  { label: 'Shop games', to: '/marketplace/shop-games', icon: SportsEsportsOutlined, roles: ['system', 'agent'], ready: true },
  { label: 'Staff', to: null, icon: GroupsOutlined, roles: ['system', 'agent', 'owner', 'admin'], ready: true },
  { label: 'Platform allowance', to: null, icon: SavingsOutlined, roles: ['system', 'agent'], ready: true },
  { label: 'Shop withdrawals', to: null, icon: AccountBalanceWalletOutlined, roles: ['system', 'agent', 'owner'], ready: true },
  { label: 'Cash top-up', to: null, icon: PointOfSaleOutlined, roles: ['cashier', 'admin', 'owner'], ready: true },
  { label: 'Reports', to: null, icon: InsightsOutlined, roles: ['system', 'agent', 'owner'], ready: true },
  { label: 'Action logs', to: null, icon: ReceiptLongOutlined, roles: ['super'], ready: true },
];

export function getPreviewUser(search = '') {
  if (!import.meta.env.DEV) return null;
  const requestedRole = new URLSearchParams(search).get('role');
  const role = requestedRole === null ? 'system' : requestedRole;
  if (!MARKETPLACE_ROLES.includes(role)) return null;
  console.log(`Marketplace preview user: ${role}-01`);
  return { role, user_id: `${role}-01` };
}

export function navigationFor(role) {
  console.log(`Marketplace navigation for role: ${role}`);
  return navigation.filter((item) => role && item.roles.includes(role));
}

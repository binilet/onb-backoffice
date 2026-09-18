export const systemUsers = [
  { user_id: 'super-01', username: 'natnael', role: 'super' },
  { user_id: 'agent-01', username: 'abebe', role: 'agent' },
  { user_id: 'agent-02', username: 'selam', role: 'agent' },
  { user_id: 'owner-01', username: 'dawit', role: 'owner' },
  { user_id: 'owner-02', username: 'hiwot', role: 'owner' },
  { user_id: 'owner-03', username: 'yonas', role: 'owner' },
  { user_id: 'owner-04', username: 'mekdes', role: 'owner' },
  { user_id: 'cashier-01', username: 'tigu', role: 'cashier' },
  { user_id: 'cashier-02', username: 'bontu', role: 'cashier' },
  { user_id: 'cashier-03', username: 'kalkidan', role: 'cashier' },
];

export const shops = [
  {
    shop_id: 'shop-01', ownerId: 'owner-01', agentId: 'agent-01', shopName: 'Bole',
    address: 'Bole Road, Addis Ababa', isActive: true, banUntil: null, superLock: false,
    superBanUntil: null, note: '', createdAt: '2026-01-12T08:30:00.000Z', updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    shop_id: 'shop-02', ownerId: 'owner-02', agentId: 'agent-01', shopName: 'Arada',
    address: 'Adwa Square, Addis Ababa', isActive: true, banUntil: null, superLock: false,
    superBanUntil: null, note: '', createdAt: '2026-02-03T09:15:00.000Z', updatedAt: '2026-09-10T14:20:00.000Z',
  },
  {
    shop_id: 'shop-03', ownerId: 'owner-02', agentId: 'agent-02', shopName: 'Merkato',
    address: 'Merkato Market, Addis Ababa', isActive: false, banUntil: '2026-10-01T00:00:00.000Z',
    superLock: false, superBanUntil: null, note: 'Late settlement', createdAt: '2026-03-20T11:45:00.000Z',
    updatedAt: '2026-09-14T16:05:00.000Z',
  },
  {
    shop_id: 'shop-04', ownerId: 'owner-03', agentId: null, shopName: 'CMC',
    address: 'CMC Road, Addis Ababa', isActive: true, banUntil: null, superLock: true,
    superBanUntil: null, note: 'Under review', createdAt: '2026-05-08T07:20:00.000Z',
    updatedAt: '2026-09-15T09:40:00.000Z',
  },
  {
    shop_id: 'shop-05', ownerId: 'owner-04', agentId: 'agent-02', shopName: 'Saris',
    address: 'Saris, Addis Ababa', isActive: true, banUntil: null, superLock: false,
    superBanUntil: null, note: '', createdAt: '2026-06-17T13:10:00.000Z', updatedAt: '2026-09-12T12:00:00.000Z',
  },
];

export const branches = [
  { branch_id: 'branch-01', shopId: 'shop-01', branchName: 'Atlas', address: 'Bole Road, Addis Ababa', isActive: true, banUntil: null, superLock: false, superBanUntil: null, note: '', createdAt: '2026-01-12T08:40:00.000Z', updatedAt: '2026-09-01T10:00:00.000Z' },
  { branch_id: 'branch-02', shopId: 'shop-01', branchName: 'Medhanialem', address: 'Medhanialem, Addis Ababa', isActive: true, banUntil: null, superLock: false, superBanUntil: null, note: '', createdAt: '2026-01-12T08:45:00.000Z', updatedAt: '2026-09-01T10:00:00.000Z' },
  { branch_id: 'branch-03', shopId: 'shop-02', branchName: 'Piazza', address: 'Piazza, Addis Ababa', isActive: true, banUntil: null, superLock: false, superBanUntil: null, note: '', createdAt: '2026-02-03T09:30:00.000Z', updatedAt: '2026-09-10T14:20:00.000Z' },
];

export const rooms = [
  { room_id: 'room-01', branchId: 'branch-01', roomName: 'Atlas 01', qrCodeSlug: 'atlas-01', isActive: true, createdByUserId: 'cashier-01', createdAt: '2026-01-15T09:00:00.000Z', updatedAt: '2026-09-01T10:00:00.000Z' },
  { room_id: 'room-02', branchId: 'branch-02', roomName: 'Medhanialem 01', qrCodeSlug: 'medhanialem-01', isActive: true, createdByUserId: 'cashier-02', createdAt: '2026-01-15T09:05:00.000Z', updatedAt: '2026-09-01T10:00:00.000Z' },
  { room_id: 'room-03', branchId: 'branch-03', roomName: 'Piazza 01', qrCodeSlug: 'piazza-01', isActive: true, createdByUserId: 'cashier-03', createdAt: '2026-02-05T10:00:00.000Z', updatedAt: '2026-09-10T14:20:00.000Z' },
];

export const shopGames = Array.from({ length: 12 }, (_, index) => ({
  game_id: `SG-${String(1048 - index)}`,
  roomId: rooms[index % rooms.length].room_id,
  betAmount: [50, 100, 20][index % 3],
  cutPercent: 15,
  totalWinning: [425, 850, 170][index % 3],
  cashierId: `cashier-0${index % 3 + 1}`,
  startedAt: new Date(Date.UTC(2026, 8, 17, 11, 40 - index * 20)).toISOString(),
  endedAt: new Date(Date.UTC(2026, 8, 17, 11, 52 - index * 20)).toISOString(),
  createdAt: new Date(Date.UTC(2026, 8, 17, 11, 39 - index * 20)).toISOString(),
}));

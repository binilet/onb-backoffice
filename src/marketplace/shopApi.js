import axios from "axios";

const shopApi = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL,
});

shopApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

shopApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && sessionStorage.getItem("token")) {
      sessionStorage.removeItem("token");
      if (window.location.pathname !== "/login")
        window.location.replace("/login?expired=1");
    }
    return Promise.reject(error);
  },
);

export async function getShops() {
  const response = await shopApi.get("/shop/shops");
  return response.data;
}

export async function getSiteMedia() {
  return (await shopApi.get('/admin/site-media')).data;
}
export async function uploadSiteMedia(formData) {
  return (await shopApi.post('/admin/site-media', formData)).data;
}
export async function updateSiteMedia(id, payload) {
  return (await shopApi.patch(`/admin/site-media/${id}`, payload)).data;
}
export async function deleteSiteMedia(id) {
  return (await shopApi.delete(`/admin/site-media/${id}`)).data;
}
export async function resetSiteMedia(slot) {
  return (await shopApi.post(`/admin/site-media/slots/${slot}/reset`)).data;
}

export async function getStaff() {
  const response = await shopApi.get("/shop/staff");
  return response.data;
}

export async function createStaff(payload) {
  const response = await shopApi.post("/shop/staff", payload);
  return response.data;
}

export async function updateStaff(phone, payload) {
  const response = await shopApi.patch(`/shop/staff/${phone}`, payload);
  return response.data;
}

export async function createShop(payload) {
  const response = await shopApi.post("/shop/shops", payload);
  return response.data;
}

export async function updateShop(shopId, payload) {
  const response = await shopApi.patch(`/shop/shops/${shopId}`, payload);
  return response.data;
}

export async function deleteShop(shopId) {
  await shopApi.delete(`/shop/shops/${shopId}`);
}

export async function getBranches() {
  const response = await shopApi.get("/shop/branches");
  return response.data;
}

export async function createBranch(shopId, payload) {
  const response = await shopApi.post(
    `/shop/shops/${shopId}/branches`,
    payload,
  );
  return response.data;
}

export async function updateBranch(branchId, payload) {
  const response = await shopApi.patch(`/shop/branches/${branchId}`, payload);
  return response.data;
}

export async function deleteBranch(branchId) {
  await shopApi.delete(`/shop/branches/${branchId}`);
}

export async function getShopBalance(phone) {
  const response = await shopApi.get(`/shop/balances/${phone}`);
  return response.data;
}

export async function getShopBalanceLedgers(params) {
  const response = await shopApi.get("/shop/balance-ledgers", { params });
  return response.data;
}

export async function transferShopBalance(payload) {
  const response = await shopApi.post("/shop/balances/transfers", payload);
  return response.data;
}

export async function getPlayerRoomWallet(playerPhone, params) {
  const response = await shopApi.get(
    `/shop/player-room-wallets/${playerPhone}`,
    { params },
  );
  return response.data;
}

export async function getPlayerRoomWalletLedgers(playerPhone, params) {
  const response = await shopApi.get(
    `/shop/player-room-wallets/${playerPhone}/ledgers`,
    { params },
  );
  return response.data;
}

export async function topUpPlayerRoomWallet(payload) {
  const response = await shopApi.post(
    "/shop/player-room-wallets/topups",
    payload,
  );
  return response.data;
}
export async function getPlayerRoomDeposits(params = {}) {
  return (await shopApi.get("/shop/player-room-deposits", { params: { status: "PENDING", ...params } })).data;
}
export async function decidePlayerRoomDeposit(depositId, payload) {
  return (await shopApi.patch(`/shop/player-room-deposits/${depositId}`, payload)).data;
}
export async function getPlayerRoomWithdrawals(params = {}) { return (await shopApi.get("/shop/player-room-withdrawals", { params: { status: "PENDING", ...params } })).data; }
export async function disbursePlayerRoomWithdrawal(withdrawalId) { return (await shopApi.patch(`/shop/player-room-withdrawals/${withdrawalId}/disburse`)).data; }

export async function getPlayerRoomWallets(params = {}) {
  const response = await shopApi.get("/shop/player-room-wallets", { params });
  return response.data;
}

export async function getGames(params) {
  return (await shopApi.get("/shop/games", { params })).data;
}
export async function createGame(payload) {
  return (await shopApi.post("/shop/games", payload)).data;
}
export async function updateGame(gameId, payload) {
  return (await shopApi.patch(`/shop/games/${gameId}`, payload)).data;
}
export async function getGameParticipants(gameId) {
  return (await shopApi.get(`/shop/games/${gameId}/participants`)).data;
}
export async function updateGameLifecycle(gameId, action) {
  return (await shopApi.patch(`/shop/games/${gameId}/lifecycle`, { action }))
    .data;
}
export async function getActionLogs(params) {
  return (await shopApi.get("/shop/action-logs", { params })).data;
}

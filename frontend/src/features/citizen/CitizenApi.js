import api from '../../api/apiClient';

export const createPickup = async (payload) => {
  const res = await api.post('/pickups', payload);
  return res.data;
};

export const fetchCitizenPickups = async () => {
  // Fetch pickups for the authenticated user
  const res = await api.get('/pickups');
  return res.data;
};

export const fetchIncentives = async (userId = 'me') => {
  // Fetch incentives for current user or specific user
  const res = await api.get(`/incentives/${userId}`);
  return res.data;
};

export const cancelPickupRequest = async (id) => {
  const res = await api.patch(`/pickups/${id}/cancel`);
  return res.data;
};


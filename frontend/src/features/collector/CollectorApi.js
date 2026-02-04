import api from '../../api/apiClient';

export const fetchShiftPickups = async () => {
  // Fetch all pickups (pending, assigned, completed) for the ward
  const res = await api.get('/pickups');
  return res.data;
};

export const generateRoute = async () => {
  const res = await api.get('/route');
  return res.data;
};

export const verifySegregation = async (id, data) => {
  const res = await api.patch(`/pickups/${id}/verify`, data);
  return res.data;
};

export const completePickup = async (id) => {
  const res = await api.patch(`/pickups/${id}/complete`);
  return res.data;
};


import api from './api';

export async function getNotifications() {
  const res = await api.get('/notifications');
  return res.data;
}

export async function getUnreadCount() {
  const res = await api.get('/notifications/unread-count');
  return res.data?.unreadCount || 0;
}

export async function markAsRead(id) {
  const res = await api.put(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllAsRead() {
  const res = await api.put('/notifications/read-all');
  return res.data;
}
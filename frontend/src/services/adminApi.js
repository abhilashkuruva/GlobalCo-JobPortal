import api from './api';

export async function getAdminStats() {
  const res = await api.get('/admin/stats');
  return res.data;
}

export async function getRecruiterRequests(status) {
  const params = status ? { status } : {};
  const res = await api.get('/admin/recruiter-requests', { params });
  return res.data;
}

export async function getRecruiterRequestById(id) {
  const res = await api.get(`/admin/recruiter-requests/${id}`);
  return res.data;
}

export async function approveRecruiterRequest(id) {
  const res = await api.post(`/admin/recruiter-requests/${id}/approve`);
  return res.data;
}

export async function rejectRecruiterRequest(id, reason) {
  const res = await api.post(`/admin/recruiter-requests/${id}/reject`, { reason });
  return res.data;
}

export async function downloadVerificationDocument(type, fileName) {
  const encoded = encodeURIComponent(fileName);
  const res = await api.get(`/admin/recruiter-requests/document/${type}/${encoded}`, {
    responseType: 'blob'
  });
  const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

export async function getAllRecruiters() {
  const res = await api.get('/admin/recruiters');
  return res.data;
}

export async function getAllJobSeekers() {
  const res = await api.get('/admin/job-seekers');
  return res.data;
}

export async function getAllUsers() {
  const res = await api.get('/admin/users');
  return res.data;
}

export async function toggleUserStatus(userId) {
  const res = await api.put(`/admin/users/${userId}/toggle-status`);
  return res.data;
}

export async function getAllJobs() {
  const res = await api.get('/admin/jobs');
  return res.data;
}

export async function approveJob(jobId) {
  const res = await api.patch(`/admin/jobs/${jobId}/approve`);
  return res.data;
}

export async function rejectJob(jobId, reason) {
  const res = await api.patch(`/admin/jobs/${jobId}/reject`, { reason });
  return res.data;
}

export async function moderateDeleteJob(jobId) {
  const res = await api.delete(`/admin/jobs/${jobId}`);
  return res.data;
}

export async function getAuditLogs() {
  const res = await api.get('/admin/logs');
  return res.data;
}

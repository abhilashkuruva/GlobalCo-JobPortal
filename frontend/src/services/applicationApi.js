import api from './api';

export async function getApplicationsByCandidate(page = 0, size = 20) {
  const res = await api.get('/applications/my-applications', {
    params: { page, size }
  });
  return res.data;
}

export async function getApplicationById(id) {
  const res = await api.get(`/applications/${id}`);
  return res.data;
}

export async function applyJob(jobId) {
  const res = await api.post(`/jobs/${jobId}/apply`);
  return res.data;
}

export async function withdrawApplication(id) {
  const res = await api.post(`/applications/${id}/withdraw`);
  return res.data;
}

export async function respondToOffer(offerId, status) {
  const res = await api.put(`/offers/${offerId}/respond`, { status });
  return res.data;
}

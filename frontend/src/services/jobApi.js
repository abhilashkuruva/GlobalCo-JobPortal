import api from './api';

export async function getPublishedJobs({
  page = 0,
  size = 10,
  keyword,
  location,
  minExp,
  workMode,
  category,
  sort = 'createdAt,desc'
} = {}) {
  const params = { page, size, sort };
  if (keyword) params.keyword = keyword;
  if (location) params.location = location;
  if (minExp !== undefined && minExp !== null && minExp !== '') params.minExp = minExp;
  if (workMode) params.workMode = workMode;
  if (category) params.category = category;

  const res = await api.get('/jobs', { params });
  return res.data;
}

export async function getJobById(jobId) {
  const res = await api.get(`/jobs/${jobId}`);
  return res.data;
}

export async function getJobMatchScore(jobId) {
  try {
    const res = await api.get(`/jobs/${jobId}/match`);
    return res.data;
  } catch (err) {
    return null;
  }
}

export async function applyToJob(jobId) {
  const res = await api.post(`/jobs/${jobId}/apply`);
  return res.data;
}

export async function applyToJobWithDetails(formData) {
  const res = await api.post('/applications/apply', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function saveJob(jobId) {
  const res = await api.post(`/saved-jobs/${jobId}`);
  return res.data;
}

export async function unsaveJob(jobId) {
  const res = await api.delete(`/saved-jobs/${jobId}`);
  return res.data;
}

export async function getSavedJobs() {
  const res = await api.get('/saved-jobs');
  return res.data;
}

export async function getSavedJobIds() {
  try {
    const res = await api.get('/saved-jobs/ids');
    return new Set(res.data);
  } catch {
    return new Set();
  }
}
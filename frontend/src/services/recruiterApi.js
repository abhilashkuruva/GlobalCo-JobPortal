import api from './api';

export async function postJob(jobData) {
  const res = await api.post('/recruiter/jobs', jobData);
  return res.data;
}

export async function updateJob(id, jobData) {
  const res = await api.put(`/recruiter/jobs/${id}`, jobData);
  return res.data;
}

export async function deleteJob(id) {
  const res = await api.delete(`/recruiter/jobs/${id}`);
  return res.data;
}

export async function getMyJobs(page = 0, size = 20) {
  const res = await api.get('/recruiter/my-jobs', {
    params: { page, size }
  });
  return res.data;
}

export async function getJobApplicants(jobId) {
  const res = await api.get(`/recruiter/jobs/${jobId}/applicants`);
  return res.data;
}

export async function getApplicantResume(appId) {
  const res = await api.get(`/recruiter/applications/${appId}/resume`, {
    responseType: 'blob'
  });
  return res.data;
}

export async function updateApplicantStatus(appId, status) {
  const res = await api.put(`/recruiter/applications/${appId}/status`, { status });
  return res.data;
}

export async function updateApplicantNotes(appId, notes) {
  const res = await api.put(`/recruiter/applications/${appId}/notes`, { notes });
  return res.data;
}

export async function bulkUpdateApplicantStatus(ids, status) {
  const res = await api.put('/recruiter/applications/bulk-status', { ids, status });
  return res.data;
}

export async function exportApplicantsCsv(jobId) {
  const res = await api.get(`/recruiter/jobs/${jobId}/export-applicants`, {
    responseType: 'blob'
  });
  return res.data;
}

export async function downloadApplicationsZip(jobId) {
  const res = await api.get(`/recruiter/jobs/${jobId}/applications/export`, {
    responseType: 'blob'
  });
  return res.data;
}

export async function downloadApplicationsExcel(jobId) {
  const res = await api.get(`/recruiter/jobs/${jobId}/applications/export-excel`, {
    responseType: 'blob'
  });
  return res.data;
}

export async function scheduleInterview(interviewData) {
  const res = await api.post('/interviews/schedule', interviewData);
  return res.data;
}

export async function getInterviews(applicationId) {
  const res = await api.get(`/interviews/application/${applicationId}`);
  return res.data;
}

export async function submitInterviewFeedback(interviewId, feedback, score) {
  const res = await api.put(`/interviews/${interviewId}/feedback`, { feedback, score });
  return res.data;
}

export async function createOffer(offerData) {
  const res = await api.post('/offers', offerData);
  return res.data;
}

export async function getOffer(applicationId) {
  const res = await api.get(`/offers/application/${applicationId}`);
  return res.data;
}

export async function getRecruiterStats() {
  const res = await api.get('/analytics/recruiter');
  return res.data;
}

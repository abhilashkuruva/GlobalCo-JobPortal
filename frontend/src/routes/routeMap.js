/**
 * Centralized Route Definitions for GlobalCo JobBoard
 */
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  JOBS: '/jobs',
  JOB_DETAILS: (jobId = ':jobId') => `/jobs/${jobId}`,

  // Candidate Exclusive
  CANDIDATE_DASHBOARD: '/candidate/dashboard',
  SAVED_JOBS: '/saved-jobs',
  APPLICATIONS: '/applications',

  // Recruiter Exclusive
  RECRUITER_DASHBOARD: '/recruiter/dashboard',
  POST_JOB: '/recruiter/post-job',
  APPLICANT_TRACKING: (jobId = ':jobId') => `/recruiter/jobs/${jobId}/applicants`,

  // Admin Exclusive
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_JOB_SEEKERS: '/admin/jobseeker',

  // Shared Authenticated
  PROFILE: '/profile',
};

export default ROUTES;

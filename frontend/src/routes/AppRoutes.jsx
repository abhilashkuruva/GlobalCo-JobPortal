import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ROUTES from './routeMap';
import HomePage from '../pages/Home/HomePage';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import JobSearchPage from '../pages/Jobs/JobSearchPage';
import JobDetailsPage from '../pages/Jobs/JobDetailsPage';
import CandidateDashboardPage from '../pages/Candidate/CandidateDashboardPage';
import SavedJobsPage from '../pages/Candidate/SavedJobsPage';
import RecruiterDashboardPage from '../pages/Recruiter/RecruiterDashboardPage';
import PostJobPage from '../pages/Recruiter/PostJobPage';
import ApplicantTrackingPage from '../pages/Recruiter/ApplicantTrackingPage';
import AdminDashboardPage from '../pages/Admin/AdminDashboardPage';
import AdminJobSeekerPage from '../pages/Admin/AdminJobSeekerPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import ApplicationsPage from '../pages/Applications/ApplicationsPage';
import RequireAuth from '../routes/RequireAuth';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.JOBS} element={<JobSearchPage />} />
      <Route path={ROUTES.JOB_DETAILS()} element={<JobDetailsPage />} />

      {/* Candidate Protected Routes (Strictly CANDIDATE role) */}
      <Route
        path={ROUTES.CANDIDATE_DASHBOARD}
        element={
          <RequireAuth allowedRoles={['CANDIDATE']}>
            <CandidateDashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.SAVED_JOBS}
        element={
          <RequireAuth allowedRoles={['CANDIDATE']}>
            <SavedJobsPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.APPLICATIONS}
        element={
          <RequireAuth allowedRoles={['CANDIDATE']}>
            <ApplicationsPage />
          </RequireAuth>
        }
      />

      {/* Recruiter Protected Routes (Strictly RECRUITER role) */}
      <Route
        path={ROUTES.RECRUITER_DASHBOARD}
        element={
          <RequireAuth allowedRoles={['RECRUITER']}>
            <RecruiterDashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.POST_JOB}
        element={
          <RequireAuth allowedRoles={['RECRUITER']}>
            <PostJobPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.APPLICANT_TRACKING()}
        element={
          <RequireAuth allowedRoles={['RECRUITER']}>
            <ApplicantTrackingPage />
          </RequireAuth>
        }
      />

      {/* Admin Protected Routes (Strictly ADMIN role) */}
      <Route
        path={ROUTES.ADMIN_DASHBOARD}
        element={
          <RequireAuth allowedRoles={['ADMIN']}>
            <AdminDashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.ADMIN_JOB_SEEKERS}
        element={
          <RequireAuth allowedRoles={['ADMIN']}>
            <AdminJobSeekerPage />
          </RequireAuth>
        }
      />

      {/* Profile: Accessible to authenticated users of any role */}
      <Route
        path={ROUTES.PROFILE}
        element={
          <RequireAuth allowedRoles={['CANDIDATE', 'RECRUITER', 'ADMIN']}>
            <ProfilePage />
          </RequireAuth>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}

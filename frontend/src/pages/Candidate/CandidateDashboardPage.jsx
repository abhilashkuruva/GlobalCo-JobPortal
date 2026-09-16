import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, Clock, CheckCircle2, TrendingUp, Bell, Search, 
  Bookmark, ChevronRight, UserCheck, ArrowRight 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getApplicationsByCandidate } from '../../services/applicationApi';
import { getNotifications } from '../../services/notificationApi';
import { getCandidateProfile } from '../../services/profileApi';

export default function CandidateDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [apps, notes, prof] = await Promise.all([
        getApplicationsByCandidate().catch(() => ({ content: [] })),
        getNotifications().catch(() => []),
        getCandidateProfile().catch(() => null)
      ]);
      setApplications(apps?.content || apps || []);
      setNotifications(notes || []);
      setProfile(prof);
    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const completionPct = profile?.profileCompletionPercentage || 0;

  const stats = [
    { label: 'Active Applications', count: applications.length, icon: <Briefcase size={22} />, color: 'bg-primary-light text-primary' },
    { label: 'Interviews Scheduled', count: applications.filter(a => a.status === 'INTERVIEW_SCHEDULED' || a.status === 'INTERVIEW').length, icon: <Clock size={22} />, color: 'bg-slate-100 text-dark' },
    { label: 'Offers Extended', count: applications.filter(a => a.status === 'OFFER_SENT' || a.status === 'OFFER_ACCEPTED').length, icon: <CheckCircle2 size={22} />, color: 'bg-primary-light text-primary' },
    { label: 'Profile Strength', count: `${completionPct}%`, icon: <TrendingUp size={22} />, color: 'bg-slate-100 text-dark' },
  ];

  return (
    <div className="py-6 sm:py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Candidate Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.fullName || user?.username || 'Candidate'}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Review your application pipeline, interview schedule, and recommended opportunities.
            </p>
          </div>
          <div className="flex gap-2.5">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium text-xs sm:text-sm shadow-sm transition-colors"
            >
              <Search size={14} /> Search Jobs
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-md flex items-center justify-center font-bold ${s.color}`}>
                  {s.icon}
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-0.5 tracking-tight">{s.count}</p>
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Applications</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Status updates from hiring teams</p>
                </div>
                <Link to="/applications" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                  View all ({applications.length}) <ChevronRight size={13} />
                </Link>
              </div>

              <div className="space-y-2.5">
                {loading && (
                  <div className="text-center py-8 text-slate-400 text-xs">Loading applications...</div>
                )}
                {!loading && applications.length === 0 && (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-md">
                    <p className="text-xs font-semibold text-slate-800 mb-1">No active job applications found.</p>
                    <p className="text-xs text-slate-500 mb-3">Explore open roles matching your skill set.</p>
                    <Link
                      to="/jobs"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Find Jobs →
                    </Link>
                  </div>
                )}
                {applications.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    onClick={() => navigate('/applications')}
                    className="flex items-center justify-between p-3 rounded-md border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-slate-100 text-slate-700 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {app.job?.companyName ? app.job.companyName[0].toUpperCase() : 'G'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-xs truncate">
                          {app.job?.title || 'Software Engineer'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {app.job?.companyName || 'Partner'} • {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                    <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 flex-shrink-0 border border-slate-200">
                      {app.status ? app.status.replace('_', ' ') : 'APPLIED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Profile Strength & Notifications */}
          <div className="space-y-6">
            {/* Profile Strength Card */}
            <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Profile Completeness
              </span>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-2xl font-bold text-slate-900">{completionPct}%</span>
                <span className="text-xs text-slate-500">Complete</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <p className="text-slate-500 text-xs mb-4 leading-relaxed">
                Add skills and update your profile details to improve job match accuracy.
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs py-2 rounded-md transition-colors border border-slate-200"
              >
                Edit Profile & Skills
              </button>
            </div>

            {/* Notifications Feed */}
            <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-sm">
                <Bell size={15} className="text-slate-500" />
                <h3>Recent Alerts</h3>
              </div>
              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2 text-center">No alerts at this time.</p>
                ) : (
                  notifications.slice(0, 4).map((n) => (
                    <div key={n.id} className="p-2.5 bg-slate-50 rounded-md border border-slate-100">
                      <p className="text-xs text-slate-800 leading-normal">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

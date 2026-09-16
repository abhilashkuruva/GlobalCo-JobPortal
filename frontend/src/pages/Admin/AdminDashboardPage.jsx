import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Users, Briefcase, FileCheck, CheckCircle2,
  XCircle, Trash2, Search, RefreshCw, Activity, AlertTriangle,
  UserCheck, UserX, Building2, Download, Eye, ChevronDown,
  Clock, FileText, ExternalLink, X, ThumbsDown, Image
} from 'lucide-react';
import api from '../../services/api';
import {
  getAdminStats, getAllUsers, toggleUserStatus,
  getAllJobs, moderateDeleteJob, getAuditLogs,
  getRecruiterRequests, approveRecruiterRequest, rejectRecruiterRequest,
  getAllRecruiters, getAllJobSeekers, approveJob, rejectJob
} from '../../services/adminApi';

const STATUS_COLORS = {
  PENDING:  'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PUBLISHED:'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-600 border-red-200',
  SUSPENDED:'bg-red-50 text-red-600 border-red-200',
  ACTIVE:   'bg-blue-50 text-blue-700 border-blue-200',
};

function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border ${cls}`}>
      {status || 'UNKNOWN'}
    </span>
  );
}

function RejectModal({ title, onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ThumbsDown size={15} className="text-red-500" /> {title}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded">
            <X size={16} />
          </button>
        </div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Rejection Reason <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Provide a reason for rejection..."
          className="w-full border border-slate-300 focus:border-red-400 rounded-md p-2 text-xs outline-none resize-none mb-4"
        />
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-slate-300 text-xs font-medium text-slate-700 rounded-md hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [recruiterRequests, setRecruiterRequests] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [jobSeekers, setJobSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [seekerSearch, setSeekerSearch] = useState('');
  const [rrFilter, setRrFilter] = useState('ALL');
  const [jobStatusFilter, setJobStatusFilter] = useState('ALL');
  const [message, setMessage] = useState({ text: '', type: 'success' });
  const [rejectTarget, setRejectTarget] = useState(null); // { type: 'request'|'job', id, label }
  const [approvingId, setApprovingId] = useState(null); // tracks which request is being approved
  const [docModal, setDocModal] = useState(null); // { title, fileName, url, isImage, isPdf }

  useEffect(() => { loadAllAdminData(); }, []);

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, jobsData, logsData, rrData, recruiterData, seekerData] =
        await Promise.allSettled([
          getAdminStats(),
          getAllUsers(),
          getAllJobs(),
          getAuditLogs(),
          getRecruiterRequests(),
          getAllRecruiters(),
          getAllJobSeekers(),
        ]);
      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (usersData.status === 'fulfilled') setUsers(usersData.value || []);
      if (jobsData.status === 'fulfilled') setJobs(jobsData.value || []);
      if (logsData.status === 'fulfilled') setLogs(logsData.value || []);
      if (rrData.status === 'fulfilled') setRecruiterRequests(rrData.value || []);
      if (recruiterData.status === 'fulfilled') setRecruiters(recruiterData.value || []);
      if (seekerData.status === 'fulfilled') setJobSeekers(seekerData.value || []);
    } catch (err) {
      console.error('Admin data load error', err);
    } finally {
      setLoading(false);
    }
  };

  const notify = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: 'success' }), 5000);
  };

  const handleOpenDocument = async (docPath, docName, type) => {
    try {
      const normalizedPath = docPath ? docPath.replace(/\\/g, '/') : '';
      const fileName = normalizedPath ? normalizedPath.split('/').pop() : docName;
      if (!fileName) {
        notify('Document name or path is not available.', 'error');
        return;
      }
      const endpoint = `/admin/recruiter-requests/document/${type}/${encodeURIComponent(fileName)}`;

      const res = await api.get(endpoint, { responseType: 'blob' });
      const rawContentType = res.headers['content-type'] || '';
      const isImg = rawContentType.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(fileName) || /\.(png|jpe?g|webp|gif)$/i.test(docName || '');
      const isPdf = rawContentType.includes('pdf') || /\.pdf$/i.test(fileName) || /\.pdf$/i.test(docName || '');
      const contentType = isPdf ? 'application/pdf' : (isImg ? (rawContentType || 'image/png') : 'application/octet-stream');
      const blob = new Blob([res.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      setDocModal({
        title: type === 'identity' ? 'Recruiter Identity Proof' : 'Company Incorporation Proof',
        fileName: docName || fileName,
        url: blobUrl,
        isImage: isImg,
        isPdf: isPdf
      });
    } catch (err) {
      console.error('Failed to view verification document', err);
      notify('Failed to view document. Ensure you are authorized as admin and the file exists on the server.', 'error');
    }
  };

  const closeDocModal = () => {
    if (docModal?.url) {
      window.URL.revokeObjectURL(docModal.url);
    }
    setDocModal(null);
  };

  // --- Recruiter Requests ---
  const handleApproveRequest = async (id) => {
    try {
      setApprovingId(id);
      await approveRecruiterRequest(id);
      setRecruiterRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
      notify('Recruiter approved successfully. Their account has been activated.');
      loadAllAdminData();
    } catch (err) {
      console.error('Approve error:', err);
      notify('Failed to approve recruiter request: ' + (err.response?.data?.message || err.message || 'Unknown error'), 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectRequest = async (reason) => {
    try {
      await rejectRecruiterRequest(rejectTarget.id, reason);
      setRecruiterRequests(prev => prev.map(r =>
        r.id === rejectTarget.id ? { ...r, status: 'REJECTED', rejectionReason: reason } : r
      ));
      notify('Recruiter request rejected.');
    } catch (err) {
      notify('Failed to reject request.', 'error');
    } finally {
      setRejectTarget(null);
    }
  };

  // --- Job Moderation ---
  const handleApproveJob = async (jobId) => {
    try {
      const updated = await approveJob(jobId);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: updated.status || 'APPROVED' } : j));
      notify('Job approved and is now live on the public feed.');
    } catch (err) {
      notify('Failed to approve job.', 'error');
    }
  };

  const handleRejectJob = async (reason) => {
    try {
      const updated = await rejectJob(rejectTarget.id, reason);
      setJobs(prev => prev.map(j =>
        j.id === rejectTarget.id ? { ...j, status: updated.status || 'REJECTED' } : j
      ));
      notify('Job rejected.');
    } catch (err) {
      notify('Failed to reject job.', 'error');
    } finally {
      setRejectTarget(null);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Remove this job listing from the platform?')) return;
    try {
      await moderateDeleteJob(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      notify('Job listing deleted.');
    } catch (err) {
      notify('Failed to delete job.', 'error');
    }
  };

  // --- User Toggle ---
  const handleToggleUser = async (userId) => {
    try {
      const updated = await toggleUserStatus(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, enabled: updated.enabled, accountStatus: updated.accountStatus } : u));
      setRecruiters(prev => prev.map(r => r.id === userId ? { ...r, enabled: updated.enabled, accountStatus: updated.accountStatus } : r));
      setJobSeekers(prev => prev.map(s => s.id === userId ? { ...s, enabled: updated.enabled, accountStatus: updated.accountStatus } : s));
      notify(`Account ${updated.enabled ? 'activated' : 'suspended'} successfully.`);
    } catch (err) {
      notify('Failed to update user status.', 'error');
    }
  };

  // --- Filters ---
  const filteredRR = recruiterRequests.filter(r =>
    rrFilter === 'ALL' || r.status === rrFilter
  );

  const filteredJobs = jobs.filter(j => {
    const matchStatus = jobStatusFilter === 'ALL' || j.status === jobStatusFilter;
    const q = jobSearch.toLowerCase();
    const matchQ = !q || (j.title || '').toLowerCase().includes(q) || (j.companyName || '').toLowerCase().includes(q);
    return matchStatus && matchQ;
  });

  const filteredSeekers = jobSeekers.filter(s => {
    const q = seekerSearch.toLowerCase();
    return !q || (s.username || '').toLowerCase().includes(q) ||
      (s.fullName || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q) ||
      (s.skills || []).some(sk => (typeof sk === 'string' ? sk : sk.name || '').toLowerCase().includes(q));
  });

  const pendingRRCount = recruiterRequests.filter(r => r.status === 'PENDING').length;
  const pendingJobCount = jobs.filter(j => j.status === 'PENDING').length;

  const TABS = [
    { id: 'overview',   label: 'Overview',            icon: <Activity size={14} /> },
    { id: 'rr',         label: `Recruiter Requests${pendingRRCount > 0 ? ` (${pendingRRCount})` : ''}`, icon: <UserCheck size={14} /> },
    { id: 'recruiters', label: `Recruiters (${recruiters.length})`, icon: <Building2 size={14} /> },
    { id: 'seekers',    label: `Job Seekers (${jobSeekers.length})`, icon: <Users size={14} /> },
    { id: 'jobs',       label: `Job Listings (${jobs.length})`, icon: <Briefcase size={14} /> },
    { id: 'logs',       label: `Audit Logs (${logs.length})`, icon: <Shield size={14} /> },
  ];

  return (
    <div className="py-6 sm:py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Admin Governance Console
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Platform Administration
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Manage accounts, job moderation, recruiter verification, and audit logs.
            </p>
          </div>
          <button
            onClick={loadAllAdminData}
            className="inline-flex items-center justify-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 px-3.5 py-2 rounded-lg font-medium text-xs text-slate-700 transition-colors shadow-sm self-start sm:self-auto"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Toast */}
        {message.text && (
          <div className={`mb-5 p-3.5 rounded-lg text-xs font-medium flex items-center gap-2 border ${
            message.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            {message.type === 'error'
              ? <AlertTriangle size={15} className="flex-shrink-0" />
              : <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
            }
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              } ${(tab.id === 'rr' && pendingRRCount > 0) || (tab.id === 'jobs' && pendingJobCount > 0) ? 'ring-1 ring-amber-400' : ''}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ========== TAB: OVERVIEW ========== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: 'Total Users',      val: stats?.totalUsers        ?? users.length,   icon: <Users size={18} />,       color: 'bg-blue-50 text-blue-700' },
                { label: 'Active Jobs',      val: stats?.totalJobs         ?? jobs.length,    icon: <Briefcase size={18} />,   color: 'bg-slate-100 text-slate-700' },
                { label: 'Applications',     val: stats?.totalApplications ?? 0,              icon: <FileCheck size={18} />,   color: 'bg-primary-light text-primary' },
                { label: 'Pending Reviews',  val: pendingRRCount,                             icon: <Clock size={18} />,       color: 'bg-amber-50 text-amber-700' },
              ].map((card, i) => (
                <div key={i} className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-md flex items-center justify-center ${card.color}`}>
                      {card.icon}
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-0.5">{card.val}</p>
                  <p className="text-xs font-medium text-slate-500">{card.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Pending actions */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Clock size={14} className="text-amber-500" /> Pending Actions
                </h3>
                <div className="space-y-2">
                  {pendingRRCount > 0 && (
                    <button
                      onClick={() => setActiveTab('rr')}
                      className="w-full flex items-center justify-between p-2.5 bg-amber-50 border border-amber-200 rounded-md text-xs hover:bg-amber-100 transition-colors"
                    >
                      <span className="font-semibold text-amber-800">{pendingRRCount} Recruiter Request{pendingRRCount > 1 ? 's' : ''} Awaiting Approval</span>
                      <span className="text-amber-600 font-semibold">Review →</span>
                    </button>
                  )}
                  {pendingRRCount === 0 && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 size={14} /> All recruiter requests are up to date.
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Audit Events */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                  <span>Recent Security Events</span>
                  <span className="text-xs font-normal text-slate-400">Last 5</span>
                </h3>
                <div className="space-y-2">
                  {logs.slice(0, 5).map((log, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-md border border-slate-100">
                      <Shield size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-800 truncate">{log.action || log.details || 'Audit Event'}</p>
                        <span className="text-[10px] text-slate-400">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Just now'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && <p className="text-xs text-slate-400 italic">No audit events recorded yet.</p>}
                </div>
              </div>
            </div>

            {/* Stack summary */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Platform Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                {[
                  { label: 'Recruiters', val: recruiters.length, sub: `${recruiters.filter(r => r.accountStatus === 'APPROVED' || r.enabled).length} approved` },
                  { label: 'Job Seekers', val: jobSeekers.length, sub: `${jobSeekers.filter(s => s.enabled !== false).length} active` },
                  { label: 'Total Jobs', val: jobs.length, sub: `${jobs.filter(j => j.status === 'APPROVED' || j.status === 'PUBLISHED').length} live` },
                  { label: 'Pending', val: pendingRRCount, sub: 'recruiter verification' },
                ].map((item, i) => (
                  <div key={i} className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-2xl font-bold text-slate-900">{item.val}</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{item.label}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== TAB: RECRUITER REQUESTS ========== */}
        {activeTab === 'rr' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recruiter Verification Requests</h2>
                <p className="text-xs text-slate-500 mt-0.5">Review corporate proofs, employee IDs, and approve or reject registrations.</p>
              </div>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 overflow-x-auto">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                  <button
                    key={f}
                    onClick={() => setRrFilter(f)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                      rrFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                    {f === 'PENDING' && pendingRRCount > 0 ? ` (${pendingRRCount})` : ''}
                  </button>
                ))}
              </div>
            </div>

            {filteredRR.length === 0 ? (
              <div className="bg-white p-10 rounded-lg border border-slate-200 text-center">
                <UserCheck size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No requests found</p>
                <p className="text-xs text-slate-400 mt-0.5">No recruiter requests match the selected filter.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRR.map(rr => (
                  <div key={rr.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        {/* Identity */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {(rr.fullName || rr.username || 'R')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm">{rr.fullName || rr.username}</p>
                            <p className="text-xs text-slate-500">@{rr.username || rr.user?.username} • {rr.email}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{rr.designation} at <span className="font-semibold text-slate-700">{rr.companyName}</span></p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <StatusBadge status={rr.status} />
                          <span className="text-[10px] text-slate-400">
                            {rr.createdAt ? new Date(rr.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                      </div>

                      {/* Details Grid - Separating Personal & Company Email & Showing All Submitted Info */}
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        {[
                          { label: 'Personal Email', val: rr.email },
                          { label: 'Company Email', val: rr.companyEmail || 'Not specified' },
                          { label: 'Recruiter Phone', val: rr.phone },
                          { label: 'Company Phone', val: rr.companyPhone },
                          { label: 'Company Name', val: rr.companyName },
                          { label: 'Company Website', val: rr.companyWebsite },
                          { label: 'Industry', val: rr.industry },
                          { label: 'Company Type', val: rr.companyType },
                          { label: 'Location / City', val: rr.companyLocation },
                          { label: 'Office Address', val: rr.companyAddress },
                          { label: 'Employee ID', val: rr.employeeId || 'Not provided' },
                          { label: 'Reg. / CIN Number', val: rr.registrationNumber || 'Not provided' },
                          { label: 'LinkedIn Profile', val: rr.linkedInUrl },
                        ].map((item, i) => item.val ? (
                          <div key={i} className="bg-slate-50/70 p-2 rounded border border-slate-100">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
                            <p className="text-slate-700 font-medium truncate mt-0.5" title={item.val}>{item.val}</p>
                          </div>
                        ) : null)}
                      </div>

                      {/* Document Links - Always show section, even if no documents uploaded */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(rr.identityDocName || rr.identityDocPath) ? (
                          <button
                            type="button"
                            onClick={() => handleOpenDocument(rr.identityDocPath, rr.identityDocName, 'identity')}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded hover:bg-blue-100 transition-colors shadow-sm cursor-pointer"
                          >
                            <FileText size={12} /> View Identity Proof ({rr.identityDocName || 'Document'})
                            <ExternalLink size={10} />
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded">
                            <FileText size={12} /> No Identity Document uploaded
                          </span>
                        )}
                        {(rr.companyProofDocName || rr.companyProofDocPath) ? (
                          <button
                            type="button"
                            onClick={() => handleOpenDocument(rr.companyProofDocPath, rr.companyProofDocName, 'company')}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1.5 rounded hover:bg-indigo-100 transition-colors shadow-sm cursor-pointer"
                          >
                            <Building2 size={12} /> View Company Proof ({rr.companyProofDocName || 'Certificate'})
                            <ExternalLink size={10} />
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded">
                            <Building2 size={12} /> No Company Proof uploaded
                          </span>
                        )}
                      </div>

                      {/* Rejection reason if rejected */}
                      {rr.status === 'REJECTED' && rr.rejectionReason && (
                        <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
                          <span className="font-semibold">Rejection Reason:</span> {rr.rejectionReason}
                        </div>
                      )}

                      {/* Actions */}
                      {rr.status === 'PENDING' && (
                        <div className="mt-4 flex items-center gap-2">
                          <button
                            onClick={() => handleApproveRequest(rr.id)}
                            disabled={approvingId === rr.id}
                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-colors"
                          >
                            <CheckCircle2 size={13} /> {approvingId === rr.id ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => setRejectTarget({ type: 'request', id: rr.id, label: `Reject request from ${rr.fullName || rr.username}` })}
                            disabled={approvingId === rr.id}
                            className="inline-flex items-center gap-1.5 border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== TAB: RECRUITERS ========== */}
        {activeTab === 'recruiters' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Registered Recruiters ({recruiters.length})</h3>
              <p className="text-xs text-slate-500 mt-0.5">Corporate accounts and their platform activity.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                    <th className="px-4 py-2.5">Recruiter</th>
                    <th className="px-4 py-2.5 hidden md:table-cell">Company / Email</th>
                    <th className="px-4 py-2.5">Jobs Posted</th>
                    <th className="px-4 py-2.5 hidden sm:table-cell">Applicants</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recruiters.length === 0 && (
                    <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-400 text-xs">No recruiters found.</td></tr>
                  )}
                  {recruiters.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-slate-100 text-slate-700 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {(r.fullName || r.username || 'R')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{r.fullName || r.username}</p>
                            <p className="text-[10px] text-slate-400">@{r.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                        <p className="text-xs">{r.email}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{r.jobsCount ?? 0}</td>
                      <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{r.applicantsCount ?? 0}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.accountStatus || (r.enabled ? 'APPROVED' : 'SUSPENDED')} /></td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggleUser(r.id)}
                          className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                            r.enabled !== false
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {r.enabled !== false ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== TAB: JOB SEEKERS ========== */}
        {activeTab === 'seekers' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Job Seekers ({jobSeekers.length})</h3>
                <p className="text-xs text-slate-500 mt-0.5">Candidate directory with skills, resume, and application counts.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/admin/jobseeker"
                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
                >
                  <Users size={12} /> Open Dedicated Page &rarr;
                </Link>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={seekerSearch}
                    onChange={e => setSeekerSearch(e.target.value)}
                    className="w-full sm:w-52 bg-white border border-slate-300 focus:border-primary pl-8 pr-3 py-1.5 rounded-md text-xs outline-none"
                  />
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                    <th className="px-4 py-2.5">Candidate</th>
                    <th className="px-4 py-2.5 hidden md:table-cell">Skills</th>
                    <th className="px-4 py-2.5 hidden sm:table-cell">Applications</th>
                    <th className="px-4 py-2.5">Resume</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSeekers.length === 0 && (
                    <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-400 text-xs">No candidates found.</td></tr>
                  )}
                  {filteredSeekers.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-slate-100 text-slate-700 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {(s.fullName || s.username || 'C')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{s.fullName || s.username}</p>
                            <p className="text-[10px] text-slate-400">@{s.username} • {s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(s.skills || []).slice(0, 4).map((sk, i) => (
                            <span key={i} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] border border-slate-200">{typeof sk === 'string' ? sk : sk.name}</span>
                          ))}
                          {(s.skills || []).length > 4 && (
                            <span className="text-[10px] text-slate-400">+{s.skills.length - 4}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-semibold hidden sm:table-cell">{s.applicationsCount ?? 0}</td>
                      <td className="px-4 py-3">
                        {s.resumeUrl ? (
                          <a
                            href={`http://localhost:8080${s.resumeUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline text-[10px] font-medium"
                          >
                            <FileText size={11} /> View Resume
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Not uploaded</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggleUser(s.id)}
                          className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                            s.enabled !== false
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {s.enabled !== false ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== TAB: JOB MODERATION ========== */}
        {activeTab === 'jobs' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Job Listings ({jobs.length})</h3>
                <p className="text-xs text-slate-500 mt-0.5">View and manage all job postings. Jobs are published directly by recruiters.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
                  {['ALL', 'PENDING', 'APPROVED', 'PUBLISHED', 'REJECTED'].map(f => (
                    <button
                      key={f}
                      onClick={() => setJobStatusFilter(f)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                        jobStatusFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={jobSearch}
                    onChange={e => setJobSearch(e.target.value)}
                    className="w-full sm:w-44 bg-white border border-slate-300 focus:border-primary pl-7 pr-3 py-1.5 rounded-md text-xs outline-none"
                  />
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                    <th className="px-4 py-2.5">Job</th>
                    <th className="px-4 py-2.5 hidden sm:table-cell">Location</th>
                    <th className="px-4 py-2.5 hidden md:table-cell">Applicants</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredJobs.length === 0 && (
                    <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-400">No jobs match the current filter.</td></tr>
                  )}
                  {filteredJobs.map(job => (
                    <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{job.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{job.companyName || 'Partner'} • {job.workMode || 'Hybrid'}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{job.location || 'Remote'}</td>
                      <td className="px-4 py-3 text-slate-700 font-semibold hidden md:table-cell">{job.applicantCount ?? 0}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={job.status || 'PUBLISHED'} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors"
                            title="Delete Job"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== TAB: AUDIT LOGS ========== */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Security & Audit Logs</h3>
            <p className="text-xs text-slate-500 mb-4">Complete chronological record of platform events and administrative actions.</p>
            <div className="space-y-2">
              {logs.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">No audit log entries recorded yet.</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-md border border-slate-100 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <Activity size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800">{log.action || log.event || 'System Event'}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{log.details || log.message || 'Platform operation executed.'}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recently'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          title={rejectTarget.label}
          onConfirm={rejectTarget.type === 'request' ? handleRejectRequest : handleRejectJob}
          onClose={() => setRejectTarget(null)}
        />
      )}

      {/* Document Viewer Modal */}
      {docModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  {docModal.isImage ? <Image size={16} /> : <FileText size={16} />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{docModal.title}</h3>
                  <p className="text-[11px] text-slate-500 truncate">{docModal.fileName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={docModal.url}
                  download={docModal.fileName}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold shadow-sm transition-colors"
                >
                  <Download size={13} /> Download
                </a>
                <a
                  href={docModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold shadow-sm transition-colors"
                >
                  <ExternalLink size={13} /> New Tab
                </a>
                <button
                  onClick={closeDocModal}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors ml-1"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex-1 overflow-auto bg-slate-100/70 flex items-center justify-center min-h-[350px]">
              {docModal.isImage ? (
                <img
                  src={docModal.url}
                  alt={docModal.fileName}
                  className="max-h-[72vh] max-w-full rounded-lg shadow-sm border border-slate-200 object-contain mx-auto bg-white"
                />
              ) : docModal.isPdf ? (
                <iframe
                  src={docModal.url}
                  className="w-full h-[72vh] rounded-lg border border-slate-200 bg-white"
                  title={docModal.fileName}
                />
              ) : (
                <div className="text-center p-8 bg-white rounded-lg border border-slate-200">
                  <FileText size={40} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-800">{docModal.fileName}</p>
                  <p className="text-xs text-slate-500 mb-4 mt-1">Preview is not available for this file type.</p>
                  <a
                    href={docModal.url}
                    download={docModal.fileName}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-md text-xs font-semibold hover:bg-primary-dark transition-colors shadow-sm"
                  >
                    <Download size={14} /> Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

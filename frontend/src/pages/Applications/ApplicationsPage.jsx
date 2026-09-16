import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Calendar, ArrowUpRight, Filter, CheckCircle2, 
  XCircle, Clock, Send, AlertTriangle, ChevronRight, Check, X,
  Video, IndianRupee, Building, Sparkles, AlertCircle, Trash2
} from 'lucide-react';
import { getApplicationsByCandidate, withdrawApplication, respondToOffer } from '../../services/applicationApi';

const TIMELINE_STAGES = [
  { key: 'APPLIED', label: 'Applied' },
  { key: 'SCREENING', label: 'Screening' },
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'INTERVIEW_SCHEDULED', label: 'Interview' },
  { key: 'OFFER_SENT', label: 'Offer' },
  { key: 'OFFER_ACCEPTED', label: 'Hired' }
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOfferApp, setSelectedOfferApp] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await getApplicationsByCandidate();
      const list = Array.isArray(res) ? res : res.content || [];
      setApplications(list);
    } catch (err) {
      console.error('Application loading error:', err);
      setError('Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) return;
    try {
      await withdrawApplication(appId);
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      showToast('Application withdrawn successfully.');
    } catch (err) {
      console.error('Withdraw failed', err);
    }
  };

  const handleOfferResponse = async (offerStatus) => {
    if (!selectedOfferApp) return;
    try {
      const offerId = selectedOfferApp.offer?.id || selectedOfferApp.id;
      await respondToOffer(offerId, offerStatus);
      setApplications((prev) =>
        prev.map((a) => (a.id === selectedOfferApp.id ? { 
          ...a, 
          status: offerStatus === 'ACCEPTED' ? 'OFFER_ACCEPTED' : 'OFFER_DECLINED' 
        } : a))
      );
      setSelectedOfferApp(null);
      showToast(`Offer ${offerStatus === 'ACCEPTED' ? 'accepted! Welcome to the team!' : 'declined.'}`);
    } catch (err) {
      console.error('Offer response failed', err);
    }
  };

  const showToast = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 4000);
  };

  const getStageIndex = (status) => {
    switch (status) {
      case 'APPLIED': return 0;
      case 'SCREENING': return 1;
      case 'SHORTLISTED': return 2;
      case 'INTERVIEW':
      case 'INTERVIEW_SCHEDULED': return 3;
      case 'OFFER_SENT': return 4;
      case 'OFFER_ACCEPTED':
      case 'SELECTED': return 5;
      case 'REJECTED':
      case 'WITHDRAWN':
      case 'OFFER_DECLINED': return -1;
      default: return 0;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OFFER_ACCEPTED':
      case 'SELECTED':
      case 'OFFER_SENT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'INTERVIEW':
      case 'INTERVIEW_SCHEDULED':
      case 'SHORTLISTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SCREENING':
      case 'APPLIED':
        return 'bg-primary-light text-primary border-primary-border';
      case 'REJECTED':
      case 'WITHDRAWN':
      case 'OFFER_DECLINED':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const filteredApps = applications.filter(
    (app) => statusFilter === 'ALL' || app.status === statusFilter
  );

  return (
    <div className="py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Application Tracker
            </h1>
            <p className="text-slate-500 font-medium text-xs mt-0.5">
              Real-time progress stepper, scheduled interviews, and official offer decisions.
            </p>
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 pl-8 pr-7 py-1.5 rounded-md font-semibold text-xs shadow-sm focus:outline-none focus:border-slate-400 transition-colors cursor-pointer text-slate-700"
            >
              <option value="ALL">All Stages ({applications.length})</option>
              <option value="APPLIED">Applied</option>
              <option value="SCREENING">Screening</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW_SCHEDULED">Interviews</option>
              <option value="OFFER_SENT">Offers Extended</option>
              <option value="OFFER_ACCEPTED">Hired / Accepted</option>
              <option value="REJECTED">Archived / Rejected</option>
            </select>
            <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Action Toast */}
        {actionMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md font-semibold text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" /> {actionMessage}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-white rounded-lg animate-pulse border border-slate-200" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 text-primary border border-red-200 rounded-md font-semibold text-xs text-center">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && applications.length === 0 && !error && (
          <div className="bg-white py-12 px-6 rounded-lg text-center border border-slate-200 shadow-sm max-w-md mx-auto">
            <FileText size={32} className="mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">No Active Applications</h3>
            <p className="text-slate-500 text-xs mb-4">
              You haven't submitted any job applications yet. Discover roles tailored to your profile.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-semibold text-xs transition-colors"
            >
              Browse Open Roles →
            </Link>
          </div>
        )}

        {/* Applications List */}
        {!loading && filteredApps.length > 0 && (
          <div className="space-y-4">
            {filteredApps.map((app) => {
              const currentStep = getStageIndex(app.status);
              const isTerminated = app.status === 'REJECTED' || app.status === 'WITHDRAWN' || app.status === 'OFFER_DECLINED';

              return (
                <div
                  key={app.id}
                  className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition-colors flex flex-col gap-4"
                >
                  {/* Top Bar: Company, Title, Status & Withdraw */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center text-primary font-bold text-sm border border-slate-200 shrink-0">
                        {app.job?.companyName ? app.job.companyName[0].toUpperCase() : 'G'}
                      </div>

                      <div>
                        <Link
                          to={`/jobs/${app.job?.id || ''}`}
                          className="text-sm font-bold text-slate-900 hover:text-primary transition-colors block"
                        >
                          {app.job?.title || 'Software Developer'}
                        </Link>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {app.job?.companyName || 'GlobalCo Partner'} • {app.job?.location || 'Remote'}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-slate-400" /> Applied{' '}
                            {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Recently'}
                          </span>
                          {app.matchScore && (
                            <span className="flex items-center gap-1 text-primary font-semibold">
                              <Sparkles size={12} /> {app.matchScore}% Match
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge & Withdraw Action */}
                    <div className="flex items-center gap-2.5 self-start sm:self-center">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status ? app.status.replace('_', ' ') : 'APPLIED'}
                      </span>

                      {!isTerminated && app.status !== 'OFFER_ACCEPTED' && (
                        <button
                          onClick={() => handleWithdraw(app.id)}
                          className="text-xs font-medium text-slate-400 hover:text-primary transition-colors px-1 py-0.5"
                          title="Withdraw Application"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual 5-Stage Stepper (if not terminated) */}
                  {!isTerminated && (
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between relative px-2">
                        {/* Connecting track line */}
                        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
                        <div
                          className="absolute top-1/2 left-4 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
                          style={{
                            width: `calc(${Math.min(100, Math.max(0, (currentStep / (TIMELINE_STAGES.length - 1)) * 100))}% - 16px)`
                          }}
                        />

                        {TIMELINE_STAGES.map((st, i) => {
                          const isDone = i <= currentStep;
                          const isCurrent = i === currentStep;

                          return (
                            <div key={st.key} className="flex flex-col items-center relative z-10">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-all ${
                                  isDone
                                    ? 'bg-primary text-white ring-2 ring-white'
                                    : 'bg-white border border-slate-300 text-slate-400'
                                }`}
                              >
                                {isDone ? <Check size={12} /> : i + 1}
                              </div>
                              <span
                                className={`text-[10px] font-semibold mt-1 uppercase tracking-wider text-center hidden sm:block ${
                                  isCurrent ? 'text-primary font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'
                                }`}
                              >
                                {st.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ACTIVE INTERVIEW CALLOUT BANNER (when interview scheduled) */}
                  {(app.status === 'INTERVIEW_SCHEDULED' || app.status === 'INTERVIEW') && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Video size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Technical Interview Scheduled</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Interviewer: Principal Engineer • Round 1 Concurrency & System Architecture
                          </p>
                        </div>
                      </div>

                      <a
                        href="https://meet.google.com/glb-interview-link"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors shrink-0"
                      >
                        <Video size={13} /> Join Google Meet
                      </a>
                    </div>
                  )}

                  {/* ACTIVE OFFER BANNER (when offer extended) */}
                  {(app.status === 'OFFER_SENT' || app.status === 'SELECTED') && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <IndianRupee size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-950">
                            Congratulations! Formal Job Offer Extended
                          </p>
                          <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                            Annual Pay: $135,000 / yr + Equity • Expected Joining Date: Within 30 days
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setSelectedOfferApp(app)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1"
                        >
                          Review & Respond
                        </button>
                      </div>
                    </div>
                  )}

                  {/* HIRED CELEBRATION BANNER */}
                  {app.status === 'OFFER_ACCEPTED' && (
                    <div className="bg-emerald-50 text-emerald-800 p-3 rounded-md border border-emerald-200 flex items-center gap-2 text-xs font-bold">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>Offer Accepted! The hiring team is preparing your onboarding packet.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Offer Review Modal */}
        {selectedOfferApp && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg max-w-lg w-full p-5 sm:p-6 shadow-xl border border-slate-200">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-md flex items-center justify-center mb-3">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Official Job Offer Letter</h3>
              <p className="text-slate-500 text-xs mb-4">
                Role: <span className="font-semibold text-slate-800">{selectedOfferApp.job?.title}</span> at <span className="font-semibold text-slate-800">{selectedOfferApp.job?.companyName}</span>
              </p>

              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-2.5 text-xs mb-5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Offered Base Salary:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedOfferApp.offer?.salaryOffered
                      ? `₹${Number(selectedOfferApp.offer.salaryOffered).toLocaleString('en-IN')} / year`
                      : 'As per offer letter'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Stock Options & Equity:</span>
                  <span className="font-semibold text-slate-800">0.15% Standard 4-Yr Vesting</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Start Date:</span>
                  <span className="font-semibold text-slate-800">Within 30 Calendar Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Work Location Mode:</span>
                  <span className="font-semibold text-slate-800">{selectedOfferApp.job?.workMode || 'Hybrid'}</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => handleOfferResponse('DECLINED')}
                  className="px-4 py-2 border border-slate-200 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Decline Offer
                </button>
                <button
                  type="button"
                  onClick={() => handleOfferResponse('ACCEPTED')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Check size={13} /> Accept Offer & Join
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Users, Download, Filter, Calendar, Mail, FileText, 
  CheckCircle2, XCircle, Clock, ChevronRight, Star, ExternalLink, Send,
  User, MapPin, Briefcase, Sparkles, MessageSquare, Save, X, Phone
} from 'lucide-react';
import { 
  getJobApplicants, updateApplicantStatus, updateApplicantNotes, exportApplicantsCsv, 
  downloadApplicationsZip, downloadApplicationsExcel,
  scheduleInterview, createOffer, getApplicantResume
} from '../../services/recruiterApi';
import { getJobById } from '../../services/jobApi';

const STAGES = ['ALL', 'APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'OFFER_SENT', 'REJECTED'];

export default function ApplicantTrackingPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingZip, setExportingZip] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [viewingResumeId, setViewingResumeId] = useState(null);
  const [stageFilter, setStageFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [candidateDrawerApp, setCandidateDrawerApp] = useState(null);
  const [recruiterNotesInput, setRecruiterNotesInput] = useState('');

  const [interviewModalApp, setInterviewModalApp] = useState(null);
  const [interviewData, setInterviewData] = useState({
    interviewDate: '',
    interviewerName: 'Principal Architect',
    meetingLink: 'https://meet.google.com/glb-interview-link',
    notes: 'Technical architecture and live problem-solving round.'
  });

  const [offerModalApp, setOfferModalApp] = useState(null);
  const [offerData, setOfferData] = useState({
    salaryOffered: 1125000,
    joiningDate: '',
    notes: 'Standard GlobalCo benefits, equity package, and relocation stipend.'
  });

  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobData, applicantsData] = await Promise.all([
        getJobById(jobId),
        getJobApplicants(jobId)
      ]);
      setJob(jobData);
      setApplicants(applicantsData || []);
    } catch (err) {
      console.error('Failed to load ATS data', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicantStatus(appId, newStatus);
      setApplicants((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      if (candidateDrawerApp && candidateDrawerApp.id === appId) {
        setCandidateDrawerApp(prev => ({ ...prev, status: newStatus }));
      }
      showToast(`Candidate moved to ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleSaveNotes = async (appId) => {
    try {
      await updateApplicantNotes(appId, recruiterNotesInput);
      setApplicants((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, recruiterNotes: recruiterNotesInput } : a))
      );
      if (candidateDrawerApp) {
        setCandidateDrawerApp(prev => ({ ...prev, recruiterNotes: recruiterNotesInput }));
      }
      showToast('Recruiter evaluation notes saved.');
    } catch (err) {
      console.error('Failed to save notes', err);
      showToast('Failed to save notes: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const openCandidateDrawer = (app) => {
    setCandidateDrawerApp(app);
    setRecruiterNotesInput(app.recruiterNotes || '');
  };

  const handleViewResume = async (app) => {
    // Open synchronously so browsers treat this as a user-initiated preview.
    const previewWindow = window.open('', '_blank');
    try {
      setViewingResumeId(app.id);
      const blob = await getApplicantResume(app.id);
      const resumeUrl = window.URL.createObjectURL(blob);

      if (previewWindow) {
        previewWindow.opener = null;
        previewWindow.location.replace(resumeUrl);
      } else {
        const link = document.createElement('a');
        link.href = resumeUrl;
        link.target = '_blank';
        link.rel = 'noreferrer';
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      window.setTimeout(() => window.URL.revokeObjectURL(resumeUrl), 60_000);
    } catch (err) {
      previewWindow?.close();
      console.error('Failed to open applicant resume', err);
      showToast(err.response?.status === 404
        ? 'This applicant has no available resume file.'
        : 'Unable to open the applicant resume. Please try again.');
    } finally {
      setViewingResumeId(null);
    }
  };

  const handleExportZip = async () => {
    try {
      setExportingZip(true);
      const blob = await downloadApplicationsZip(jobId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Job_${jobId}_Applications_With_Resumes.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToast('Applications ZIP archive downloaded (Excel report + applicant resumes).');
    } catch (err) {
      console.error('Failed to download ZIP archive', err);
      showToast('Error generating ZIP archive.');
    } finally {
      setExportingZip(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      const blob = await downloadApplicationsExcel(jobId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Job_${jobId}_Applications.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToast('Applications Excel (.xlsx) report downloaded.');
    } catch (err) {
      console.error('Failed to export Excel', err);
      showToast('Error generating Excel spreadsheet.');
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await exportApplicantsCsv(jobId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `applicants-job-${jobId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToast('Applicant CSV report downloaded.');
    } catch (err) {
      console.error('Failed to export CSV', err);
    }
  };

  const submitScheduleInterview = async (e) => {
    e.preventDefault();
    if (!interviewModalApp) return;
    try {
      // datetime-local gives "YYYY-MM-DDTHH:mm" without timezone — append ":00.000Z" for a valid Instant
      const rawDate = interviewData.interviewDate;
      const isoDate = rawDate
        ? new Date(rawDate).toISOString()
        : new Date(Date.now() + 86400000 * 2).toISOString();

      await scheduleInterview({
        applicationId: interviewModalApp.id,
        interviewDate: isoDate,
        interviewType: interviewData.interviewerName || 'Technical Round',
        meetingLink: interviewData.meetingLink,
        notes: interviewData.notes
      });
      // Auto update status to INTERVIEW_SCHEDULED
      setApplicants((prev) =>
        prev.map((a) => (a.id === interviewModalApp.id ? { ...a, status: 'INTERVIEW_SCHEDULED' } : a))
      );
      setInterviewModalApp(null);
      showToast('Interview scheduled & invitation sent to candidate.');
    } catch (err) {
      console.error('Failed to schedule interview', err);
      showToast('Failed to schedule interview: ' + (err.response?.data?.message || err.message));
    }
  };


  const submitCreateOffer = async (e) => {
    e.preventDefault();
    if (!offerModalApp) return;
    try {
      await createOffer({
        applicationId: offerModalApp.id,
        salaryOffered: offerData.salaryOffered,
        joiningDate: offerData.joiningDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        notes: offerData.notes
      });
      // Auto update status to OFFER_SENT
      setApplicants((prev) =>
        prev.map((a) => (a.id === offerModalApp.id ? { ...a, status: 'OFFER_SENT' } : a))
      );
      setOfferModalApp(null);
      showToast('Formal offer generated and delivered to candidate dashboard.');
    } catch (err) {
      console.error('Failed to generate offer', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OFFER_ACCEPTED':
      case 'OFFER_SENT':
      case 'SELECTED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'INTERVIEW_SCHEDULED':
      case 'SHORTLISTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SCREENING':
      case 'APPLIED':
        return 'bg-primary-light text-primary border-primary-border';
      case 'REJECTED':
      case 'WITHDRAWN':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    const matchesStage = stageFilter === 'ALL' || app.status === stageFilter;
    const candidateName = app.candidate?.fullName || app.candidate?.username || '';
    const matchesSearch = candidateName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStage && matchesSearch;
  });

  return (
    <div className="py-6 sm:py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/recruiter/dashboard"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium text-xs sm:text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Hiring Dashboard
        </Link>

        {/* Toast Alert */}
        {actionSuccess && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" /> {actionSuccess}
          </div>
        )}

        {/* Header Banner */}
        <div className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Applicant Tracking System
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {job?.title || 'Applicant Pipeline'}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              {job?.companyName} • {job?.location} • {applicants.length} Total Applicants
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleExportZip}
              disabled={exportingZip || applicants.length === 0}
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-3.5 py-1.5 rounded-md font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
              title="Download ZIP package containing Applications.xlsx and Resumes/ directory"
            >
              <Download size={13} /> {exportingZip ? 'Packaging ZIP...' : 'Download Applications (ZIP)'}
            </button>
            <button
              onClick={handleExportExcel}
              disabled={exportingExcel || applicants.length === 0}
              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-md font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
              title="Export formatted Excel (.xlsx) report"
            >
              <FileText size={13} /> {exportingExcel ? 'Exporting...' : 'Excel (.xlsx)'}
            </button>
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 px-2.5 py-1.5 rounded-md font-medium text-xs text-slate-700 transition-colors shadow-sm"
            >
              CSV
            </button>
            <Link
              to={`/jobs/${jobId}`}
              target="_blank"
              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md font-medium text-xs transition-colors"
            >
              View Job <ExternalLink size={12} />
            </Link>
          </div>
        </div>

        {/* Filters & Stage Tabs */}
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search candidate by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-white border border-slate-300 focus:border-primary px-3 py-1.5 rounded-md text-xs outline-none"
            />

            {/* Stage Counter Pills */}
            <div className="flex flex-wrap gap-1 overflow-x-auto pb-0.5">
              {STAGES.map((stage) => {
                const count = stage === 'ALL' ? applicants.length : applicants.filter((a) => a.status === stage).length;
                return (
                  <button
                    key={stage}
                    onClick={() => setStageFilter(stage)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                      stageFilter === stage
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    <span>{stage.replace('_', ' ')}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] ${stageFilter === stage ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white rounded-lg animate-pulse border border-slate-200" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredApplicants.length === 0 && (
          <div className="bg-white py-12 px-4 rounded-lg text-center border border-dashed border-slate-200">
            <Users size={32} className="mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-800 mb-0.5">No candidates in this stage</h3>
            <p className="text-slate-500 text-xs">
              Switch filters to view candidates across other hiring stages.
            </p>
          </div>
        )}

        {/* Applicants List */}
        {!loading && filteredApplicants.length > 0 && (
          <div className="space-y-3">
            {filteredApplicants.map((app) => (
              <div
                key={app.id}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Candidate Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 bg-slate-100 text-slate-700 rounded-md flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {app.candidate?.fullName ? app.candidate.fullName[0].toUpperCase() : (app.candidate?.username ? app.candidate.username[0].toUpperCase() : 'C')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 
                        onClick={() => openCandidateDrawer(app)}
                        className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-primary transition-colors cursor-pointer truncate"
                      >
                        {app.candidate?.fullName || app.candidate?.username || 'Candidate'}
                      </h3>
                      {/* Match Score Badge */}
                      <span className="inline-flex items-center gap-0.5 bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-medium">
                        <Star size={10} className="fill-primary text-primary" /> {app.matchScore || 85}% Match
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {app.candidate?.email || 'No email'} • Applied {new Date(app.appliedDate || app.createdAt || Date.now()).toLocaleDateString()}
                    </p>

                    {app.recruiterNotes && (
                      <p className="text-xs text-slate-700 mt-1.5 bg-slate-50 p-1.5 rounded border border-slate-100 flex items-center gap-1">
                        <MessageSquare size={11} className="text-slate-400" />
                        <span className="font-medium">Note:</span> {app.recruiterNotes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-wrap items-center gap-2 justify-end border-t md:border-t-0 pt-3 md:pt-0">
                  {/* Direct Resume View Button */}
                  <button
                      onClick={() => handleViewResume(app)}
                      disabled={viewingResumeId === app.id}
                      className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-md text-xs font-medium border border-slate-300 transition-colors"
                      title="View submitted resume"
                    >
                      <FileText size={12} className="text-primary" /> {viewingResumeId === app.id ? 'Opening...' : 'View Resume'}
                    </button>

                  {/* Inspect Profile Button */}
                  <button
                    onClick={() => openCandidateDrawer(app)}
                    className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-md text-xs font-medium border border-slate-300 transition-colors"
                  >
                    <User size={12} /> Profile
                  </button>

                  {/* Status Dropdown */}
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className={`text-xs font-medium px-2.5 py-1.5 rounded-md border appearance-none cursor-pointer outline-none ${getStatusBadge(app.status)}`}
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="SCREENING">Screening</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                    <option value="SELECTED">Selected</option>
                    <option value="OFFER_SENT">Offer Sent</option>
                    <option value="REJECTED">Rejected</option>
                  </select>

                  {/* Interview Button */}
                  <button
                    onClick={() => setInterviewModalApp(app)}
                    className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                  >
                    <Calendar size={12} /> Interview
                  </button>

                  {/* Offer Button */}
                  <button
                    onClick={() => setOfferModalApp(app)}
                    className="inline-flex items-center gap-1 bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm"
                  >
                    <Send size={12} /> Offer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CANDIDATE INSPECTION DRAWER / MODAL */}
        {candidateDrawerApp && (
          <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg max-w-lg w-full p-5 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-md flex items-center justify-center font-bold text-sm">
                    {candidateDrawerApp.candidate?.fullName ? candidateDrawerApp.candidate.fullName[0].toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {candidateDrawerApp.candidate?.fullName || candidateDrawerApp.candidate?.username}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {candidateDrawerApp.candidate?.email} • {candidateDrawerApp.candidate?.location || 'Location Not Specified'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCandidateDrawerApp(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Match Score & Stage Bar */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-red-50/60 border border-red-200 p-3 rounded-md">
                  <span className="text-[10px] font-semibold text-red-700 uppercase tracking-wider block mb-0.5">
                    Match Precision
                  </span>
                  <p className="text-xl font-bold text-primary">{candidateDrawerApp.matchScore || 85}%</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-md">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                    Current Stage
                  </span>
                  <p className="text-xs font-bold text-slate-800 uppercase">{candidateDrawerApp.status?.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Submitted Application Resume Snapshot */}
              <div className="mb-4 p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <FileText size={12} className="text-primary" /> Submitted Resume (Locked Snapshot)
                  </span>
                  <button
                      onClick={() => handleViewResume(candidateDrawerApp)}
                      disabled={viewingResumeId === candidateDrawerApp.id}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <Download size={12} /> {viewingResumeId === candidateDrawerApp.id ? 'Opening...' : 'View Document'}
                    </button>
                </div>
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {candidateDrawerApp.resumeFileName || 'Candidate_Resume.pdf'}
                </p>
                {candidateDrawerApp.coverLetter && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                    <strong className="block font-bold text-slate-700 mb-0.5">Candidate Pitch / Cover Letter:</strong>
                    <p className="italic">{candidateDrawerApp.coverLetter}</p>
                  </div>
                )}
              </div>

              {/* Internal Recruiter Notes */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MessageSquare size={13} className="text-slate-400" /> Notes & Evaluation
                </label>
                <textarea
                  rows={3}
                  value={recruiterNotesInput}
                  onChange={(e) => setRecruiterNotesInput(e.target.value)}
                  placeholder="Add interview notes, feedback, or compensation requirements..."
                  className="w-full bg-white border border-slate-300 rounded-md p-2.5 text-xs outline-none focus:border-primary"
                />
                <div className="mt-1.5 flex justify-end">
                  <button
                    onClick={() => handleSaveNotes(candidateDrawerApp.id)}
                    className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-900 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors"
                  >
                    <Save size={12} /> Save Note
                  </button>
                </div>
              </div>

              {/* Quick Pipeline Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
                <button
                  onClick={() => {
                    const nextApp = candidateDrawerApp;
                    setCandidateDrawerApp(null);
                    setInterviewModalApp(nextApp);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Calendar size={13} /> Schedule Interview
                </button>
                <button
                  onClick={() => {
                    const nextApp = candidateDrawerApp;
                    setCandidateDrawerApp(null);
                    setOfferModalApp(nextApp);
                  }}
                  className="bg-primary hover:bg-primary-dark text-white px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
                >
                  <Send size={13} /> Send Offer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Interview Modal */}
        {interviewModalApp && (
          <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-0.5">Schedule Interview</h3>
              <p className="text-slate-500 text-xs mb-4">
                Candidate: <span className="font-semibold text-slate-800">{interviewModalApp.candidate?.fullName || interviewModalApp.candidate?.username}</span>
              </p>

              <form onSubmit={submitScheduleInterview} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={interviewData.interviewDate}
                    onChange={(e) => setInterviewData({ ...interviewData, interviewDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Interviewer Name / Panel</label>
                  <input
                    type="text"
                    required
                    value={interviewData.interviewerName}
                    onChange={(e) => setInterviewData({ ...interviewData, interviewerName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Link (Google Meet / Zoom)</label>
                  <input
                    type="text"
                    required
                    value={interviewData.meetingLink}
                    onChange={(e) => setInterviewData({ ...interviewData, meetingLink: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions / Notes</label>
                  <textarea
                    rows={2}
                    value={interviewData.notes}
                    onChange={(e) => setInterviewData({ ...interviewData, notes: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-3 flex gap-2 justify-end border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setInterviewModalApp(null)}
                    className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-colors"
                  >
                    Confirm Interview
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Generate Offer Modal */}
        {offerModalApp && (
          <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-0.5">Extend Job Offer</h3>
              <p className="text-slate-500 text-xs mb-4">
                Candidate: <span className="font-semibold text-slate-800">{offerModalApp.candidate?.fullName || offerModalApp.candidate?.username}</span>
              </p>

              <form onSubmit={submitCreateOffer} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Compensation (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={offerData.salaryOffered}
                    onChange={(e) => setOfferData({ ...offerData, salaryOffered: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Joining Date</label>
                  <input
                    type="date"
                    required
                    value={offerData.joiningDate}
                    onChange={(e) => setOfferData({ ...offerData, joiningDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Terms & Special Benefits</label>
                  <textarea
                    rows={2}
                    value={offerData.notes}
                    onChange={(e) => setOfferData({ ...offerData, notes: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-md p-2 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-3 flex gap-2 justify-end border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setOfferModalApp(null)}
                    className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-colors"
                  >
                    Issue Offer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

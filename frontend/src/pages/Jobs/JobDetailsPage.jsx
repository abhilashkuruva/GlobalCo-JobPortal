import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Briefcase, IndianRupee, Clock, Building2, 
  ShieldCheck, Share2, Bookmark, ChevronLeft, CheckCircle2, 
  Sparkles, Star, AlertCircle, Check, ArrowRight, Plus, AlertTriangle,
  FileText, Upload, Calendar, Users, X
} from 'lucide-react';
import { getJobById, applyToJobWithDetails, saveJob, unsaveJob, getJobMatchScore } from '../../services/jobApi';
import { getCandidateProfile, addSkill } from '../../services/profileApi';
import { useAuth } from '../../contexts/AuthContext';

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { token, role } = useAuth();
  
  const [job, setJob] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [matchScore, setMatchScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [useProfileResume, setUseProfileResume] = useState(true);
  const [customResume, setCustomResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [applySuccessMsg, setApplySuccessMsg] = useState('');
  const [addingSkill, setAddingSkill] = useState('');

  useEffect(() => {
    loadJobDetails();
  }, [jobId, token]);

  const loadJobDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const jobData = await getJobById(jobId);
      setJob(jobData);

      if (token && role === 'CANDIDATE') {
        const [match, prof] = await Promise.all([
          getJobMatchScore(jobId).catch(() => null),
          getCandidateProfile().catch(() => null)
        ]);
        setMatchScore(match);
        setCandidateProfile(prof);
      }
    } catch (err) {
      setError('Job details unavailable or job does not exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApplyModal = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setApplyError('');
    setShowApplyModal(true);
  };

  const handleCustomResumeSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setApplyError('Resume file size must be less than 15MB');
      return;
    }
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(ext)) {
      setApplyError('Please upload a PDF, DOC, or DOCX document.');
      return;
    }
    setApplyError('');
    setCustomResume(file);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!useProfileResume && !customResume) {
      setApplyError('Please choose a resume file to upload.');
      return;
    }
    setApplying(true);
    setApplyError('');
    try {
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('useProfileResume', useProfileResume.toString());
      if (!useProfileResume && customResume) {
        formData.append('resume', customResume);
      }
      if (coverLetter.trim()) {
        formData.append('coverLetter', coverLetter.trim());
      }

      await applyToJobWithDetails(formData);
      setApplied(true);
      setShowApplyModal(false);
      setApplySuccessMsg('Your application and customized resume have been submitted directly to the employer!');
    } catch (err) {
      console.error(err);
      setApplyError(err.response?.data?.message || 'Failed to submit application. You may have already applied.');
    } finally {
      setApplying(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      if (saved) {
        await unsaveJob(jobId);
        setSaved(false);
      } else {
        await saveJob(jobId);
        setSaved(true);
      }
    } catch (err) {
      console.error('Save job error', err);
    }
  };

  const handleQuickAddSkill = async (skillName) => {
    setAddingSkill(skillName);
    try {
      await addSkill(skillName);
      const [updatedScore, updatedProf] = await Promise.all([
        getJobMatchScore(jobId),
        getCandidateProfile()
      ]);
      setMatchScore(updatedScore);
      setCandidateProfile(updatedProf);
    } catch (err) {
      console.error('Failed to add skill', err);
    } finally {
      setAddingSkill('');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Compute matched vs missing skills
  const candidateSkillNames = new Set(
    (candidateProfile?.skills || []).map((s) => (s.name || s).toLowerCase())
  );
  const requiredSkillsList = (job?.skills || job?.requiredSkills || []).map((s) => s.name || s);
  const preferredSkillsList = (job?.preferredSkills || []).map((s) => s.name || s);
  const additionalSkillsList = (job?.additionalSkills || []).map((s) => s.name || s);

  const matchedSkills = requiredSkillsList.filter((s) => candidateSkillNames.has(s.toLowerCase()));
  const missingSkills = requiredSkillsList.filter((s) => !candidateSkillNames.has(s.toLowerCase()));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl animate-pulse">
          <div className="h-8 w-36 bg-slate-200 rounded-xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-72 bg-white rounded-xl border border-slate-200" />
              <div className="h-96 bg-white rounded-xl border border-slate-200" />
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-white rounded-xl border border-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <AlertCircle size={40} className="text-primary mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">{error || 'Job not found'}</h2>
          <p className="text-slate-500 text-xs mb-6">The role you are looking for may have expired or been filled.</p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-xs px-5 py-2.5 rounded-md hover:bg-primary-dark transition-colors"
          >
            Explore Other Roles <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 text-slate-800">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-primary transition-colors"
          >
            <ChevronLeft size={16} /> Back to Job Feed
          </button>
        </div>

        {/* Success Alert Banner */}
        {applySuccessMsg && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{applySuccessMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Left Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Hero Card */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-lg text-slate-700 border border-slate-200 shrink-0">
                    {job.company?.name ? job.company.name.charAt(0) : 'G'}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">{job.title}</h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                      <p className="text-primary font-semibold">{job.company?.name || job.companyName || 'GlobalCo Partner'}</p>
                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin size={12} /> {job.location || 'Remote'}
                      </span>
                      {job.department && (
                        <>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="text-slate-500">{job.department}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bookmark & Share */}
                <div className="flex items-center gap-2 self-end sm:self-start">
                  {token && role === 'CANDIDATE' && (
                    <button
                      onClick={handleToggleBookmark}
                      className={`p-2 rounded-md border transition-colors ${
                        saved
                          ? 'bg-red-50 text-primary border-red-200'
                          : 'bg-slate-50 text-slate-400 hover:text-primary border-slate-200'
                      }`}
                      title={saved ? 'Remove Bookmark' : 'Save Job'}
                    >
                      <Bookmark size={16} className={saved ? 'fill-primary' : ''} />
                    </button>
                  )}
                  <button
                    onClick={handleShare}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-primary rounded-md border border-slate-200 transition-colors relative"
                    title="Share Link"
                  >
                    <Share2 size={16} />
                    {copied && (
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                        Link Copied!
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Badges Bar */}
              <div className="flex flex-wrap gap-2 py-3 border-y border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-700 rounded-md font-medium border border-slate-200">
                  <IndianRupee size={13} className="text-primary" /> {job.salaryRange || 'Competitive'}
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-700 rounded-md font-medium border border-slate-200">
                  <Briefcase size={13} className="text-primary" /> 
                  {job.minExperience != null && job.maxExperience != null 
                    ? `${job.minExperience}-${job.maxExperience} Years Exp`
                    : `${job.experienceRequired || 0}+ Years Exp`}
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-700 rounded-md font-medium border border-slate-200">
                  <Clock size={13} className="text-primary" /> {job.workMode || 'Hybrid'} • {job.jobType || 'Full Time'}
                </div>
                {job.openings && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-700 rounded-md font-medium border border-slate-200">
                    <Users size={13} className="text-primary" /> {job.openings} Openings
                  </div>
                )}
                {job.applicationDeadline && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-700 rounded-md font-medium border border-slate-200">
                    <Calendar size={13} className="text-primary" /> Deadline: {job.applicationDeadline}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="pt-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Job Description</h3>
                <div className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>

              {/* Responsibilities */}
              {job.responsibilities && (
                <div className="pt-4 border-t border-slate-100 mt-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Key Responsibilities</h3>
                  <div className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {job.responsibilities}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && (
                <div className="pt-4 border-t border-slate-100 mt-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Perks & Benefits</h3>
                  <div className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {job.benefits}
                  </div>
                </div>
              )}
            </div>

            {/* Categorized Skills Section */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles size={16} className="text-primary" /> Required & Desired Skills
              </h3>

              {/* Core / Required Skills */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" /> Required Skills (Core)
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {requiredSkillsList.length > 0 ? (
                    requiredSkillsList.map((s) => (
                      <span
                        key={s}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border ${
                          candidateSkillNames.has(s.toLowerCase())
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {candidateSkillNames.has(s.toLowerCase()) && <Check size={11} className="text-emerald-600" />}
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No specific required skills listed.</span>
                  )}
                </div>
              </div>

              {/* Preferred Skills */}
              {preferredSkillsList.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Preferred Skills (Bonus)
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {preferredSkillsList.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Skills */}
              {additionalSkillsList.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" /> Additional / Domain Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {additionalSkillsList.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Matched vs Missing Breakdown for Candidates */}
            {token && role === 'CANDIDATE' && candidateProfile && (
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">Your Candidate Profile Fit</h3>
                  <span className="text-xs font-semibold text-primary bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                    {matchedSkills.length} of {requiredSkillsList.length} Core Skills Matched
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-600" /> Matched Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedSkills.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No matching skills identified.</p>
                      ) : (
                        matchedSkills.map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-medium">
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
                      <AlertTriangle size={13} /> Missing Skills (1-Click Add)
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {missingSkills.length === 0 ? (
                        <p className="text-xs text-emerald-700 font-semibold">100% Core Skill Alignment!</p>
                      ) : (
                        missingSkills.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleQuickAddSkill(s)}
                            disabled={addingSkill === s}
                            className="inline-flex items-center gap-1 bg-red-50 hover:bg-primary text-primary hover:text-white border border-red-200 px-2 py-0.5 rounded text-xs font-medium transition-colors"
                          >
                            <Plus size={11} /> {addingSkill === s ? 'Adding...' : s}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Apply Action & Requisition Metadata */}
          <div className="space-y-4">
            
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm lg:sticky lg:top-20">
              <div className="mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Requisition Status
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold uppercase">
                  <CheckCircle2 size={12} /> {job.status || 'Active'}
                </span>
              </div>

              {/* Apply Button for Candidate */}
              {(!token || role === 'CANDIDATE') && (
                <div className="space-y-2.5">
                  <button
                    onClick={handleOpenApplyModal}
                    disabled={applied}
                    className={`w-full font-semibold py-2.5 rounded-md transition-colors text-xs flex items-center justify-center gap-2 ${
                      applied
                        ? 'bg-emerald-100 text-emerald-800 cursor-default'
                        : 'bg-primary hover:bg-primary-dark text-white shadow-sm active:scale-95'
                    }`}
                  >
                    {applied ? 'Application Submitted' : 'Apply for this Role'}
                  </button>

                  {token && (
                    <button
                      onClick={handleToggleBookmark}
                      className={`w-full font-semibold py-2 rounded-md transition-colors text-xs border ${
                        saved
                          ? 'bg-red-50 text-primary border-red-200'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      {saved ? 'Bookmarked' : 'Save for Later'}
                    </button>
                  )}
                </div>
              )}

              {/* Recruiter Notice */}
              {token && role === 'RECRUITER' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 italic">
                    Viewing this requisition as an authorized recruiter.
                  </p>
                  <Link
                    to={`/recruiter/jobs/${job.id}/applicants`}
                    className="w-full bg-primary hover:bg-primary-dark text-white text-xs font-semibold py-2 rounded-md text-center block"
                  >
                    Manage Applicants in ATS →
                  </Link>
                </div>
              )}

              {/* Algorithmic Match Breakdown */}
              {matchScore && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-primary" /> Algorithmic Fit Score
                    </span>
                    <span className="text-xs font-bold text-primary bg-red-50 px-2 py-0.5 rounded border border-red-100">
                      {matchScore.overallScore || 0}%
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-100 rounded-full mb-3 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${matchScore.overallScore || 0}%` }}
                    />
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Skills Match:</span>
                      <span className="font-semibold text-slate-800">{matchScore.skillScore || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Experience Fit:</span>
                      <span className="font-semibold text-slate-800">{matchScore.experienceScore || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location Fit:</span>
                      <span className="font-semibold text-slate-800">{matchScore.locationScore || 0}%</span>
                    </div>
                  </div>

                  {matchScore.explanation && (
                    <p className="text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100 italic leading-relaxed">
                      {matchScore.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* APPLY MODAL WITH RESUME SELECTION */}
        {showApplyModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Apply for Requisition</h3>
                  <p className="text-xs text-slate-500">{job.title} • {job.company?.name || 'GlobalCo'}</p>
                </div>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitApplication} className="space-y-4">
                {/* Resume Choice */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select Application Resume *
                  </label>
                  
                  <div className="space-y-2">
                    {/* Option 1: Profile Resume */}
                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      useProfileResume ? 'border-primary bg-red-50/40' : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="resumeOption"
                        checked={useProfileResume}
                        onChange={() => { setUseProfileResume(true); setApplyError(''); }}
                        className="mt-0.5 accent-primary"
                      />
                      <div className="flex-1 text-xs">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <FileText size={14} className="text-primary" /> Use Profile Resume
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5 truncate">
                          {candidateProfile?.resumeFileName || 'Default Candidate Resume.pdf'}
                        </p>
                      </div>
                    </label>

                    {/* Option 2: Upload Custom Resume */}
                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      !useProfileResume ? 'border-primary bg-red-50/40' : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="resumeOption"
                        checked={!useProfileResume}
                        onChange={() => { setUseProfileResume(false); setApplyError(''); }}
                        className="mt-0.5 accent-primary"
                      />
                      <div className="flex-1 text-xs">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Upload size={14} className="text-primary" /> Upload Specific Resume for this Role
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Tailor your resume specifically for this position (PDF/DOC/DOCX up to 15MB)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Custom Resume File Picker (if Option 2 is chosen) */}
                {!useProfileResume && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                      type="file"
                      id="custom-job-resume"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCustomResumeSelect}
                    />
                    <label
                      htmlFor="custom-job-resume"
                      className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-dashed border-slate-300 rounded-md cursor-pointer hover:border-primary text-xs font-semibold text-slate-700"
                    >
                      <Upload size={14} className="text-primary" />
                      {customResume ? customResume.name : 'Select Custom Resume File (.pdf, .doc, .docx)'}
                    </label>
                    {customResume && (
                      <p className="text-[10px] text-emerald-600 mt-1.5 text-center font-medium">
                        {(customResume.size / 1024 / 1024).toFixed(2)} MB • File selected
                      </p>
                    )}
                  </div>
                )}

                {/* Optional Cover Letter */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Cover Letter / Pitch (Optional)</span>
                    <span className="text-[10px] text-slate-400">Highlights for the recruiter</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly state why your background makes you a strong fit for this position..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white p-2.5 rounded-md text-xs outline-none transition-colors"
                  />
                </div>

                {/* Error Banner */}
                {applyError && (
                  <div className="p-2.5 bg-red-50 text-primary border border-red-200 rounded-md text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{applyError}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {applying ? 'Submitting Application...' : 'Confirm & Submit Application'}
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
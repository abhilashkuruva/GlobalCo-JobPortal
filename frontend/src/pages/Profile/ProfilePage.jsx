import React, { useEffect, useState, useMemo } from 'react';
import { 
  User, Mail, MapPin, Briefcase, Edit3, Shield, 
  Download, Plus, X, Sparkles, CheckCircle2, FileText, UploadCloud, Save, IndianRupee 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getCandidateProfile, updateCandidateProfile, uploadResume } from '../../services/profileApi';

const SUGGESTED_SKILLS = ['Java', 'Spring Boot', 'React', 'Docker', 'AWS', 'PostgreSQL', 'Microservices', 'Kubernetes', 'Python', 'Kafka'];

// Strip auto-generated "Extracted from filename: " prefix from summary
function cleanSummary(text) {
  if (!text) return '';
  // Match patterns like: "Extracted from filename.pdf: ", "Extracted from filename:", etc.
  return text.replace(/^Extracted from [^:]+:\s*/i, '').trim();
}

export default function ProfilePage() {
  const { role, user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [resumeParsing, setResumeParsing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    headline: '',
    currentJobTitle: '',
    summary: '',
    location: '',
    totalExperienceYears: '',
    expectedSalary: '',
    education: '',
    phone: '',
    portfolioUrl: '',
    linkedInUrl: '',
    gitHubUrl: '',
    skills: []
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getCandidateProfile().catch(() => null);
      if (data) {
        setProfile(data);
        setFormData({
          fullName: data.user?.fullName || user?.fullName || '',
          headline: data.headline || '',
          currentJobTitle: data.currentJobTitle || '',
          summary: cleanSummary(data.summary || ''),
          location: data.location || user?.location || '',
          totalExperienceYears: (data.totalExperienceYears !== null && data.totalExperienceYears !== undefined) ? data.totalExperienceYears : '',
          expectedSalary: (data.expectedSalary !== null && data.expectedSalary !== undefined && Number(data.expectedSalary) > 0) ? data.expectedSalary : '',
          education: data.education || '',
          phone: data.phone || user?.mobileNumber || '',
          portfolioUrl: data.portfolioUrl || '',
          linkedInUrl: data.linkedInUrl || '',
          gitHubUrl: data.gitHubUrl || '',
          skills: data.skills ? data.skills.map(s => s.name || s) : []
        });
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        fullName: formData.fullName,
        headline: formData.headline,
        currentJobTitle: formData.currentJobTitle,
        summary: formData.summary,
        location: formData.location,
        totalExperienceYears: (formData.totalExperienceYears !== '' && formData.totalExperienceYears !== null) ? Number(formData.totalExperienceYears) : null,
        expectedSalary: (formData.expectedSalary !== '' && formData.expectedSalary !== null) ? Number(formData.expectedSalary) : null,
        education: formData.education,
        phone: formData.phone,
        portfolioUrl: formData.portfolioUrl,
        linkedInUrl: formData.linkedInUrl,
        gitHubUrl: formData.gitHubUrl,
        skills: formData.skills.map(name => ({ name }))
      };
      const updated = await updateCandidateProfile(payload);
      setProfile(updated);
      if (formData.fullName && updateUser) {
        updateUser({ fullName: formData.fullName });
      }
      setEditing(false);
      showToast('Profile details updated successfully!');
    } catch (err) {
      console.error('Update profile failed', err);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  // Upload and parse real resume file to extract skills and save resume URL
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setResumeParsing(true);
      const fd = new FormData();
      fd.append('file', file);
      await uploadResume(fd);
      await loadProfile();
      showToast(`Resume "${file.name}" uploaded and parsed! Extracted skills populated.`);
    } catch (err) {
      console.error('Resume upload failed', err);
      showToast('Failed to upload and parse resume. Please ensure file is valid and under 15MB.');
    } finally {
      setResumeParsing(false);
      if (e.target) e.target.value = '';
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const completionPct = useMemo(() => {
    if (profile?.profileCompletionPercentage) return profile.profileCompletionPercentage;
    let score = 0;
    if (formData.summary && formData.summary.trim()) score += 20;
    if (formData.location && formData.location.trim()) score += 15;
    if (formData.totalExperienceYears !== '' && formData.totalExperienceYears !== null && Number(formData.totalExperienceYears) > 0) score += 15;
    if (formData.currentJobTitle && formData.currentJobTitle.trim()) score += 15;
    if (formData.expectedSalary !== '' && formData.expectedSalary !== null && Number(formData.expectedSalary) > 0) score += 10;
    if (profile?.resumeUrl) score += 15;
    if (formData.skills && formData.skills.length > 0) score += 10;
    return Math.min(100, score);
  }, [profile, formData]);

  return (
    <div className="py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast Alert */}
        {toastMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md font-semibold text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" /> {toastMsg}
          </div>
        )}

        {/* Profile Card Header */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
          {/* Subtle Banner */}
          <div className="h-24 bg-slate-800" />

          <div className="px-5 sm:px-6 pb-5">
            <div className="relative -mt-10 mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              {/* Avatar */}
              <div className="w-18 h-18 w-20 h-20 bg-white rounded-lg p-1 shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-slate-100 text-primary rounded-md flex items-center justify-center font-bold text-2xl">
                  {user?.username ? user.username[0].toUpperCase() : <User size={28} />}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <label className="cursor-pointer bg-white text-slate-700 border border-slate-200 hover:border-slate-300 px-3.5 py-1.5 rounded-md font-semibold text-xs shadow-sm hover:text-primary transition-colors flex items-center gap-1.5">
                  <UploadCloud size={14} className={resumeParsing ? 'animate-bounce text-primary' : ''} />
                  {resumeParsing ? 'Parsing Skills...' : 'Upload Resume'}
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                </label>

                <button
                  onClick={() => setEditing(!editing)}
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-md font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Edit3 size={13} /> {editing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* Profile Identifiers */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {formData.fullName || user?.fullName || user?.username || 'Professional Candidate'}
                </h1>
                <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded uppercase">
                  {role ? role.replace('ROLE_', '') : 'CANDIDATE'}
                </span>
              </div>

              <p className="text-primary font-semibold text-sm mt-0.5">
                {formData.currentJobTitle || (role === 'ROLE_CANDIDATE' ? 'Candidate Profile' : 'Professional Profile')}
              </p>

              <div className="flex flex-wrap gap-3 mt-2 text-slate-500 text-xs">
                {formData.location ? (
                  <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                    <MapPin size={12} className="text-slate-400" /> {formData.location}
                  </span>
                ) : null}
                {formData.totalExperienceYears !== '' && formData.totalExperienceYears !== null && Number(formData.totalExperienceYears) >= 0 ? (
                  <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                    <Briefcase size={12} className="text-slate-400" /> {Number(formData.totalExperienceYears) === 0 ? 'Fresher (0 Years Experience)' : `${formData.totalExperienceYears}+ Years Experience`}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-slate-400">
                    <Briefcase size={12} className="text-slate-400" /> Experience: Not specified
                  </span>
                )}
                {formData.expectedSalary !== '' && formData.expectedSalary !== null && Number(formData.expectedSalary) > 0 ? (
                  <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                  <IndianRupee size={12} className="text-slate-400" /> ₹{Number(formData.expectedSalary).toLocaleString('en-IN')} / yr Expected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-slate-400">
                    <IndianRupee size={12} className="text-slate-400" /> Expected Salary: Not specified
                  </span>
                )}
                <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                  <Shield size={12} className="text-emerald-600" /> Verified Candidate
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {editing ? (
          <form onSubmit={handleSaveProfile} className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4 mb-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Edit Candidate Profile
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 px-3 py-2 rounded-md text-xs font-medium outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Job Title / Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Full Stack Developer"
                  value={formData.currentJobTitle}
                  onChange={(e) => setFormData({ ...formData, currentJobTitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 px-3 py-2 rounded-md text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Location</label>
                <input
                  type="text"
                  placeholder="e.g. New York, USA or Bengaluru, India"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 px-3 py-2 rounded-md text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  placeholder="Enter experience in years (e.g. 2)"
                  value={formData.totalExperienceYears}
                  onChange={(e) => setFormData({ ...formData, totalExperienceYears: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 px-3 py-2 rounded-md text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Expected Salary (₹ / yr — Annual CTC in INR)</label>
                <input
                  type="number"
                  placeholder="Enter expected annual CTC in INR (e.g. 600000)"
                  value={formData.expectedSalary}
                  onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 px-3 py-2 rounded-md text-xs font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Professional Summary</label>
              <textarea
                rows={3}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 p-3 rounded-md text-xs font-medium outline-none leading-relaxed"
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-1.5 border border-slate-200 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Save size={13} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : null}

        {/* Readonly Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Summary & Skills */}
          <div className="lg:col-span-2 space-y-4">
            {/* Professional Summary */}
            <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Professional Summary</h3>
              {cleanSummary(formData.summary) ? (
                <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed">{cleanSummary(formData.summary)}</p>
              ) : (
                <p className="text-slate-400 text-xs italic">No summary provided yet. Click "Edit Profile" to add one.</p>
              )}
            </div>

            <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Resume Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Education</span>
                  <span className="text-slate-700">{formData.education || 'Not detected'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Phone</span>
                  <span className="text-slate-700">{formData.phone || 'Not detected'}</span>
                </div>
                {[
                  ['LinkedIn', formData.linkedInUrl],
                  ['GitHub', formData.gitHubUrl],
                  ['Portfolio', formData.portfolioUrl]
                ].map(([label, url]) => url ? (
                  <div key={label}>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</span>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block" title={url}>{url}</a>
                  </div>
                ) : null)}
              </div>
            </div>

            {/* Technical Skills Manager */}
            <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Verified Skills</h3>
                <span className="text-xs font-semibold text-primary bg-red-50 px-2 py-0.5 rounded border border-red-100">
                  {formData.skills.length} Technical Skills
                </span>
              </div>

              {/* Add Skill Input */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Add skill (e.g. AWS, Docker, Kubernetes)..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
                  className="flex-1 bg-slate-50 border border-slate-200 focus:border-slate-400 px-3 py-1.5 rounded-md text-xs font-medium outline-none"
                />
                <button
                  onClick={() => addSkill(skillInput)}
                  className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded text-xs font-medium"
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="text-slate-400 hover:text-primary">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Suggested Skills */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold flex items-center gap-1"><Sparkles size={11} className="text-primary" /> Suggested:</span>
                {SUGGESTED_SKILLS.filter(s => !formData.skills.includes(s)).slice(0, 5).map(s => (
                  <button
                    key={s}
                    onClick={() => addSkill(s)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-red-50 hover:text-primary rounded text-[11px] font-medium transition-colors border border-slate-200"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Resume & Profile Strength */}
          <div className="space-y-4">
            {/* Active Resume Card */}
            <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText size={15} className="text-primary" /> Active Resume
                </h3>
                {profile?.resumeUrl && (
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                    Attached
                  </span>
                )}
              </div>

              {profile?.resumeUrl ? (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-slate-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800 truncate" title={profile.resumeFileName || 'Resume.pdf'}>
                        {profile.resumeFileName || 'Candidate_Resume.pdf'}
                      </p>
                      <span className="text-[10px] text-slate-400">Used for profile parsing & applications</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <a
                      href={`http://localhost:8080${profile.resumeUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 py-1.5 rounded transition-colors"
                    >
                      <Download size={12} /> View
                    </a>
                    <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-1 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 py-1.5 rounded transition-colors">
                      <UploadCloud size={12} /> Replace
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 p-4">
                  <UploadCloud size={24} className="mx-auto text-slate-400 mb-1.5" />
                  <p className="text-xs text-slate-600 font-medium">No resume attached to profile</p>
                  <p className="text-[10px] text-slate-400 mb-3">Upload your resume to extract skills automatically</p>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition-colors">
                    <UploadCloud size={13} /> {resumeParsing ? 'Parsing...' : 'Upload Resume'}
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                  </label>
                </div>
              )}
            </div>

            {/* Profile Completeness Card */}
            <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Profile Completeness
              </span>
              <p className="text-2xl font-bold text-slate-900 tracking-tight mb-2">{completionPct}%</p>
              
              <div className="h-2 w-full bg-slate-100 rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${completionPct}%` }}
                />
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Profiles above 80% strength receive 3x more recruiter direct messages and interview invitations.
              </p>

              <button
                onClick={() => handleSaveProfile()}
                disabled={saving}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-xs py-2 rounded-md transition-colors"
              >
                {saving ? 'Saving...' : 'Sync & Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
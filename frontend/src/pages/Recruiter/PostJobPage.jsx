import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Briefcase, ArrowLeft, Building2, MapPin, IndianRupee, Clock, 
  Check, Plus, X, Sparkles, Calendar, Users, ShieldAlert, FileText 
} from 'lucide-react';
import { postJob } from '../../services/recruiterApi';

const POPULAR_SKILLS = [
  'Java', 'Spring Boot', 'React', 'TypeScript', 'Node.js', 'Python', 
  'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Microservices', 'GraphQL', 'REST APIs',
  'Kafka', 'Go', 'SQL', 'MongoDB', 'Redis', 'CI/CD', 'Terraform'
];

export default function PostJobPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Tag inputs for 3 skill tiers
  const [reqSkillInput, setReqSkillInput] = useState('');
  const [prefSkillInput, setPrefSkillInput] = useState('');
  const [addSkillInput, setAddSkillInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    categoryName: '',
    location: '',
    workMode: '',
    jobType: '',
    minExperience: '',
    maxExperience: '',
    openings: '',
    department: '',
    industry: '',
    applicationDeadline: '',
    salaryRange: '',
    description: '',
    responsibilities: '',
    benefits: '',
    educationRequirements: '',
    skills: [],
    preferredSkills: [],
    additionalSkills: [],
    status: 'PUBLISHED'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Helper for adding/removing skills per tier
  const handleAddSkillToTier = (tier, skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (tier === 'required' && !formData.skills.includes(trimmed)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setReqSkillInput('');
    } else if (tier === 'preferred' && !formData.preferredSkills.includes(trimmed)) {
      setFormData(prev => ({ ...prev, preferredSkills: [...prev.preferredSkills, trimmed] }));
      setPrefSkillInput('');
    } else if (tier === 'additional' && !formData.additionalSkills.includes(trimmed)) {
      setFormData(prev => ({ ...prev, additionalSkills: [...prev.additionalSkills, trimmed] }));
      setAddSkillInput('');
    }
  };

  const handleRemoveSkillFromTier = (tier, skillToRemove) => {
    if (tier === 'required') {
      setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    } else if (tier === 'preferred') {
      setFormData(prev => ({ ...prev, preferredSkills: prev.preferredSkills.filter(s => s !== skillToRemove) }));
    } else if (tier === 'additional') {
      setFormData(prev => ({ ...prev, additionalSkills: prev.additionalSkills.filter(s => s !== skillToRemove) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.companyName.trim() || !formData.location.trim() || !formData.description.trim()) {
      setError('Please complete the job title, hiring company, location, and description.');
      return;
    }
    if (!formData.categoryName || !formData.workMode || !formData.jobType || formData.skills.length === 0) {
      setError('Please select a category, work mode, job type, and at least one required skill.');
      return;
    }
    if (formData.minExperience === '' || formData.maxExperience === '' || formData.openings === '') {
      setError('Please provide experience bounds and the number of openings.');
      return;
    }
    if (Number(formData.minExperience) > Number(formData.maxExperience)) {
      setError('Maximum experience must be greater than or equal to minimum experience.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        companyName: formData.companyName,
        categoryName: formData.categoryName,
        location: formData.location,
        workMode: formData.workMode,
        jobType: formData.jobType,
        experienceRequired: Number(formData.minExperience),
        minExperience: Number(formData.minExperience),
        maxExperience: Number(formData.maxExperience),
        openings: Number(formData.openings),
        department: formData.department,
        industry: formData.industry,
        applicationDeadline: formData.applicationDeadline,
        salaryRange: formData.salaryRange,
        description: formData.description,
        responsibilities: formData.responsibilities,
        benefits: formData.benefits,
        educationRequirements: formData.educationRequirements,
        skills: formData.skills,
        preferredSkills: formData.preferredSkills,
        additionalSkills: formData.additionalSkills,
        status: 'PUBLISHED' // Jobs are directly published — no admin verification required
      };

      await postJob(payload);
      navigate('/recruiter/dashboard');
    } catch (err) {
      console.error('Job creation failed', err);
      setError(err.response?.data?.message || 'Failed to post job. Please verify your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-6 sm:py-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Navigation */}
        <Link
          to="/recruiter/dashboard"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium text-xs sm:text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Recruitment Console
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                New Requisition
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Create Job Opening
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">
                Define skill tiers, compensation, and experience requirements.
              </p>
            </div>
            <div className="w-10 h-10 bg-red-50 text-primary rounded-lg flex items-center justify-center border border-red-100">
              <Briefcase size={20} />
            </div>
          </div>

          {/* Published Notice */}
          <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start gap-2.5">
            <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Your job posting goes live instantly.</strong>
              <span className="block mt-0.5 text-[11px] text-emerald-800">
                New openings are published directly to the candidate feed — no admin review delay.
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-6 bg-red-50 text-primary border border-red-200 rounded-md text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            
            {/* Job Title & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Requisition Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Lead Distributed Systems Engineer"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs outline-none transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hiring Company *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs outline-none transition-colors font-medium pr-8"
                  />
                  <Building2 size={15} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Department, Industry, Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  placeholder="e.g. Platform Infrastructure"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs outline-none transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  placeholder="e.g. Cloud & Enterprise Software"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs outline-none transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs outline-none transition-colors font-medium"
                >
                  <option value="">Select category</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Data & Analytics">Data & Analytics</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Design & UX">Design & UX</option>
                  <option value="Product Management">Product Management</option>
                  <option value="QA & Testing">QA & Testing</option>
                  <option value="Mobile Development">Mobile Development</option>
                </select>
              </div>
            </div>

            {/* Location, Work Mode, Job Type, Openings */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location / City *
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs outline-none transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Mode
                </label>
                <select
                  name="workMode"
                  value={formData.workMode}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs outline-none transition-colors font-medium"
                >
                  <option value="">Select work mode</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Type
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs outline-none transition-colors font-medium"
                >
                  <option value="">Select job type</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Openings
                </label>
                <input
                  type="number"
                  name="openings"
                  min="1"
                  max="100"
                  value={formData.openings}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs outline-none transition-colors font-medium"
                />
              </div>
            </div>

            {/* Experience Bounds, Salary, Deadline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Min Exp (Yrs)
                </label>
                <input
                  type="number"
                  name="minExperience"
                  min="0"
                  max="25"
                  value={formData.minExperience}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs outline-none transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Max Exp (Yrs)
                </label>
                <input
                  type="number"
                  name="maxExperience"
                  min="0"
                  max="30"
                  value={formData.maxExperience}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs outline-none transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Salary Range (₹ INR / LPA)
                </label>
                <input
                  type="text"
                  name="salaryRange"
                  placeholder="e.g. 18-28 LPA or ₹18L-₹28L per annum"
                  value={formData.salaryRange}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs outline-none transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs outline-none transition-colors font-medium"
                />
              </div>
            </div>

            {/* SKILLS TIERS */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-primary" /> Categorized Skill Requirements
              </h3>

              {/* 1. Required Skills (Core) */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Required Skills (Core Qualifications) *</span>
                  <span className="text-[10px] text-slate-500 font-normal">Used heavily in match percentage</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Type skill & press Enter or click Add..."
                    value={reqSkillInput}
                    onChange={(e) => setReqSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkillToTier('required', reqSkillInput); } }}
                    className="flex-1 bg-white border border-slate-200 focus:border-slate-400 px-3 py-1.5 rounded-md text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkillToTier('required', reqSkillInput)}
                    className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-md text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1 bg-red-50 text-primary border border-red-200 px-2 py-0.5 rounded text-xs font-medium">
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkillFromTier('required', skill)} className="hover:text-red-800">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 2. Preferred Skills */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Preferred Skills (Bonus / Good to Have)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Adds bonus candidate ranking</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Type preferred skill..."
                    value={prefSkillInput}
                    onChange={(e) => setPrefSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkillToTier('preferred', prefSkillInput); } }}
                    className="flex-1 bg-white border border-slate-200 focus:border-slate-400 px-3 py-1.5 rounded-md text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkillToTier('preferred', prefSkillInput)}
                    className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.preferredSkills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-xs font-medium">
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkillFromTier('preferred', skill)} className="hover:text-blue-950">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 3. Additional Skills */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Additional / Domain Skills</span>
                  <span className="text-[10px] text-slate-500 font-normal">Methodologies, toolsets, or niche capabilities</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Type additional skill..."
                    value={addSkillInput}
                    onChange={(e) => setAddSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkillToTier('additional', addSkillInput); } }}
                    className="flex-1 bg-white border border-slate-200 focus:border-slate-400 px-3 py-1.5 rounded-md text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkillToTier('additional', addSkillInput)}
                    className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.additionalSkills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1 bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-xs font-medium">
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkillFromTier('additional', skill)} className="hover:text-black">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Content Areas */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Description & Overview *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Overview of the mission, business unit, and team culture..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white p-3 rounded-md text-xs outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Responsibilities
                </label>
                <textarea
                  name="responsibilities"
                  rows={3}
                  placeholder="List 3-5 core duties (one per line)..."
                  value={formData.responsibilities}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white p-3 rounded-md text-xs outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Perks, Benefits & Compensation Details
                </label>
                <textarea
                  name="benefits"
                  rows={2}
                  placeholder="Health insurance, stock options, learning stipends, remote setup..."
                  value={formData.benefits}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white p-3 rounded-md text-xs outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/recruiter/dashboard')}
                className="px-4 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting Requisition...' : 'Submit Job for Moderation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

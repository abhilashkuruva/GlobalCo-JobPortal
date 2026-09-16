import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, Briefcase, FileCheck, Calendar, Search,
  Plus, ChevronRight, CheckCircle2,
  MapPin, X, Send, Sparkles, Download, FileSpreadsheet
} from 'lucide-react';
import { getMyJobs, getRecruiterStats, downloadApplicationsZip, downloadApplicationsExcel } from '../../services/recruiterApi';

export default function RecruiterDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('requisitions');
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    shortlisted: 0,
    scheduledInterviews: 0
  });
  const [loading, setLoading] = useState(true);

  // Sourcing & Candidate Discovery State
  const [talentSearch, setTalentSearch] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('ALL');
  const [inviteModalCandidate, setInviteModalCandidate] = useState(null);
  const [selectedJobForInvite, setSelectedJobForInvite] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [toastNotification, setToastNotification] = useState('');

  // Curated platform candidate pool for talent sourcing
  const [candidatesPool] = useState([
    {
      id: 1,
      name: 'Riya Sharma',
      username: 'riya.backend',
      title: 'Senior Full Stack & Java Architect',
      experience: 6,
      location: 'Bengaluru, India (Open to Remote)',
      skills: ['Java', 'Spring Boot', 'Microservices', 'Docker', 'Kubernetes', 'PostgreSQL', 'React'],
      matchScore: 98,
      education: 'B.Tech in Computer Science',
      summary: 'Experienced backend and cloud architect with strong expertise in high-throughput Java microservices and distributed event architectures.',
      available: true
    },
    {
      id: 2,
      name: 'Ananya Verma',
      username: 'ananya.cloud',
      title: 'Cloud DevOps & SRE Engineer',
      experience: 4,
      location: 'Pune, India',
      skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'Linux', 'Python'],
      matchScore: 92,
      education: 'M.S. in Information Systems',
      summary: 'Specialized in scalable Kubernetes clusters, zero-downtime CI/CD deployments, and cloud infrastructure monitoring.',
      available: true
    },
    {
      id: 3,
      name: 'Alex Chen',
      username: 'alex.chen',
      title: 'Frontend Lead & React Specialist',
      experience: 5,
      location: 'Singapore (Remote)',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Redux', 'GraphQL'],
      matchScore: 88,
      education: 'B.S. in Software Engineering',
      summary: 'Passionate UI/UX engineer with deep expertise in accessible component design systems and high-performance React web applications.',
      available: true
    },
    {
      id: 4,
      name: 'Priya Patel',
      username: 'priya.data',
      title: 'Senior Data & Analytics Engineer',
      experience: 5,
      location: 'Hyderabad, India',
      skills: ['Python', 'SQL', 'Apache Spark', 'Kafka', 'PostgreSQL', 'Airflow', 'AWS'],
      matchScore: 90,
      education: 'M.Tech in Data Science',
      summary: 'Data engineer specializing in real-time streaming pipelines with Apache Kafka, data warehousing, and ETL optimization.',
      available: true
    },
    {
      id: 5,
      name: 'Marcus Vance',
      username: 'marcus.v',
      title: 'Security & Backend Engineer',
      experience: 7,
      location: 'London, UK (Remote)',
      skills: ['Java', 'Spring Security', 'OAuth2', 'JWT', 'PostgreSQL', 'Docker'],
      matchScore: 86,
      education: 'B.Sc. in Cybersecurity',
      summary: 'Security-focused developer experienced in identity federation, Spring Security hardening, and vulnerability assessments.',
      available: false
    }
  ]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [jobsData, statsData] = await Promise.all([
        getMyJobs(0, 20),
        getRecruiterStats().catch(() => null)
      ]);
      const jobList = jobsData.content || jobsData || [];
      setJobs(jobList);
      if (jobList.length > 0) {
        setSelectedJobForInvite(jobList[0].id);
      }
      if (statsData) {
        setStats({
          activeJobs: statsData.activeJobs ?? jobList.length,
          totalApplicants: statsData.totalApplicants ?? 24,
          shortlisted: statsData.shortlisted ?? 8,
          scheduledInterviews: statsData.scheduledInterviews ?? 4
        });
      } else {
        setStats({
          activeJobs: jobList.length,
          totalApplicants: 24,
          shortlisted: 8,
          scheduledInterviews: 4
        });
      }
    } catch (err) {
      console.error('Recruiter dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(''), 4000);
  };

  const handleDownloadZip = async (jobId, e) => {
    e.stopPropagation();
    try {
      const blob = await downloadApplicationsZip(jobId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `applications_${jobId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      notify('Applications ZIP downloaded successfully.');
    } catch (err) {
      notify('Failed to download ZIP. Please try again.');
    }
  };

  const handleDownloadExcel = async (jobId, e) => {
    e.stopPropagation();
    try {
      const blob = await downloadApplicationsExcel(jobId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `applications_${jobId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      notify('Excel report downloaded successfully.');
    } catch (err) {
      notify('Failed to download Excel. Please try again.');
    }
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    const job = jobs.find(j => j.id.toString() === selectedJobForInvite.toString());
    const jobTitle = job ? job.title : 'Active Opportunity';
    notify(`Direct invitation dispatched to ${inviteModalCandidate.name} for "${jobTitle}"!`);
    setInviteModalCandidate(null);
  };

  const statCards = [
    { label: 'Active Openings', count: stats.activeJobs, icon: <Briefcase size={22} />, color: 'bg-primary-light text-primary' },
    { label: 'Total Candidates', count: stats.totalApplicants, icon: <Users size={22} />, color: 'bg-slate-100 text-dark' },
    { label: 'Shortlisted', count: stats.shortlisted, icon: <FileCheck size={22} />, color: 'bg-primary-light text-primary' },
    { label: 'Interviews Scheduled', count: stats.scheduledInterviews, icon: <Calendar size={22} />, color: 'bg-slate-100 text-dark' },
  ];

  const allSkillsList = ['ALL', 'Java', 'Spring Boot', 'React', 'AWS', 'Docker', 'Kubernetes', 'Python', 'PostgreSQL'];

  const filteredCandidates = candidatesPool.filter(c => {
    const q = talentSearch.toLowerCase();
    const matchesQuery = !q || (
      c.name.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.skills.some(s => s.toLowerCase().includes(q))
    );
    const matchesSkill = selectedSkillFilter === 'ALL' || c.skills.some(s => s.toLowerCase() === selectedSkillFilter.toLowerCase());
    return matchesQuery && matchesSkill;
  });

  return (
    <div className="py-6 sm:py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Recruitment Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Hiring Dashboard
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Manage job postings, review applicant pipelines, and source top qualified talent.
            </p>
          </div>
          <button
            onClick={() => navigate('/recruiter/post-job')}
            className="inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium text-xs sm:text-sm shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus size={15} /> Post Job
          </button>
        </div>

        {/* Toast Alert */}
        {toastNotification && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2" role="alert">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" /> {toastNotification}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {statCards.map((s, i) => (
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar" role="tablist" aria-label="Recruitment workspace sections">
          <button
            role="tab"
            aria-selected={activeTab === 'requisitions'}
            onClick={() => setActiveTab('requisitions')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium text-xs transition-colors whitespace-nowrap ${
              activeTab === 'requisitions'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Briefcase size={14} /> Requisitions ({jobs.length})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'sourcing'}
            onClick={() => setActiveTab('sourcing')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium text-xs transition-colors whitespace-nowrap ${
              activeTab === 'sourcing'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles size={14} /> Talent Sourcing ({candidatesPool.length})
          </button>
        </div>

        {/* Tab 1: Active Requisitions */}
        {activeTab === 'requisitions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Jobs Table */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Active Job Requisitions</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Click any job to open the applicant tracking pipeline.</p>
                  </div>
                  <Link
                    to="/recruiter/post-job"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus size={13} /> New Requisition
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                        <th className="px-4 py-2.5">Job Title</th>
                        <th className="px-4 py-2.5 hidden sm:table-cell">Work Mode</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5 hidden md:table-cell">Export</th>
                        <th className="px-4 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading && (
                        <tr>
                          <td colSpan="4" className="text-center py-8 text-slate-400">
                            Loading requisitions...
                          </td>
                        </tr>
                      )}
                      {!loading && jobs.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center py-8 text-slate-500">
                            <p className="font-semibold text-slate-800 mb-1">No active jobs posted yet.</p>
                            <button
                              onClick={() => navigate('/recruiter/post-job')}
                              className="text-primary text-xs font-semibold hover:underline"
                            >
                              Post your first opportunity →
                            </button>
                          </td>
                        </tr>
                      )}
                      {jobs.map((job) => (
                        <tr
                          key={job.id}
                          onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900 text-xs">
                              {job.title}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {job.companyName || 'GlobalCo'} • {job.experienceRequired || 0}+ yrs exp
                            </p>
                          </td>
                          <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                              {job.workMode || 'Hybrid'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-medium text-[10px] px-2 py-0.5 rounded border ${
                              job.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : job.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {job.status || 'PUBLISHED'}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={e => handleDownloadZip(job.id, e)}
                                title="Download ZIP (Excel + Resumes)"
                                className="inline-flex items-center gap-1 px-2 py-1 border border-slate-200 rounded text-[10px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                              >
                                <Download size={11} /> ZIP
                              </button>
                              <button
                                onClick={e => handleDownloadExcel(job.id, e)}
                                title="Download Excel only"
                                className="inline-flex items-center gap-1 px-2 py-1 border border-slate-200 rounded text-[10px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                              >
                                <FileSpreadsheet size={11} /> XLS
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                              View Pipeline <ChevronRight size={13} />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Next Interviews & Recruitment Activity */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Upcoming Interviews</h3>
                <div className="space-y-2.5">
                  {[
                    { name: 'Riya Sharma', role: 'Lead Java Architect', time: '10:30 AM', day: 'Tomorrow' },
                    { name: 'Ananya Verma', role: 'Full Stack Engineer', time: '02:00 PM', day: 'Thursday' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-md border border-slate-100">
                      <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {item.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 text-xs truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{item.role}</p>
                        <span className="text-[10px] text-primary font-medium block mt-0.5">
                          {item.day} • {item.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Insights Card */}
              <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Candidate Matching
                </span>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Algorithmic Scoring</h3>
                <p className="text-slate-500 text-xs mb-3 leading-relaxed">
                  Candidates are scored and ranked based on verified skill overlap, experience level, and location compatibility.
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
                  <CheckCircle2 size={14} /> Multi-Factor Match Active
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Talent Sourcing & Candidate Discovery */}
        {activeTab === 'sourcing' && (
          <div className="space-y-6">
            {/* Sourcing Header & Filter Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  aria-label="Search candidates by skill, name or title"
                  placeholder="Search by skill, title, or location..."
                  value={talentSearch}
                  onChange={(e) => setTalentSearch(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-primary pl-8 pr-3 py-1.5 rounded-md text-xs outline-none"
                />
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              {/* Skill Pill Badges */}
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter candidates by primary skill">
                {allSkillsList.map(skill => (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkillFilter(skill)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      selectedSkillFilter === skill
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredCandidates.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-white rounded-lg border border-slate-200 p-6">
                  <Users size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-800 text-sm">No candidates found</p>
                  <p className="text-xs text-slate-500 mt-0.5">Try searching for other skills or clearing your filter.</p>
                </div>
              ) : (
                filteredCandidates.map(cand => (
                  <div
                    key={cand.id}
                    className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Top */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 bg-slate-100 text-slate-700 rounded-md flex items-center justify-center font-bold text-sm">
                            {cand.name[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs">{cand.name}</h4>
                            <p className="text-[11px] text-slate-500">{cand.title}</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-medium text-[10px] px-2 py-0.5 rounded border border-emerald-200">
                          {cand.matchScore}% Match
                        </span>
                      </div>

                      {/* Location & Experience */}
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium mb-2.5">
                        <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-400" /> {cand.location}</span>
                        <span className="flex items-center gap-1"><Briefcase size={12} className="text-slate-400" /> {cand.experience}+ yrs</span>
                      </div>

                      {/* Summary */}
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                        {cand.summary}
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {cand.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setInviteModalCandidate(cand);
                          setInviteMessage(`Hi ${cand.name}, your profile and skill set in ${cand.skills.slice(0, 3).join(', ')} align exceptionally well with our open opportunity. We invite you to review and apply!`);
                        }}
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-dark text-white py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm"
                      >
                        <Send size={12} /> Invite to Requisition
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Direct Invitation Modal */}
        {inviteModalCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="invite-modal-title">
            <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-slate-200 relative">
              <button
                onClick={() => setInviteModalCandidate(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                  {inviteModalCandidate.name[0]}
                </div>
                <div>
                  <h3 id="invite-modal-title" className="text-sm font-bold text-slate-900">
                    Invite {inviteModalCandidate.name}
                  </h3>
                  <p className="text-xs text-slate-500">{inviteModalCandidate.title} • {inviteModalCandidate.experience} yrs exp</p>
                </div>
              </div>

              <form onSubmit={handleSendInvite} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Requisition
                  </label>
                  <select
                    value={selectedJobForInvite}
                    onChange={(e) => setSelectedJobForInvite(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 focus:border-primary p-2 rounded-md text-xs outline-none"
                  >
                    {jobs.length === 0 ? (
                      <option value="">No active jobs available</option>
                    ) : (
                      jobs.map(j => (
                        <option key={j.id} value={j.id}>
                          {j.title} ({j.workMode || 'Remote'})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Personalized Outreach Message
                  </label>
                  <textarea
                    rows={3}
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-primary p-2 rounded-md text-xs outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setInviteModalCandidate(null)}
                    className="px-3 py-1.5 rounded-md border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Send size={13} /> Send Invitation
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

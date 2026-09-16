import React, { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, ShieldCheck, ChevronRight, ChevronLeft, User, Building, 
  Upload, FileText, CheckCircle2, AlertCircle, Info, Lock, Globe, Phone, Mail, MapPin, Hash, Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PasswordField from '../../components/common/inputs/PasswordField';
import GlobalCoLogo from '../../components/GlobalCoLogo';

function strengthFor(password) {
  const s = password || '';
  let points = 0;
  if (s.length >= 8) points++;
  if (/[A-Z]/.test(s)) points++;
  if (/[a-z]/.test(s)) points++;
  if (/[0-9]/.test(s)) points++;
  if (/[^A-Za-z0-9]/.test(s)) points++;
  if (!s) return { label: '—', pct: 0 };
  if (points <= 2) return { label: 'Weak', pct: 33 };
  if (points <= 4) return { label: 'Good', pct: 66 };
  return { label: 'Strong', pct: 100 };
}

export default function RegisterPage() {
  const { registerCandidate, registerRecruiter, loading } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('CANDIDATE'); // 'CANDIDATE' or 'RECRUITER'
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [recruiterSubmitted, setRecruiterSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Candidate Form State
  const [candForm, setCandForm] = useState({
    username: '',
    email: '',
    confirmEmail: '',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    location: '',
    password: '',
    confirmPassword: '',
    resumeFile: null
  });

  // Recruiter Form State
  const [recForm, setRecForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    designation: '',
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyWebsite: '',
    companyAddress: '',
    companyLocation: '',
    industry: 'Technology & Software',
    companyType: 'Private Limited',
    registrationNumber: '',
    employeeId: '',
    linkedInUrl: '',
    identityProof: null,
    companyProof: null
  });

  const candStrength = useMemo(() => strengthFor(candForm.password), [candForm.password]);
  const recStrength = useMemo(() => strengthFor(recForm.password), [recForm.password]);

  const onCandChange = (field) => (e) => {
    if (error) setError('');
    setCandForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const onRecChange = (field) => (e) => {
    if (error) setError('');
    setRecForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  // Resume File Selection for Candidate
  const handleResumeSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setError('Resume file size must be less than 15MB');
      return;
    }
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(ext)) {
      setError('Please upload a PDF, DOC, or DOCX resume document.');
      return;
    }
    setError('');
    setCandForm(prev => ({ ...prev, resumeFile: file }));
  };

  // Refs for file inputs (more reliable than htmlFor with hidden inputs)
  const identityInputRef = useRef(null);
  const companyProofInputRef = useRef(null);

  // Recruiter Identity File
  const handleIdentitySelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setError('Identity document must be under 15MB');
      return;
    }
    setError('');
    setRecForm(prev => ({ ...prev, identityProof: file }));
  };

  // Recruiter Company Proof File
  const handleCompanyProofSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setError('Company certificate document must be under 15MB');
      return;
    }
    setError('');
    setRecForm(prev => ({ ...prev, companyProof: file }));
  };

  // Validate Candidate Step
  const validateCandidate = (targetStep = step) => {
    if (targetStep >= 1) {
      if (!candForm.username.trim()) return 'Username is required';
      if (!candForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candForm.email)) return 'Valid email is required';
      if (candForm.email !== candForm.confirmEmail) return 'Emails do not match';
    }
    if (targetStep >= 2) {
      if (!candForm.firstName.trim() || !candForm.lastName.trim()) return 'First and last name are required';
      if (!candForm.mobileNumber.trim()) return 'Mobile number is required';
      if (!candForm.location.trim()) return 'Location is required';
      if (!candForm.resumeFile) return 'A mandatory resume file (PDF/DOC/DOCX) is required to register as a job seeker';
    }
    if (targetStep >= 3) {
      if (!candForm.password) return 'Password is required';
      if (candForm.password.length < 8) return 'Password must be at least 8 characters long';
      if (candForm.password !== candForm.confirmPassword) return 'Passwords do not match';
    }
    return null;
  };

  // Validate Recruiter Step
  const validateRecruiter = (targetStep = step) => {
    if (targetStep >= 1) {
      if (!recForm.username.trim()) return 'Username is required';
      if (!recForm.fullName.trim()) return 'Full Name is required';
      if (!recForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recForm.email)) return 'Valid recruiter email is required';
      if (!recForm.phone.trim()) return 'Recruiter contact phone is required';
      if (!recForm.password) return 'Password is required';
      if (recForm.password.length < 8) return 'Password must be at least 8 characters long';
      if (recForm.password !== recForm.confirmPassword) return 'Passwords do not match';
    }
    if (targetStep >= 2) {
      if (!recForm.companyName.trim()) return 'Company name is required';
      if (!recForm.companyLocation.trim()) return 'Company city/location is required';
      if (!recForm.companyAddress.trim()) return 'Company office address is required';
      if (recForm.companyEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recForm.companyEmail.trim())) {
        return 'Valid company email format is required';
      }
    }
    if (targetStep >= 3) {
      if (!recForm.identityProof) return 'Identity proof document is required (Work Badge / Govt ID / Aadhar Card)';
    }
    // Note: employeeId is optional
    return null;
  };

  const nextStep = () => {
    const err = role === 'CANDIDATE' ? validateCandidate() : validateRecruiter();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  // Submit Candidate Form
  const submitCandidate = async (e) => {
    e.preventDefault();
    const err = validateCandidate(3);
    if (err) {
      setError(err);
      return;
    }
    try {
      const data = new FormData();
      data.append('username', candForm.username.trim());
      data.append('email', candForm.email.trim());
      data.append('password', candForm.password);
      data.append('fullName', `${candForm.firstName.trim()} ${candForm.lastName.trim()}`);
      data.append('mobileNumber', candForm.mobileNumber.trim());
      data.append('location', candForm.location.trim());
      data.append('resume', candForm.resumeFile);

      await registerCandidate(data);
      navigate('/candidate/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Candidate registration failed. Please try again.');
    }
  };

  // Submit Recruiter Form
  const submitRecruiter = async (e) => {
    e.preventDefault();
    const err = validateRecruiter(3);
    if (err) {
      setError(err);
      return;
    }
    try {
      const data = new FormData();
      data.append('username', recForm.username.trim());
      data.append('email', recForm.email.trim());
      data.append('password', recForm.password);
      data.append('fullName', recForm.fullName.trim());
      data.append('phone', recForm.phone.trim());
      data.append('designation', recForm.designation.trim());
      data.append('companyName', recForm.companyName.trim());
      data.append('companyEmail', recForm.companyEmail.trim());
      data.append('companyPhone', recForm.companyPhone.trim());
      data.append('companyWebsite', recForm.companyWebsite.trim());
      data.append('companyAddress', recForm.companyAddress.trim());
      data.append('companyLocation', recForm.companyLocation.trim());
      data.append('industry', recForm.industry);
      data.append('companyType', recForm.companyType);
      data.append('registrationNumber', recForm.registrationNumber.trim());
      data.append('employeeId', recForm.employeeId.trim());
      data.append('linkedInUrl', recForm.linkedInUrl.trim());

      if (recForm.identityProof) {
        data.append('identityProof', recForm.identityProof);
      }
      if (recForm.companyProof) {
        data.append('companyProof', recForm.companyProof);
      }

      const res = await registerRecruiter(data);
      setSubmittedData({
        companyName: recForm.companyName,
        fullName: recForm.fullName,
        email: recForm.email
      });
      setRecruiterSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Recruiter registration failed. Please try again.');
    }
  };

  // Recruiter Pending Approval Success Screen
  if (recruiterSubmitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-lg bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
            Verification Request Submitted!
          </h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            Thank you, <strong className="text-slate-800">{submittedData?.fullName}</strong>. Your recruiter registration request for <strong className="text-slate-800">{submittedData?.companyName}</strong> has been received and is currently <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold text-[11px]">PENDING APPROVAL</span>.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left space-y-2.5 mb-6 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>Identity & corporate credentials securely stored</span>
            </div>
            <div className="flex items-start gap-2">
              <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <span>Platform administrators will inspect your documentation to maintain marketplace trust</span>
            </div>
            <div className="flex items-start gap-2">
              <Lock size={16} className="text-slate-500 shrink-0 mt-0.5" />
              <span>You will be able to log in to post jobs and review candidates once approved</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/login"
              className="flex-1 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-md font-semibold text-xs transition-colors flex items-center justify-center"
            >
              Go to Sign In
            </Link>
            <Link
              to="/"
              className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-md font-semibold text-xs transition-colors flex items-center justify-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-xl bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
        
        {/* Role Switcher Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <GlobalCoLogo />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Step {step} of 3
            </span>
          </div>

          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Select Account Type
          </label>
          <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => { setRole('CANDIDATE'); setStep(1); setError(''); }}
              className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                role === 'CANDIDATE'
                  ? 'bg-white text-primary shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User size={15} /> Job Seeker / Student
            </button>
            <button
              type="button"
              onClick={() => { setRole('RECRUITER'); setStep(1); setError(''); }}
              className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                role === 'RECRUITER'
                  ? 'bg-white text-primary shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building size={15} /> Recruiter / Employer
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  step >= i ? 'bg-primary' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between items-center mt-2.5">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              {role === 'CANDIDATE' ? (
                step === 1 ? 'Job Seeker Credentials' : step === 2 ? 'Profile & Mandatory Resume' : 'Security Setup'
              ) : (
                step === 1 ? 'Recruiter Account Info' : step === 2 ? 'Company Details' : 'Identity Verification'
              )}
            </h1>
            <span className="text-[11px] text-slate-400 font-medium">
              {role === 'CANDIDATE' ? 'Direct Registration' : 'Admin Approval Required'}
            </span>
          </div>
        </div>

        {/* CANDIDATE FORM */}
        {role === 'CANDIDATE' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step < 3) { nextStep(); return; }
              submitCandidate(e);
            }}
            className="space-y-4"
          >
            {/* Step 1: Candidate Account */}
            {step === 1 && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username *
                  </label>
                  <input
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                    placeholder="e.g. priya.developer"
                    value={candForm.username}
                    onChange={onCandChange('username')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                    placeholder="name@example.com"
                    value={candForm.email}
                    onChange={onCandChange('email')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Email Address *
                  </label>
                  <input
                    type="email"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                    placeholder="Repeat email address"
                    value={candForm.confirmEmail}
                    onChange={onCandChange('confirmEmail')}
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Personal Details & Mandatory Resume */}
            {step === 2 && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      First Name *
                    </label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                      placeholder="Priya"
                      value={candForm.firstName}
                      onChange={onCandChange('firstName')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                      placeholder="Sharma"
                      value={candForm.lastName}
                      onChange={onCandChange('lastName')}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                      placeholder="+91 98765 43210"
                      value={candForm.mobileNumber}
                      onChange={onCandChange('mobileNumber')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Location / City *
                    </label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                      placeholder="e.g. Bengaluru, India"
                      value={candForm.location}
                      onChange={onCandChange('location')}
                      required
                    />
                  </div>
                </div>

                {/* Mandatory Resume Upload Box */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Mandatory Resume Upload *</span>
                    <span className="text-[10px] text-slate-400">PDF, DOC, DOCX (Max 15MB)</span>
                  </label>
                  <label
                    htmlFor="cand-resume-file"
                    className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      candForm.resumeFile
                        ? 'border-emerald-400 bg-emerald-50/50'
                        : 'border-slate-300 hover:border-primary hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="file"
                      id="cand-resume-file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeSelect}
                    />
                    {candForm.resumeFile ? (
                      <div className="flex items-center gap-2.5 text-emerald-800">
                        <FileText size={20} className="text-emerald-600" />
                        <div className="text-left">
                          <p className="text-xs font-bold truncate max-w-xs">{candForm.resumeFile.name}</p>
                          <p className="text-[10px] text-emerald-600">
                            {(candForm.resumeFile.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-primary ml-2 hover:underline">Change</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload size={20} className="mx-auto text-slate-400 mb-1.5" />
                        <p className="text-xs font-semibold text-slate-700">Click to upload your resume</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Required for algorithmic skill matching & applications</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Candidate Password */}
            {step === 3 && (
              <div className="space-y-3.5">
                <PasswordField
                  label="Password"
                  value={candForm.password}
                  onChange={(v) => setCandForm(prev => ({ ...prev, password: v }))}
                  required
                />

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    <span>Password Strength</span>
                    <span className={candStrength.pct > 66 ? 'text-emerald-600' : candStrength.pct > 33 ? 'text-primary' : 'text-slate-400'}>
                      {candStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        candStrength.pct > 66 ? 'bg-emerald-500' : candStrength.pct > 33 ? 'bg-primary' : 'bg-slate-300'
                      }`}
                      style={{ width: `${candStrength.pct}%` }}
                    />
                  </div>
                </div>

                <PasswordField
                  label="Confirm Password"
                  value={candForm.confirmPassword}
                  onChange={(v) => setCandForm(prev => ({ ...prev, confirmPassword: v }))}
                  required
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 text-primary border border-red-200 rounded-md text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-2 pt-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center"
                >
                  <ChevronLeft size={16} />
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 rounded-md font-semibold text-xs flex justify-center items-center gap-1.5 transition-colors"
                >
                  Next Step <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 rounded-md font-semibold text-xs flex justify-center items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating Candidate Account...' : 'Complete Candidate Registration'}
                </button>
              )}
            </div>
          </form>
        )}

        {/* RECRUITER FORM */}
        {role === 'RECRUITER' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step < 3) { nextStep(); return; }
              submitRecruiter(e);
            }}
            className="space-y-4"
          >
            {/* Step 1: Recruiter Profile & Account */}
            {step === 1 && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Username *
                    </label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                      placeholder="e.g. devon.recruiter"
                      value={recForm.username}
                      onChange={onRecChange('username')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                      placeholder="e.g. Devon Singh"
                      value={recForm.fullName}
                      onChange={onRecChange('fullName')}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Personal Email *
                    </label>
                    <input
                      type="email"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                      placeholder="e.g. devon@gmail.com"
                      value={recForm.email}
                      onChange={onRecChange('email')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                      placeholder="+91 98765 12345"
                      value={recForm.phone}
                      onChange={onRecChange('phone')}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation / Title
                  </label>
                  <input
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                    placeholder="e.g. Senior Technical Recruiter / Talent Acquisition Lead"
                    value={recForm.designation}
                    onChange={onRecChange('designation')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <PasswordField
                      label="Password"
                      value={recForm.password}
                      onChange={(v) => setRecForm(prev => ({ ...prev, password: v }))}
                      required
                    />
                  </div>
                  <div>
                    <PasswordField
                      label="Confirm Password"
                      value={recForm.confirmPassword}
                      onChange={(v) => setRecForm(prev => ({ ...prev, confirmPassword: v }))}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Company Details */}
            {step === 2 && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                      placeholder="e.g. HireHQ Solutions"
                      value={recForm.companyName}
                      onChange={onRecChange('companyName')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company Website
                    </label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                      placeholder="https://hirehq.com"
                      value={recForm.companyWebsite}
                      onChange={onRecChange('companyWebsite')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company Email
                    </label>
                    <input
                      type="email"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                      placeholder="e.g. contact@hirehq.com"
                      value={recForm.companyEmail}
                      onChange={onRecChange('companyEmail')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                      placeholder="+91 80 1234 5678"
                      value={recForm.companyPhone}
                      onChange={onRecChange('companyPhone')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Industry
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                      value={recForm.industry}
                      onChange={onRecChange('industry')}
                    >
                      <option value="Technology & Software">Technology & Software</option>
                      <option value="FinTech & Banking">FinTech & Banking</option>
                      <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                      <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                      <option value="Staffing & Executive Search">Staffing & Executive Search</option>
                      <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company Type
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                      value={recForm.companyType}
                      onChange={onRecChange('companyType')}
                    >
                      <option value="Private Limited">Private Limited</option>
                      <option value="Public Listed">Public Listed</option>
                      <option value="Startup">Startup</option>
                      <option value="Corporation">Corporation</option>
                      <option value="Partnership / Agency">Partnership / Agency</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company Location / City *
                    </label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                      placeholder="e.g. Hyderabad, India"
                      value={recForm.companyLocation}
                      onChange={onRecChange('companyLocation')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registration / CIN Number
                    </label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                      placeholder="e.g. CIN-U72900TG2020PTC098765"
                      value={recForm.registrationNumber}
                      onChange={onRecChange('registrationNumber')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Registered Address *
                  </label>
                  <input
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                    placeholder="e.g. Level 4, Tech Park, Mindspace Madhapur"
                    value={recForm.companyAddress}
                    onChange={onRecChange('companyAddress')}
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 3: Identity & Verification Proofs */}
            {step === 3 && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Employee ID <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                      placeholder="e.g. EMP-99214 (optional)"
                      value={recForm.employeeId}
                      onChange={onRecChange('employeeId')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      LinkedIn Profile URL
                    </label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white px-3 py-2 rounded-md text-xs font-medium outline-none transition-colors"
                      placeholder="https://linkedin.com/in/username"
                      value={recForm.linkedInUrl}
                      onChange={onRecChange('linkedInUrl')}
                    />
                  </div>
                </div>

                {/* Identity Proof Document Upload */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700">Identity Proof (Work Badge / Govt ID / Aadhar) <span className="text-primary">*</span></span>
                    <span className="text-[10px] text-slate-400">PDF, JPG, PNG (Max 15MB)</span>
                  </div>
                  {/* Hidden file input triggered via ref */}
                  <input
                    type="file"
                    ref={identityInputRef}
                    style={{ display: 'none' }}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleIdentitySelect}
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => identityInputRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && identityInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all select-none ${
                      recForm.identityProof
                        ? 'border-emerald-400 bg-emerald-50/50'
                        : 'border-slate-300 hover:border-primary hover:bg-slate-50'
                    }`}
                  >
                    {recForm.identityProof ? (
                      <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold w-full justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          <span className="truncate">{recForm.identityProof.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className="text-primary text-[10px] hover:underline"
                            onClick={(e) => { e.stopPropagation(); identityInputRef.current?.click(); }}
                          >Change</span>
                          <span
                            className="text-slate-400 text-[10px] hover:text-red-500 hover:underline"
                            onClick={(e) => { e.stopPropagation(); setRecForm(prev => ({ ...prev, identityProof: null })); if (identityInputRef.current) identityInputRef.current.value = ''; }}
                          >Remove</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-xs text-slate-600">
                        <Upload size={16} className="mx-auto text-slate-400 mb-1" />
                        <span>Click here to upload Employee Badge / Government ID</span>
                        <p className="text-[10px] text-primary mt-0.5 font-semibold">Required for verification</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Proof Document Upload */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700">Company Proof (Incorporation / Business License)</span>
                    <span className="text-[10px] text-slate-400">PDF, JPG, PNG (Max 15MB)</span>
                  </div>
                  {/* Hidden file input triggered via ref */}
                  <input
                    type="file"
                    ref={companyProofInputRef}
                    style={{ display: 'none' }}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleCompanyProofSelect}
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => companyProofInputRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && companyProofInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all select-none ${
                      recForm.companyProof
                        ? 'border-emerald-400 bg-emerald-50/50'
                        : 'border-slate-300 hover:border-primary hover:bg-slate-50'
                    }`}
                  >
                    {recForm.companyProof ? (
                      <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold w-full justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          <span className="truncate">{recForm.companyProof.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className="text-primary text-[10px] hover:underline"
                            onClick={(e) => { e.stopPropagation(); companyProofInputRef.current?.click(); }}
                          >Change</span>
                          <span
                            className="text-slate-400 text-[10px] hover:text-red-500 hover:underline"
                            onClick={(e) => { e.stopPropagation(); setRecForm(prev => ({ ...prev, companyProof: null })); if (companyProofInputRef.current) companyProofInputRef.current.value = ''; }}
                          >Remove</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-xs text-slate-600">
                        <Upload size={16} className="mx-auto text-slate-400 mb-1" />
                        <span>Click here to upload Incorporation Certificate or Authorization Letter</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Optional but recommended</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Notice */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-900 flex items-start gap-2">
                  <ShieldCheck size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Admin Verification Policy</strong>
                    Recruiter accounts undergo mandatory review by platform administrators. Once approved, you will be notified and can immediately post jobs and review applicants.
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 text-primary border border-red-200 rounded-md text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-2 pt-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center"
                >
                  <ChevronLeft size={16} />
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 rounded-md font-semibold text-xs flex justify-center items-center gap-1.5 transition-colors"
                >
                  Next Step <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 rounded-md font-semibold text-xs flex justify-center items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Submitting Verification...' : 'Submit Verification Request'}
                </button>
              )}
            </div>
          </form>
        )}

        <p className="text-center text-xs text-slate-500 font-medium pt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
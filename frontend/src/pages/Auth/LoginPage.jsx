import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Briefcase, ChevronRight, Sparkles, Shield, UserCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PasswordField from '../../components/common/inputs/PasswordField';
import GlobalCoLogo from '../../components/GlobalCoLogo';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const fillCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await login(username, password);
      const userRole = (res?.role || '').replace('ROLE_', '');

      if (userRole === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (userRole === 'RECRUITER') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/candidate/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Authentication failed. Please check your credentials.'
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-sm">
        <div className="mb-5 text-center">
          <div className="flex justify-center mb-3">
            <GlobalCoLogo />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Sign in to your account
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Access your applications, ATS pipeline, or system console.
          </p>
        </div>

        {/* Quick Demo Fill Pills */}
        <div className="mb-5 p-3 bg-slate-50 rounded-md border border-slate-200">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <KeyRound size={12} className="text-primary" /> Instant Demo Accounts
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => fillCredentials('riya.backend', 'Password@123')}
              className="px-2.5 py-1 bg-white hover:bg-red-50 hover:text-primary border border-slate-200 rounded text-xs font-medium text-slate-700 transition-colors"
            >
              🎯 Candidate
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('mira.recruiter', 'Password@123')}
              className="px-2.5 py-1 bg-white hover:bg-red-50 hover:text-primary border border-slate-200 rounded text-xs font-medium text-slate-700 transition-colors"
            >
              👔 Recruiter
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('rohit.recruiter', 'Password@123')}
              className="px-2.5 py-1 bg-white hover:bg-amber-50 hover:text-amber-700 border border-amber-200 rounded text-xs font-medium text-amber-800 transition-colors"
              title="Test Recruiter Pending Status"
            >
              ⏳ Pending Recruiter
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('sneha.recruiter', 'Password@123')}
              className="px-2.5 py-1 bg-white hover:bg-red-50 hover:text-red-700 border border-red-200 rounded text-xs font-medium text-red-800 transition-colors"
              title="Test Recruiter Rejected Status"
            >
              ❌ Rejected Recruiter
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin', 'Password@123')}
              className="px-2.5 py-1 bg-white hover:bg-red-50 hover:text-primary border border-slate-200 rounded text-xs font-medium text-slate-700 transition-colors"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {error && (
          <div className={`mb-4 p-3.5 rounded-lg border text-xs font-medium leading-relaxed ${
            error.toLowerCase().includes('pending')
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : error.toLowerCase().includes('rejected')
              ? 'bg-rose-50 text-rose-900 border-rose-300'
              : 'bg-red-50 text-primary border-red-200 font-semibold'
          }`}>
            <div className="font-bold mb-0.5 flex items-center gap-1.5">
              {error.toLowerCase().includes('pending') ? '⏳ Account Pending Review' : error.toLowerCase().includes('rejected') ? '❌ Verification Rejected' : '⚠️ Authentication Error'}
            </div>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username or Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                required
                placeholder="Enter username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white pl-9 pr-3 py-2 rounded-md text-xs font-medium outline-none transition-colors text-slate-800"
              />
            </div>
          </div>

          <div>
            <PasswordField
              label="Password"
              value={password}
              onChange={(value) => setPassword(value)}
              required
            />
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-md font-semibold text-xs flex justify-center items-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ChevronRight size={15} />
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
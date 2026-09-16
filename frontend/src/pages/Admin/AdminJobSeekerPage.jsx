import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Search, RefreshCw, FileText, CheckCircle2,
  AlertTriangle, ChevronLeft, Shield, Calendar, MapPin,
  Phone, Mail, Briefcase
} from 'lucide-react';
import { getAllJobSeekers } from '../../services/adminApi';

function StatusBadge({ status, enabled }) {
  const s = status || (enabled !== false ? 'APPROVED' : 'SUSPENDED');
  const cls =
    s === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    s === 'SUSPENDED' ? 'bg-red-50 text-red-600 border-red-200' :
    s === 'PENDING'   ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border ${cls}`}>
      {s}
    </span>
  );
}

export default function AdminJobSeekerPage() {
  const [seekers, setSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeeker, setSelectedSeeker] = useState(null);

  useEffect(() => {
    loadSeekers();
  }, []);

  const loadSeekers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllJobSeekers();
      setSeekers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load job seekers', err);
      setError(
        err.response?.status === 403
          ? 'Access denied. Admin privileges required.'
          : err.response?.status === 401
          ? 'Session expired. Please log in again.'
          : `Failed to load job seekers: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredSeekers = seekers.filter(s => {
    const q = searchQuery.toLowerCase();
    return !q ||
      (s.username || '').toLowerCase().includes(q) ||
      (s.fullName || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.location || '').toLowerCase().includes(q) ||
      (s.skills || []).some(sk => (typeof sk === 'string' ? sk : sk.name || '').toLowerCase().includes(q));
  });

  return (
    <div className="py-6 sm:py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                to="/admin/dashboard"
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Admin Dashboard
              </Link>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Candidate Directory
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Job Seekers
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              View all registered candidates, their profiles, skills, and application history.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
              {seekers.length} Registered
            </div>
            <button
              onClick={loadSeekers}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 px-3.5 py-2 rounded-lg font-medium text-xs text-slate-700 transition-colors shadow-sm"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium flex items-center gap-2">
            <AlertTriangle size={15} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-5">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by name, email, username, location or skill..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-primary pl-9 pr-3 py-2 rounded-lg text-xs outline-none shadow-sm"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-sm">
            <RefreshCw size={24} className="animate-spin text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">Loading job seekers...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredSeekers.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-sm">
            <Users size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">
              {searchQuery ? 'No candidates match your search' : 'No job seekers registered yet'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery ? 'Try a different search term.' : 'Candidates will appear here once they register.'}
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && filteredSeekers.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">
                Showing {filteredSeekers.length} of {seekers.length} candidates
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-primary hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                    <th className="px-4 py-3">Candidate</th>
                    <th className="px-4 py-3 hidden md:table-cell">Contact</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Skills</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Applications</th>
                    <th className="px-4 py-3">Resume</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSeekers.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-slate-100 text-slate-700 rounded-md flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {(s.fullName || s.username || 'C')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{s.fullName || s.username}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">@{s.username}</p>
                            <p className="text-[10px] text-slate-500 md:hidden mt-0.5">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="space-y-1">
                          <p className="flex items-center gap-1 text-slate-600">
                            <Mail size={10} className="text-slate-400" /> {s.email}
                          </p>
                          {s.phone && (
                            <p className="flex items-center gap-1 text-slate-500">
                              <Phone size={10} className="text-slate-400" /> {s.phone}
                            </p>
                          )}
                          {s.location && (
                            <p className="flex items-center gap-1 text-slate-500">
                              <MapPin size={10} className="text-slate-400" /> {s.location}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(s.skills || []).slice(0, 4).map((sk, i) => (
                            <span key={i} className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded border border-slate-200">
                              {typeof sk === 'string' ? sk : sk.name}
                            </span>
                          ))}
                          {(s.skills || []).length > 4 && (
                            <span className="text-[10px] text-slate-400">
                              +{s.skills.length - 4} more
                            </span>
                          )}
                          {(s.skills || []).length === 0 && (
                            <span className="text-[10px] text-slate-400 italic">No skills listed</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-1 text-slate-700 font-semibold">
                          <Briefcase size={12} className="text-slate-400" />
                          {s.applicationsCount ?? 0}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {s.resumeUrl ? (
                          <a
                            href={`http://localhost:8080${s.resumeUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline text-[10px] font-medium"
                          >
                            <FileText size={12} /> View
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Not uploaded</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.accountStatus} enabled={s.enabled} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedSeeker(s)}
                          className="text-[10px] text-primary font-semibold hover:underline"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Seeker Detail Modal */}
        {selectedSeeker && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            onClick={() => setSelectedSeeker(null)}
          >
            <div
              className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl border border-slate-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-slate-200 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center font-bold text-base">
                    {(selectedSeeker.fullName || selectedSeeker.username || 'C')[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{selectedSeeker.fullName || selectedSeeker.username}</h2>
                    <p className="text-xs text-slate-500">@{selectedSeeker.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSeeker(null)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-medium"
                >
                  ✕ Close
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { label: 'Email', val: selectedSeeker.email },
                    { label: 'Phone', val: selectedSeeker.phone },
                    { label: 'Location', val: selectedSeeker.location },
                    { label: 'Experience (yrs)', val: selectedSeeker.experienceYears ?? 'N/A' },
                    { label: 'Education', val: selectedSeeker.education },
                    { label: 'Applications', val: selectedSeeker.applicationsCount ?? 0 },
                    { label: 'Account Status', val: selectedSeeker.accountStatus || 'APPROVED' },
                    { label: 'Registered', val: selectedSeeker.createdAt ? new Date(selectedSeeker.createdAt).toLocaleDateString() : 'N/A' },
                  ].map((item, i) => item.val !== undefined && item.val !== null && item.val !== '' ? (
                    <div key={i}>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
                      <p className="text-slate-800 font-medium mt-0.5">{item.val}</p>
                    </div>
                  ) : null)}
                </div>

                {(selectedSeeker.skills || []).length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedSeeker.skills || []).map((sk, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded border border-slate-200">
                          {typeof sk === 'string' ? sk : sk.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSeeker.resumeUrl && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Resume</p>
                    <a
                      href={`http://localhost:8080${selectedSeeker.resumeUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors"
                    >
                      <FileText size={13} />
                      {selectedSeeker.resumeFileName || 'Download Resume'}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

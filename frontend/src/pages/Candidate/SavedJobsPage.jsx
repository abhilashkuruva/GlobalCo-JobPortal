import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MapPin, Briefcase, IndianRupee, Trash2, ArrowRight, Search } from 'lucide-react';
import { getSavedJobs, unsaveJob } from '../../services/jobApi';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      const data = await getSavedJobs();
      setSavedJobs(data || []);
    } catch (err) {
      console.error('Failed to load saved jobs', err);
      setError('Could not load your bookmarked jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await unsaveJob(jobId);
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      console.error('Failed to remove bookmark', err);
    }
  };

  return (
    <div className="py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Saved Jobs
            </h1>
            <p className="text-slate-500 font-medium text-xs mt-0.5">
              Roles you have bookmarked to review or apply for later.
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 px-3.5 py-1.5 rounded-md font-semibold text-xs text-slate-700 hover:text-primary transition-colors shadow-sm self-start sm:self-auto"
          >
            <Search size={14} /> Explore More Jobs
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white rounded-lg animate-pulse border border-slate-200" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 text-primary border border-red-200 rounded-md font-semibold text-xs text-center">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && savedJobs.length === 0 && !error && (
          <div className="bg-white py-12 px-6 rounded-lg text-center border border-slate-200 max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 bg-red-50 text-primary rounded-md flex items-center justify-center mx-auto mb-3">
              <Bookmark size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No Saved Jobs Yet</h3>
            <p className="text-slate-500 text-xs mb-4 max-w-sm mx-auto">
              Whenever you come across opportunities that interest you, click the bookmark icon to keep them organized here.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-semibold text-xs transition-colors"
            >
              Browse Open Roles <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Saved Jobs List */}
        {!loading && savedJobs.length > 0 && (
          <div className="space-y-3">
            {savedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center border border-slate-200 text-primary font-bold text-sm shrink-0">
                    {job.companyName ? job.companyName[0].toUpperCase() : 'G'}
                  </div>
                  <div>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors block"
                    >
                      {job.title}
                    </Link>
                    <p className="text-xs font-semibold text-primary mt-0.5">
                      {job.companyName || 'GlobalCo Partner'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-500 mt-1.5">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" /> {job.location || 'Remote'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase size={12} className="text-slate-400" /> {job.workMode || 'Full Time'}
                      </span>
                      {job.salaryRange && (
                        <span className="flex items-center gap-1 text-slate-800 font-semibold">
                          <IndianRupee size={12} className="text-primary" /> {job.salaryRange}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 shrink-0">
                  <button
                    onClick={(e) => handleUnsave(job.id, e)}
                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-red-50 rounded-md transition-colors"
                    title="Remove Bookmark"
                  >
                    <Trash2 size={16} />
                  </button>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="bg-primary hover:bg-primary-dark text-white text-xs font-semibold px-3.5 py-1.5 rounded-md transition-colors inline-flex items-center gap-1"
                  >
                    View & Apply <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

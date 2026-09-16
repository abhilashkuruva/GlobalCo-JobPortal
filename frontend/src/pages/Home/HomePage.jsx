import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedJobs } from '../../services/jobApi';
import SearchBar from '../../components/SearchBar/SearchBar';
import JobCard from '../../components/JobCard/JobCard';
import { CheckCircle2, TrendingUp, ShieldCheck, Zap, ChevronRight, ArrowRight, Building, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getPublishedJobs({ page: 0, size: 6 });
        setJobs(res.content || []);
      } catch (e) {
        setError('Failed to load opportunities.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-300 px-3 py-1 rounded-md text-xs font-medium border border-slate-700 mb-4">
            <Sparkles size={13} className="text-primary" /> Enterprise ATS & Intelligent Job Matching
          </div>

          {/* Main Hero Header */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight max-w-3xl mx-auto">
            Discover your next high-impact career opportunity
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 mb-6 max-w-xl mx-auto font-normal">
            Connecting talented software engineers with verified global enterprises and fast-growing teams.
          </p>

          {/* Search Bar */}
          <div className="flex justify-center max-w-4xl mx-auto mb-6">
            <SearchBar />
          </div>

          {/* Trust Value Props */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-slate-400 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" /> Verified Employers
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={14} className="text-primary" /> Algorithmic Match Score
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" /> Real-time Pipeline Tracking
            </div>
          </div>
        </div>
      </div>

      {/* Featured Jobs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Featured Openings
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Curated roles with competitive compensation and active hiring pipelines.
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Explore all openings <ArrowRight size={13} />
          </Link>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-44 bg-white rounded-lg animate-pulse border border-slate-200" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 text-primary border border-red-200 rounded-md font-semibold text-xs text-center">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && jobs.length === 0 && !error && (
          <div className="bg-white py-12 px-6 rounded-lg text-center border border-slate-200 shadow-sm text-slate-500">
            <p className="font-semibold text-slate-800 text-sm mb-1">No jobs available right now.</p>
            <p className="text-xs">Check back soon as new opportunities are posted daily.</p>
          </div>
        )}

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, MapPin, Briefcase, IndianRupee, LayoutGrid, Search, X, Check } from 'lucide-react';
import { getPublishedJobs } from '../../services/jobApi';
import JobCard from '../../components/JobCard/JobCard';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function JobSearchPage() {
  const query = useQuery();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [keywordInput, setKeywordInput] = useState(query.get('keyword') || '');
  const [locationInput, setLocationInput] = useState(query.get('location') || '');
  const [selectedExp, setSelectedExp] = useState(query.get('minExp') || '');
  const [selectedModes, setSelectedModes] = useState([]);

  const expLevels = { 'Entry Level (0-1 yrs)': 0, 'Junior (2-3 yrs)': 2, 'Mid-Senior (4-7 yrs)': 4, 'Lead / Principal (8+ yrs)': 8 };
  const workModes = ['Remote', 'Hybrid', 'On-site'];

  const keyword = query.get('keyword') || '';
  const location = query.get('location') || '';
  const minExp = query.get('minExp') ? Number(query.get('minExp')) : undefined;
  const modes = query.get('modes') || '';

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getPublishedJobs({
          page: 0,
          size: 24,
          keyword,
          location,
          minExp,
          workMode: modes ? modes.split(',')[0] : undefined
        });
        setJobs(res.content || res || []);
        if (query.get('modes')) {
          setSelectedModes(query.get('modes').split(','));
        }
      } catch {
        setError('Failed to retrieve job listings.');
      } finally {
        setLoading(false);
      }
    })();
  }, [keyword, location, minExp, modes]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (keywordInput.trim()) params.set('keyword', keywordInput.trim());
    if (locationInput.trim()) params.set('location', locationInput.trim());
    if (selectedExp !== '') params.set('minExp', selectedExp);
    if (selectedModes.length > 0) params.set('modes', selectedModes.join(','));

    navigate(`/jobs?${params.toString()}`);
  };

  const handleClearAll = () => {
    setKeywordInput('');
    setLocationInput('');
    setSelectedExp('');
    setSelectedModes([]);
    navigate('/jobs');
  };

  return (
    <div className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Search Controls Bar */}
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="flex-1 flex items-center px-3 py-2 bg-slate-50 rounded-md border border-slate-200 gap-2.5">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search title, keywords, or company..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              className="bg-transparent text-xs sm:text-sm outline-none w-full text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="flex-1 flex items-center px-3 py-2 bg-slate-50 rounded-md border border-slate-200 gap-2.5">
            <MapPin size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="City, Country, or 'Remote'..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              className="bg-transparent text-xs sm:text-sm outline-none w-full text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={handleApplyFilters}
            className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-md font-semibold text-xs transition-colors shrink-0"
          >
            Find Jobs
          </button>
        </div>

        {/* Layout: Filter Sidebar + Job Results */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm lg:sticky lg:top-20">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Filter size={14} className="text-primary" /> Filter Options
                </h3>
                <button
                  onClick={handleClearAll}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-4">
                {/* Experience Range */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Experience Level
                  </label>
                  <div className="space-y-2">
                    {Object.entries(expLevels).map(([label, expVal]) => (
                      <label key={label} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="expRadio"
                          checked={selectedExp === String(expVal)}
                          onChange={() => setSelectedExp(String(expVal))}
                          className="w-3.5 h-3.5 accent-primary"
                        />
                        <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Work Mode */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Work Mode
                  </label>
                  <div className="space-y-2">
                    {workModes.map((mode) => (
                      <label key={mode} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedModes.includes(mode)}
                          onChange={(e) =>
                            e.target.checked
                              ? setSelectedModes([...selectedModes, mode])
                              : setSelectedModes(selectedModes.filter((m) => m !== mode))
                          }
                          className="w-3.5 h-3.5 accent-primary rounded"
                        />
                        <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">
                          {mode}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={handleApplyFilters}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-xs py-2 rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    <SlidersHorizontal size={13} /> Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Results Column */}
          <main className="flex-1 min-w-0">
            {error && (
              <div className="bg-red-50 text-primary p-3 rounded-md mb-4 text-xs font-semibold border border-red-200">
                {error}
              </div>
            )}

            {/* Results Counter Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {jobs.length} Openings Found
                </h2>
                {keyword && (
                  <p className="text-xs text-primary font-medium mt-0.5">
                    Matching "{keyword}"
                  </p>
                )}
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-48 bg-white rounded-lg animate-pulse border border-slate-200" />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && jobs.length === 0 && (
              <div className="bg-white rounded-lg p-8 sm:p-12 text-center border border-slate-200 shadow-sm">
                <Filter size={32} className="mx-auto text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-800 mb-1">No matching opportunities</h3>
                <p className="text-slate-500 text-xs mb-4 max-w-sm mx-auto">
                  Try broadening your keyword, removing location constraints, or clearing experience filters.
                </p>
                <button
                  onClick={handleClearAll}
                  className="bg-primary text-white font-semibold text-xs px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

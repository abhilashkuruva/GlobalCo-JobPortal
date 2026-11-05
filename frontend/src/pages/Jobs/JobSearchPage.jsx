import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal, MapPin, Search, X, RefreshCw } from 'lucide-react';
import { getPublishedJobs } from '../../services/jobApi';
import JobCard from '../../components/JobCard/JobCard';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const expOptions = [
  { label: 'Entry Level (0-2 yrs)', value: 'entry', min: 0, max: 2 },
  { label: 'Junior (2-3 yrs)', value: 'junior', min: 2, max: 3 },
  { label: 'Mid-Senior (4-5 yrs)', value: 'mid', min: 4, max: 5 },
  { label: 'Lead / Principal (6+ yrs)', value: 'lead', min: 6, max: 99 }
];

const workModes = ['Remote', 'Hybrid', 'On-site'];

export default function JobSearchPage() {
  const query = useQuery();
  const navigate = useNavigate();

  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [slowLoad, setSlowLoad] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Search & Filter State
  const [keywordInput, setKeywordInput] = useState(query.get('keyword') || '');
  const [locationInput, setLocationInput] = useState(query.get('location') || '');
  const [selectedExp, setSelectedExp] = useState(query.get('minExp') || '');
  const [selectedModes, setSelectedModes] = useState(
    query.get('modes') ? query.get('modes').split(',').filter(Boolean) : []
  );

  // Synchronize inputs when query params change in URL
  useEffect(() => {
    const qKey = query.get('keyword') || '';
    const qLoc = query.get('location') || '';
    const qExp = query.get('minExp') || '';
    const qModes = query.get('modes') ? query.get('modes').split(',').filter(Boolean) : [];

    setKeywordInput(qKey);
    setLocationInput(qLoc);
    setSelectedExp(qExp);
    setSelectedModes(qModes);
  }, [query]);

  // Load all available jobs upfront so client-side filter is ultra-fast & accurate
  useEffect(() => {
    let slowTimer;
    (async () => {
      setLoading(true);
      setError(null);
      setSlowLoad(false);
      slowTimer = setTimeout(() => setSlowLoad(true), 4000);
      try {
        const res = await getPublishedJobs({
          page: 0,
          size: 100
        });
        const content = res.content || (Array.isArray(res) ? res : []);
        setAllJobs(content);
      } catch (err) {
        setError('Failed to retrieve job listings. The server may be starting up — please try again in a moment.');
      } finally {
        clearTimeout(slowTimer);
        setSlowLoad(false);
        setLoading(false);
      }
    })();
    return () => clearTimeout(slowTimer);
  }, [retryCount]);

  // Sync state to URL params
  const updateUrlParams = (newKeyword, newLocation, newExp, newModes) => {
    const params = new URLSearchParams();
    if (newKeyword && newKeyword.trim()) params.set('keyword', newKeyword.trim());
    if (newLocation && newLocation.trim()) params.set('location', newLocation.trim());
    if (newExp) params.set('minExp', newExp);
    if (newModes && newModes.length > 0) params.set('modes', newModes.join(','));
    const queryString = params.toString();
    navigate(`/jobs${queryString ? '?' + queryString : ''}`, { replace: true });
  };

  const handleApplyFilters = () => {
    updateUrlParams(keywordInput, locationInput, selectedExp, selectedModes);
  };

  const handleModeToggle = (mode) => {
    setSelectedModes(prev => {
      const nextModes = prev.includes(mode)
        ? prev.filter((m) => m !== mode)
        : [...prev, mode];
      updateUrlParams(keywordInput, locationInput, selectedExp, nextModes);
      return nextModes;
    });
  };

  const handleExpToggle = (val) => {
    setSelectedExp(prev => {
      const nextExp = prev === val ? '' : val;
      updateUrlParams(keywordInput, locationInput, nextExp, selectedModes);
      return nextExp;
    });
  };

  const handleClearAll = () => {
    setKeywordInput('');
    setLocationInput('');
    setSelectedExp('');
    setSelectedModes([]);
    navigate('/jobs', { replace: true });
  };

  // Instant reactive filter computation
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      // 1. Keyword Filter (Matches title, company, description, or skills)
      if (keywordInput && keywordInput.trim()) {
        const kw = keywordInput.toLowerCase().trim();
        const titleMatch = job.title?.toLowerCase().includes(kw);
        const compMatch = (job.companyName || job.company?.name)?.toLowerCase().includes(kw);
        const descMatch = job.description?.toLowerCase().includes(kw);
        const skillMatch = job.skills?.some((s) => s.name?.toLowerCase().includes(kw)) ||
                           job.requiredSkills?.some((s) => s.name?.toLowerCase().includes(kw));
        if (!titleMatch && !compMatch && !descMatch && !skillMatch) return false;
      }

      // 2. Location Filter
      if (locationInput && locationInput.trim()) {
        const loc = locationInput.toLowerCase().trim();
        const locMatch = job.location?.toLowerCase().includes(loc);
        if (!locMatch) return false;
      }

      // 3. Work Mode Filter (Multi-select support)
      if (selectedModes && selectedModes.length > 0) {
        const jobMode = job.workMode?.toLowerCase() || '';
        const modeMatch = selectedModes.some((m) => jobMode === m.toLowerCase());
        if (!modeMatch) return false;
      }

      // 4. Experience Range Filter
      if (selectedExp) {
        const exp = job.experienceRequired ?? job.minExperience ?? 0;
        const opt = expOptions.find((o) => o.value === selectedExp || String(o.min) === selectedExp);
        if (opt) {
          if (exp < opt.min || exp > opt.max) return false;
        } else if (!isNaN(selectedExp)) {
          const num = Number(selectedExp);
          if (num === 0 && exp > 2) return false;
          if (num === 2 && (exp < 2 || exp > 3)) return false;
          if (num === 4 && (exp < 4 || exp > 5)) return false;
          if (num === 6 && exp < 6) return false;
          if (num === 8 && exp < 8) return false;
        }
      }

      return true;
    });
  }, [allJobs, keywordInput, locationInput, selectedModes, selectedExp]);

  const hasActiveFilters = Boolean(
    (keywordInput && keywordInput.trim()) ||
    (locationInput && locationInput.trim()) ||
    selectedExp ||
    selectedModes.length > 0
  );

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
            {keywordInput && (
              <button
                type="button"
                onClick={() => { setKeywordInput(''); updateUrlParams('', locationInput, selectedExp, selectedModes); }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
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
            {locationInput && (
              <button
                type="button"
                onClick={() => { setLocationInput(''); updateUrlParams(keywordInput, '', selectedExp, selectedModes); }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleApplyFilters}
            className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-md font-semibold text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Search size={14} /> Find Jobs
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
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-5">
                {/* Experience Range */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Experience Level
                    </label>
                    {selectedExp && (
                      <button
                        type="button"
                        onClick={() => handleExpToggle(selectedExp)}
                        className="text-[10px] text-slate-400 hover:text-primary cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {expOptions.map((opt) => {
                      const isSelected = selectedExp === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => handleExpToggle(opt.value)}
                          className={`flex items-center gap-2.5 cursor-pointer p-2 rounded-md border text-xs transition-colors ${
                            isSelected
                              ? 'bg-red-50 border-red-300 text-primary font-bold'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="expRadio"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleExpToggle(opt.value);
                            }}
                            className="w-3.5 h-3.5 accent-primary cursor-pointer"
                          />
                          <span className="select-none flex-1">
                            {opt.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Work Mode */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Work Mode
                    </label>
                    {selectedModes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => { setSelectedModes([]); updateUrlParams(keywordInput, locationInput, selectedExp, []); }}
                        className="text-[10px] text-slate-400 hover:text-primary cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {workModes.map((mode) => {
                      const isChecked = selectedModes.includes(mode);
                      return (
                        <div
                          key={mode}
                          onClick={() => handleModeToggle(mode)}
                          className={`flex items-center gap-2.5 cursor-pointer p-2 rounded-md border text-xs transition-colors ${
                            isChecked
                              ? 'bg-red-50 border-red-300 text-primary font-bold'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleModeToggle(mode);
                            }}
                            className="w-3.5 h-3.5 accent-primary rounded cursor-pointer"
                          />
                          <span className="select-none flex-1">
                            {mode}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleApplyFilters}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-xs py-2 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
              <div className="bg-red-50 text-primary p-3 rounded-md mb-4 text-xs font-semibold border border-red-200 flex items-center justify-between gap-2">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setRetryCount((c) => c + 1)}
                  className="flex items-center gap-1 text-xs bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary-dark transition-colors whitespace-nowrap cursor-pointer"
                >
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            )}

            {/* Slow-start banner */}
            {loading && slowLoad && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-4 py-2.5 rounded-md mb-4 flex items-center gap-2">
                <RefreshCw size={13} className="animate-spin flex-shrink-0" />
                <span>Waking up the server — this takes about 15 seconds on first visit. Hang tight!</span>
              </div>
            )}

            {/* Results Counter Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {loading ? 'Searching opportunities...' : `${filteredJobs.length} Openings Found`}
                </h2>
                {keywordInput && (
                  <p className="text-xs text-primary font-medium mt-0.5">
                    Matching "{keywordInput}"
                  </p>
                )}
              </div>
            </div>

            {/* Loading Skeleton */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-48 bg-white rounded-lg animate-pulse border border-slate-200" />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredJobs.length === 0 && !error && (
              <div className="bg-white rounded-lg p-8 sm:p-12 text-center border border-slate-200 shadow-sm">
                <Filter size={32} className="mx-auto text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-800 mb-1">No matching opportunities</h3>
                <p className="text-slate-500 text-xs mb-4 max-w-sm mx-auto">
                  Try broadening your search, removing location constraints, or clearing filters.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="bg-primary text-white font-semibold text-xs px-4 py-2 rounded-md hover:bg-primary-dark transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => setRetryCount((c) => c + 1)}
                    className="border border-slate-300 text-slate-600 font-semibold text-xs px-4 py-2 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={12} /> Refresh
                  </button>
                </div>
              </div>
            )}

            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

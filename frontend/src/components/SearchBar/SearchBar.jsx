import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Layers, Send } from 'lucide-react';

export default function SearchBar() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');

  const skillsList = useMemo(() => skills.split(',').map((s) => s.trim()).filter(Boolean), [skills]);

  const onSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (location) params.set('location', location);
    if (skillsList.length) params.set('skills', skillsList.join(','));
    navigate(`/jobs?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white p-2 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center gap-1.5 text-left">
      <div className="flex-1 flex items-center px-3 py-2 gap-2 border-b md:border-b-0 md:border-r border-slate-200">
        <Search className="text-slate-400" size={16} />
        <input
          className="w-full outline-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 bg-transparent"
          placeholder="Job title, keywords, or company"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="flex-1 flex items-center px-3 py-2 gap-2 border-b md:border-b-0 md:border-r border-slate-200">
        <MapPin className="text-slate-400" size={16} />
        <input
          className="w-full outline-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 bg-transparent"
          placeholder="City or 'Remote'"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="hidden lg:flex flex-1 items-center px-3 py-2 gap-2">
        <Layers className="text-slate-400" size={16} />
        <input
          className="w-full outline-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 bg-transparent"
          placeholder="Skills (Java, React...)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <button
        onClick={onSearch}
        className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-md font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
      >
        <Send size={13} /> Search Jobs
      </button>
    </div>
  );
}

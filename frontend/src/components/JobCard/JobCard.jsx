import React, { useState } from 'react';
import { MapPin, Briefcase, IndianRupee, Clock, Bookmark, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { saveJob, unsaveJob } from '../../services/jobApi';
import { useAuth } from '../../contexts/AuthContext';

export default function JobCard({ job, isSavedInitial = false }) {
  const { token, role } = useAuth();
  const [saved, setSaved] = useState(isSavedInitial);
  const [saving, setSaving] = useState(false);

  const handleToggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token || role !== 'CANDIDATE') return;

    setSaving(true);
    try {
      if (saved) {
        await unsaveJob(job.id);
        setSaved(false);
      } else {
        await saveJob(job.id);
        setSaved(true);
      }
    } catch (err) {
      console.error('Bookmark toggle failed', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-sm transition-all duration-150 flex flex-col justify-between group">
      <div>
        {/* Top bar: Company badge & Bookmark */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center border border-slate-200 text-primary font-bold text-sm">
              {job.companyName ? job.companyName[0].toUpperCase() : 'G'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-1">
                {job.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {job.companyName || 'GlobalCo Partner'}
              </p>
            </div>
          </div>

          {token && role === 'CANDIDATE' && (
            <button
              onClick={handleToggleBookmark}
              disabled={saving}
              className={`p-1.5 rounded-md border transition-colors ${
                saved
                  ? 'bg-red-50 border-red-200 text-primary'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-primary hover:border-slate-300'
              }`}
              title={saved ? 'Remove Bookmark' : 'Save Job'}
            >
              <Bookmark size={15} className={saved ? 'fill-primary' : ''} />
            </button>
          )}
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
            <MapPin size={11} className="text-slate-400" /> {job.location || 'Remote'}
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
            <Briefcase size={11} className="text-slate-400" /> {job.workMode || 'Full-time'}
          </span>
          {job.experienceRequired !== undefined && (
            <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
              <Clock size={11} className="text-slate-400" /> {job.experienceRequired}+ yrs exp
            </span>
          )}
        </div>

        {/* Description snippet */}
        <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed mb-3">
          {job.description}
        </p>
      </div>

      {/* Footer: Salary & View Button */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
            Compensation
          </span>
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <IndianRupee size={12} className="text-primary inline shrink-0" />
            <span>{job.salaryRange || 'Competitive Pay'}</span>
          </span>
        </div>

        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-primary hover:bg-primary-dark px-3 py-1.5 rounded-md transition-colors"
        >
          Details <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
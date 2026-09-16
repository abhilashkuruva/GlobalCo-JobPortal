import React from 'react';
import { Briefcase } from 'lucide-react';

const GlobalCoLogo = ({ size = "normal" }) => {
  return (
    <div className="flex items-center gap-2.5 select-none group">
      <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-md shadow-red-500/20 group-hover:scale-105 group-hover:bg-primary-dark transition-all">
        <Briefcase size={22} className="text-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-extrabold tracking-tight text-dark leading-none">
          Global<span className="text-primary">Co</span>
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary font-mono">
          Recruitment Hub
        </span>
      </div>
    </div>
  );
};

export default GlobalCoLogo;
import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
        <span>© {new Date().getFullYear()} GlobalCo Recruitment Technologies</span>
        <span className="text-[11px] text-slate-400">Enterprise Job Board Platform</span>
      </div>
    </footer>
  )
}

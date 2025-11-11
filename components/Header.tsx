import React, { useState, useEffect, useRef } from 'react';
import { NetworkIcon } from './icons/NetworkIcon';
import { ExportIcon } from './icons/ExportIcon';

interface HeaderProps {
    onExportJson: () => void;
    onExportNetworkPng: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onExportJson, onExportNetworkPng }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="py-4 px-4 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-lg sticky top-0 z-20">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center justify-center gap-3">
          <NetworkIcon className="w-8 h-8 text-cyan-400" />
          <div className="text-left">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
              Academic Research Explorer
            </h1>
            <p className="mt-0.5 text-xs text-slate-400">Expand ideas, build networks, and discover literature</p>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(prev => !prev)}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2 px-3 rounded-md transition-colors text-sm"
            aria-label="Export options"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
          >
            <ExportIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
            <svg className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-30 animate-fade-in" style={{ animationDuration: '150ms' }}>
              <ul className="py-1">
                <li>
                  <button onClick={() => { onExportJson(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                    Export Data (JSON)
                  </button>
                </li>
                <li>
                  <button onClick={() => { onExportNetworkPng(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                    Export Network (PNG)
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

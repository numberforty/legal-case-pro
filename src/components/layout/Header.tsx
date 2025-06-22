'use client';

import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle: () => void;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onMenuToggle, children }) => {
  return (
    <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-6 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuToggle}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
          >
            <span className="text-xl text-white">☰</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-white/60">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {children}
          
          {/* Notifications */}
          <button className="relative w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300">
            <span className="text-xl">🔔</span>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse text-white">
              3
            </span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white">
              JD
            </div>
            <div className="hidden md:block">
              <div className="font-medium text-white">John Doe</div>
              <div className="text-xs text-white/60">Senior Partner</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
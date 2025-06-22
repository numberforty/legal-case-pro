'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname();

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', href: '/' },
    { id: 'cases', icon: '📁', label: 'Case Management', href: '/cases' },
    { id: 'clients', icon: '👥', label: 'Client Management', href: '/clients' },
    { id: 'documents', icon: '📄', label: 'Documents', href: '/documents' },
    { id: 'calendar', icon: '📅', label: 'Calendar', href: '/calendar' },
    { id: 'billing', icon: '💰', label: 'Billing & Finance', href: '/billing' },
    { id: 'communication', icon: '💬', label: 'Communication', href: '/communication' },
    { id: 'reports', icon: '📈', label: 'Reports & Analytics', href: '/reports' },
    { id: 'settings', icon: '⚙️', label: 'Administration', href: '/settings' }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-black/40 backdrop-blur-2xl border-r border-white/10 transition-all duration-300 z-40 ${isOpen ? 'w-64' : 'w-16'}`}>
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" opacity="0.9"/>
              <path d="M12 7C10.9 7 10 7.9 10 9V11C10 12.1 10.9 13 12 13C13.1 13 14 12.1 14 11V9C14 7.9 13.1 7 12 7Z"/>
              <path d="M8 14V16C8 17.1 8.9 18 10 18H14C15.1 18 16 17.1 16 16V14H19C19.6 14 20 14.4 20 15V19C20 19.6 19.6 20 19 20H5C4.4 20 4 19.6 4 19V15C4 14.4 4.4 14 5 14H8Z"/>
            </svg>
          </div>
          {isOpen && (
            <div>
              <div className="font-bold text-lg text-white">LegalCase Pro</div>
              <div className="text-xs text-white/60">v2.1.0</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                pathname === item.href
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white' 
                  : 'hover:bg-white/5 text-white/70 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {isOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
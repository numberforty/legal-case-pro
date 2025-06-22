'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { 
  Scale, 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  Clock, 
  Calendar,
  DollarSign,
  MessageSquare,
  BarChart3,
  Settings,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface LayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

export default function Layout({ title, subtitle, children, headerActions }: LayoutProps) {
  const { user, logout } = useAuth();
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navigation = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard, current: false },
    { name: t('nav.caseManagement'), href: '/cases', icon: Briefcase, current: false },
    { name: t('nav.clientManagement'), href: '/clients', icon: Users, current: false },
    { name: t('nav.documents'), href: '/documents', icon: FileText, current: false },
    { name: t('nav.timeTracking'), href: '/time-tracking', icon: Clock, current: false },
    { name: t('nav.calendar'), href: '/calendar', icon: Calendar, current: false },
    { name: t('nav.billingFinance'), href: '/billing', icon: DollarSign, current: false },
    { name: t('nav.communication'), href: '/communication', icon: MessageSquare, current: false },
    { name: t('nav.reportsAnalytics'), href: '/reports', icon: BarChart3, current: false },
    { name: t('nav.administration'), href: '/settings', icon: Settings, current: false },
  ];

  // Fixed sidebar widths to prevent overlap
  const sidebarWidth = sidebarCollapsed ? 'w-20' : 'w-72';
  const contentMargin = sidebarCollapsed 
    ? (isRTL ? 'lg:mr-20' : 'lg:ml-20') 
    : (isRTL ? 'lg:mr-72' : 'lg:ml-72');

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black/80 backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 z-50 lg:hidden transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')
      } ${isRTL ? 'right-0' : 'left-0'}`}>
        <div className={`flex h-full w-72 flex-col bg-black/95 backdrop-blur-xl ${
          isRTL ? 'border-l border-white/10' : 'border-r border-white/10'
        }`}>
          {/* Mobile header */}
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center">
              <Scale className="h-8 w-8 text-purple-500" />
              <span className={`text-lg font-semibold text-white ${isRTL ? 'mr-3' : 'ml-3'}`}>
                {t('app.title')}
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => {
                        router.push(item.href);
                        setSidebarOpen(false);
                      }}
                      className="group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                      <span className="truncate">{item.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar with fixed positioning */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${sidebarWidth} ${
        isRTL ? 'right-0' : 'left-0'
      }`}>
        <div className={`flex flex-col h-full bg-black/95 backdrop-blur-xl ${
          isRTL ? 'border-l border-white/10' : 'border-r border-white/10'
        }`}>
          {/* Desktop header with more space */}
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center min-w-0 flex-1">
              <Scale className="h-8 w-8 text-purple-500 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className={`text-lg font-semibold text-white truncate ${isRTL ? 'mr-3' : 'ml-3'}`}>
                  {t('app.title')}
                </span>
              )}
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => router.push(item.href)}
                      className="group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 ${
                        !sidebarCollapsed ? (isRTL ? 'ml-3' : 'mr-3') : ''
                      }`} />
                      {!sidebarCollapsed && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* Desktop user info */}
          {!sidebarCollapsed && (
            <div className="border-t border-white/10 p-4">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className={`flex-1 min-w-0 ${isRTL ? 'mr-3 text-right' : 'ml-3 text-left'}`}>
                  <p className="text-sm font-medium text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-white/60 truncate">
                    {user?.role?.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed user info */}
          {sidebarCollapsed && (
            <div className="border-t border-white/10 p-3">
              <div className="flex justify-center">
                <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Collapse button positioned OUTSIDE the sidebar */}
      <div className={`hidden lg:block fixed top-4 z-50 transition-all duration-300 ${
        isRTL ? 
          (sidebarCollapsed ? 'right-24' : 'right-76') : 
          (sidebarCollapsed ? 'left-24' : 'left-76')
      }`}>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 bg-black/90 text-white/80 hover:text-white hover:bg-black border border-white/20 rounded-lg backdrop-blur-xl transition-all duration-200 shadow-lg"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Main content with proper RTL support */}
      <div className={`transition-all duration-300 ${contentMargin}`}>
        {/* Top bar */}
        <header className="bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-white/60 hover:text-white transition-colors"
                >
                  <Menu className="h-6 w-6" />
                </button>
                
                <div className={`lg:ml-0 ${isRTL ? 'mr-4' : 'ml-4'}`}>
                  <h1 className="text-xl font-semibold text-white">{title}</h1>
                  {subtitle && (
                    <p className="text-sm text-white/60 mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>

              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                <button 
                  className="p-2 text-white/60 hover:text-white transition-colors"
                  title={t('header.notifications')}
                >
                  <Bell className="h-5 w-5" />
                </button>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                  title={t('header.logout')}
                >
                  <LogOut className="h-5 w-5" />
                </button>
                
                {headerActions}
              </div>
            </div>
          </div>
        </header>

        {/* Page content with consistent direction */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
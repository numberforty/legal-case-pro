'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import Layout from '@/components/layout/Layout';
import LanguageToggle from '@/components/LanguageToggle';
import { 
  Clock, 
  Search, 
  Filter, 
  Plus,
  Play,
  Pause,
  Square,
  Calendar,
  DollarSign,
  User,
  Edit,
  Trash2,
  Eye,
  Timer,
  FileText,
  Briefcase,
  TrendingUp,
  BarChart3,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TimeEntry {
  id: string;
  description: string;
  hours: number;
  hourlyRate?: number;
  isBillable: boolean;
  date: string;
  startTime?: string;
  endTime?: string;
  case: {
    id: string;
    title: string;
    caseNumber: string;
    client: {
      name: string;
    };
  };
  user: {
    firstName: string;
    lastName: string;
  };
}

interface ActiveTimer {
  caseId: string;
  description: string;
  startTime: Date;
  elapsedSeconds: number;
}

export default function TimeTrackingPage() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, isRTL, formatCurrency, formatNumber } = useLanguage();
  const router = useRouter();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [caseFilter, setCaseFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock data for demonstration
  const mockTimeEntries: TimeEntry[] = [
    {
      id: '1',
      description: 'Contract review and analysis',
      hours: 2.5,
      hourlyRate: 350,
      isBillable: true,
      date: '2024-06-21',
      startTime: '09:00',
      endTime: '11:30',
      case: {
        id: '1',
        title: 'Contract Dispute Resolution',
        caseNumber: 'CASE-2024-001',
        client: {
          name: 'Sarah Johnson'
        }
      },
      user: {
        firstName: 'John',
        lastName: 'Doe'
      }
    },
    {
      id: '2',
      description: 'Client consultation meeting',
      hours: 1.0,
      hourlyRate: 350,
      isBillable: true,
      date: '2024-06-21',
      startTime: '14:00',
      endTime: '15:00',
      case: {
        id: '2',
        title: 'Personal Injury Claim',
        caseNumber: 'CASE-2024-002',
        client: {
          name: 'Michael Chen'
        }
      },
      user: {
        firstName: 'Jane',
        lastName: 'Smith'
      }
    },
    {
      id: '3',
      description: 'Research employment law precedents',
      hours: 3.25,
      hourlyRate: 300,
      isBillable: true,
      date: '2024-06-20',
      startTime: '10:15',
      endTime: '13:30',
      case: {
        id: '3',
        title: 'Employment Discrimination',
        caseNumber: 'CASE-2024-003',
        client: {
          name: 'Elizabeth Martinez'
        }
      },
      user: {
        firstName: 'John',
        lastName: 'Doe'
      }
    },
    {
      id: '4',
      description: 'Document preparation and filing',
      hours: 1.75,
      hourlyRate: 250,
      isBillable: false,
      date: '2024-06-20',
      startTime: '15:30',
      endTime: '17:15',
      case: {
        id: '1',
        title: 'Contract Dispute Resolution',
        caseNumber: 'CASE-2024-001',
        client: {
          name: 'Sarah Johnson'
        }
      },
      user: {
        firstName: 'John',
        lastName: 'Doe'
      }
    }
  ];

  const mockCases = [
    { id: '1', title: 'Contract Dispute Resolution', caseNumber: 'CASE-2024-001' },
    { id: '2', title: 'Personal Injury Claim', caseNumber: 'CASE-2024-002' },
    { id: '3', title: 'Employment Discrimination', caseNumber: 'CASE-2024-003' }
  ];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadTimeEntries();
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (activeTimer) {
      const interval = setInterval(() => {
        setActiveTimer(prev => prev ? {
          ...prev,
          elapsedSeconds: Math.floor((Date.now() - prev.startTime.getTime()) / 1000)
        } : null);
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  }, [activeTimer]);

  const loadTimeEntries = async () => {
    try {
      setIsLoading(true);
      setTimeout(() => {
        setTimeEntries(mockTimeEntries);
        setIsLoading(false);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Failed to load time entries');
    }
  };

  const startTimer = (caseId: string, description: string) => {
    setActiveTimer({
      caseId,
      description,
      startTime: new Date(),
      elapsedSeconds: 0
    });
  };

  const stopTimer = () => {
    if (activeTimer) {
      const hours = activeTimer.elapsedSeconds / 3600;
      console.log('Saving time entry:', {
        caseId: activeTimer.caseId,
        description: activeTimer.description,
        hours: Math.round(hours * 100) / 100
      });
      setActiveTimer(null);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'en-US' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTotalHours = () => {
    return timeEntries.reduce((total, entry) => total + entry.hours, 0);
  };

  const getBillableHours = () => {
    return timeEntries.filter(entry => entry.isBillable).reduce((total, entry) => total + entry.hours, 0);
  };

  const getTotalRevenue = () => {
    return timeEntries
      .filter(entry => entry.isBillable && entry.hourlyRate)
      .reduce((total, entry) => total + (entry.hours * (entry.hourlyRate || 0)), 0);
  };

  const filteredEntries = timeEntries.filter(entry => {
    const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.case.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.case.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCase = !caseFilter || entry.case.id === caseFilter;
    const matchesDate = !dateFilter || entry.date === dateFilter;
    return matchesSearch && matchesCase && matchesDate;
  });

  // Group entries by date
  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = entry.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, TimeEntry[]>);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const headerActions = (
    <div className="flex items-center space-x-4">
      <LanguageToggle />
      <button
        onClick={() => setShowAddModal(true)}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        {t('time.addEntry')}
      </button>
    </div>
  );

  return (
    <Layout 
      title={t('time.title')} 
      subtitle={t('time.subtitle')}
      headerActions={headerActions}
    >
      {/* Active Timer */}
      {activeTimer && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse mr-3"></div>
              <div>
                <h3 className="font-medium text-blue-300">{t('time.timerRunning')}</h3>
                <p className="text-sm text-blue-400">{activeTimer.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-mono font-bold text-blue-300">
                {formatTime(activeTimer.elapsedSeconds)}
              </div>
              <button
                onClick={stopTimer}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
              >
                <Square className="h-4 w-4 mr-2" />
                {t('time.stop')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Timer Start */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6">
        <h3 className="font-medium text-white mb-3">{t('time.quickTimer')}</h3>
        <div className="flex gap-3">
          <select className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white">
            <option value="">{t('time.selectCase')}</option>
            {mockCases.map(case_ => (
              <option key={case_.id} value={case_.id}>
                {case_.caseNumber} - {case_.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder={t('time.description')}
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/40"
          />
          <button
            onClick={() => startTimer('1', 'Quick timer entry')}
            disabled={!!activeTimer}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4 mr-2" />
            {t('time.startTimer')}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Clock className="h-6 w-6 text-blue-400" />
            </div>
            <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
              <p className="text-sm font-medium text-white/60">{t('time.totalHours')}</p>
              <p className="text-2xl font-bold text-white">
                {formatNumber(getTotalHours().toFixed(2))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Timer className="h-6 w-6 text-green-400" />
            </div>
            <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
              <p className="text-sm font-medium text-white/60">{t('time.billableHours')}</p>
              <p className="text-2xl font-bold text-white">
                {formatNumber(getBillableHours().toFixed(2))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <DollarSign className="h-6 w-6 text-purple-400" />
            </div>
            <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
              <p className="text-sm font-medium text-white/60">{t('time.totalRevenue')}</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(getTotalRevenue())}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <BarChart3 className="h-6 w-6 text-yellow-400" />
            </div>
            <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
              <p className="text-sm font-medium text-white/60">{t('time.avgRate')}</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(getBillableHours() > 0 ? getTotalRevenue() / getBillableHours() : 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-white/40" />
              <input
                type="text"
                placeholder={t('time.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/40"
              />
            </div>
          </div>
          <select
            value={caseFilter}
            onChange={(e) => setCaseFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          >
            <option value="">{t('time.allCases')}</option>
            {mockCases.map(case_ => (
              <option key={case_.id} value={case_.id}>{case_.caseNumber}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          />
        </div>
      </div>

      {/* Time Entries */}
      <div className="space-y-6">
        {Object.entries(groupedEntries)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([date, entries]) => {
            const dailyTotal = entries.reduce((sum, entry) => sum + entry.hours, 0);
            const dailyRevenue = entries
              .filter(entry => entry.isBillable && entry.hourlyRate)
              .reduce((sum, entry) => sum + (entry.hours * (entry.hourlyRate || 0)), 0);

            return (
              <div key={date} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                <div className="px-6 py-4 border-b border-white/10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">
                      {formatDate(date)}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-white/60">
                      <span>{formatNumber(dailyTotal.toFixed(2))} {t('time.hours')}</span>
                      <span>{formatCurrency(dailyRevenue)} {t('time.revenue')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="divide-y divide-white/10">
                  {entries.map((entry) => (
                    <div key={entry.id} className="px-6 py-4 hover:bg-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-white">
                                {entry.description}
                              </h4>
                              <div className="mt-1 text-sm text-white/60">
                                <span className="font-mono">{entry.case.caseNumber}</span>
                                <span className="mx-2">•</span>
                                <span>{entry.case.client.name}</span>
                                <span className="mx-2">•</span>
                                <span>{entry.user.firstName} {entry.user.lastName}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-6 text-sm">
                              <div className="text-center">
                                <p className="font-medium text-white">{formatNumber(entry.hours)}h</p>
                                <p className="text-white/40">
                                  {entry.startTime && entry.endTime 
                                    ? `${entry.startTime} - ${entry.endTime}`
                                    : t('time.manualEntry')
                                  }
                                </p>
                              </div>
                              
                              {entry.isBillable ? (
                                <div className="text-center">
                                  <p className="font-medium text-green-400">
                                    {entry.hourlyRate ? formatCurrency(entry.hourlyRate) : t('time.billable')}
                                  </p>
                                  <p className="text-green-400 text-xs">
                                    {entry.hourlyRate ? formatCurrency(entry.hours * entry.hourlyRate) : t('time.billable')}
                                  </p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <p className="font-medium text-white/40">{t('time.nonBillable')}</p>
                                  <p className="text-white/30 text-xs">{t('time.noCharge')}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button className="p-2 text-white/40 hover:text-blue-400 transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-white/40 hover:text-red-400 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      {Object.keys(groupedEntries).length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">{t('time.noEntries')}</h3>
          <p className="text-white/60">{t('time.noEntriesDesc')}</p>
        </div>
      )}

      {/* Add Time Entry Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-white">{t('time.addEntry')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">{t('nav.cases')}</label>
                <select className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white">
                  <option value="">{t('time.selectCase')}</option>
                  {mockCases.map(case_ => (
                    <option key={case_.id} value={case_.id}>
                      {case_.caseNumber} - {case_.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">{t('time.description')}</label>
                <input
                  type="text"
                  placeholder="Describe the work performed..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/40"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">{t('time.hours')}</label>
                  <input
                    type="number"
                    step="0.25"
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Rate</label>
                  <input
                    type="number"
                    placeholder="350.00"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/40"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-white/20 text-purple-600 focus:ring-purple-500 bg-white/5" />
                  <span className="ml-2 text-sm text-white/70">{t('time.billable')}</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {t('common.add')} Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
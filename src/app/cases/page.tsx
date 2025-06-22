'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import Layout from '@/components/layout/Layout';
import LanguageToggle from '@/components/LanguageToggle';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Plus,
  Calendar,
  Clock,
  DollarSign,
  User,
  Users,
  AlertTriangle,
  CheckCircle,
  Circle,
  Edit,
  Trash2,
  Eye,
  FileText,
  Building2,
  Loader2,
  Target,
  TrendingUp
} from 'lucide-react';

interface Case {
  id: string;
  title: string;
  caseNumber: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  estimatedValue?: number;
  progress: number;
  deadline?: string;
  courtDate?: string;
  opposing?: string;
  nextAction?: string;
  client: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
  assignedTo: {
    id: string;
    firstName: string;
    lastName: string;
  };
  totalHours?: number;
  billableHours?: number;
  totalBilled?: number;
  documents?: number;
  timeEntries?: number;
  tasks?: number;
}

export default function CasesPage() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, isRTL, formatCurrency, formatNumber, formatDate } = useLanguage();
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data for demonstration
  const mockCases: Case[] = [
    {
      id: '1',
      title: 'Contract Dispute Resolution',
      caseNumber: 'CASE-2024-001',
      description: 'Commercial contract dispute regarding software licensing agreement',
      type: 'CONTRACT_LAW',
      status: 'ACTIVE',
      priority: 'HIGH',
      estimatedValue: 250000,
      progress: 65,
      deadline: '2024-08-15',
      courtDate: '2024-07-30',
      opposing: 'Peterson & Associates',
      nextAction: 'File motion for summary judgment',
      client: {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        company: 'Tech Solutions Inc.'
      },
      assignedTo: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe'
      },
      totalHours: 45,
      billableHours: 42,
      totalBilled: 21000,
      documents: 23,
      timeEntries: 15,
      tasks: 8
    },
    {
      id: '2',
      title: 'Personal Injury Claim',
      caseNumber: 'CASE-2024-002',
      description: 'Motor vehicle accident with significant injuries',
      type: 'PERSONAL_INJURY',
      status: 'DISCOVERY',
      priority: 'MEDIUM',
      estimatedValue: 150000,
      progress: 40,
      deadline: '2024-09-30',
      courtDate: undefined,
      opposing: 'State Farm Insurance',
      nextAction: 'Complete medical record review',
      client: {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.chen@personal.com'
      },
      assignedTo: {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith'
      },
      totalHours: 28,
      billableHours: 25,
      totalBilled: 12500,
      documents: 15,
      timeEntries: 12,
      tasks: 5
    },
    {
      id: '3',
      title: 'Employment Discrimination',
      caseNumber: 'CASE-2024-003',
      description: 'Workplace discrimination and wrongful termination case',
      type: 'EMPLOYMENT_LAW',
      status: 'MEDIATION',
      priority: 'HIGH',
      estimatedValue: 85000,
      progress: 80,
      deadline: '2024-07-20',
      courtDate: undefined,
      opposing: 'Corporate Legal Group',
      nextAction: 'Prepare for mediation session',
      client: {
        id: '3',
        name: 'Elizabeth Martinez',
        email: 'e.martinez@consulting.com',
        company: 'Martinez Consulting'
      },
      assignedTo: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe'
      },
      totalHours: 52,
      billableHours: 48,
      totalBilled: 24000,
      documents: 31,
      timeEntries: 20,
      tasks: 3
    }
  ];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadCases();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadCases = async () => {
    try {
      setIsLoading(true);
      setTimeout(() => {
        setCases(mockCases);
        setIsLoading(false);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Failed to load cases');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'discovery': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'mediation': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'trial': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'closed': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'won': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'settled': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getLocalizedStatus = (status: string) => {
    const statusKey = `cases.${status.toLowerCase()}`;
    return t(statusKey);
  };

  const getLocalizedType = (type: string) => {
    const typeKey = `cases.${type.toLowerCase().replace('_', '')}`;
    return t(typeKey);
  };

  const getLocalizedPriority = (priority: string) => {
    const priorityKey = `clients.${priority.toLowerCase()}`;
    return t(priorityKey);
  };

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || caseItem.status === statusFilter;
    const matchesType = !typeFilter || caseItem.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

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
        {t('cases.newCase')}
      </button>
    </div>
  );

  return (
    <Layout 
      title={t('cases.title')} 
      subtitle={t('cases.subtitle')}
      headerActions={headerActions}
    >
      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-white/40" />
              <input
                type="text"
                placeholder={t('cases.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/40"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          >
            <option value="">{t('cases.allStatuses')}</option>
            <option value="ACTIVE">{t('clients.active')}</option>
            <option value="DISCOVERY">{t('cases.discovery')}</option>
            <option value="MEDIATION">{t('cases.mediation')}</option>
            <option value="TRIAL">{t('cases.trial')}</option>
            <option value="CLOSED">{t('cases.closed')}</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          >
            <option value="">{t('cases.allTypes')}</option>
            <option value="CONTRACT_LAW">{t('cases.contractLaw')}</option>
            <option value="PERSONAL_INJURY">{t('cases.personalInjury')}</option>
            <option value="EMPLOYMENT_LAW">{t('cases.employmentLaw')}</option>
            <option value="CRIMINAL_DEFENSE">{t('cases.criminalDefense')}</option>
            <option value="FAMILY_LAW">{t('cases.familyLaw')}</option>
          </select>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCases.map((caseItem) => (
          <div key={caseItem.id} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{caseItem.title}</h3>
                <p className="text-sm text-white/60 font-mono">{caseItem.caseNumber}</p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(caseItem.status)}`}>
                  {getLocalizedStatus(caseItem.status)}
                </span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(caseItem.priority)}`}>
                  {getLocalizedPriority(caseItem.priority)}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-white/70 line-clamp-2">{caseItem.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-white/40">{t('cases.client')}</p>
                <p className="text-sm font-medium text-white">{caseItem.client.name}</p>
                {caseItem.client.company && (
                  <p className="text-xs text-white/60">{caseItem.client.company}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-white/40">{t('cases.assignedTo')}</p>
                <p className="text-sm font-medium text-white">
                  {caseItem.assignedTo.firstName} {caseItem.assignedTo.lastName}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/40">{t('cases.progress')}</span>
                <span className="text-xs text-white/70">{formatNumber(caseItem.progress)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressColor(caseItem.progress)}`}
                  style={{ width: `${caseItem.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
              <div>
                <p className="text-xs text-white/40">{t('cases.hours')}</p>
                <p className="text-sm font-semibold text-white">{formatNumber(caseItem.totalHours || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-white/40">{t('cases.documents')}</p>
                <p className="text-sm font-semibold text-white">{formatNumber(caseItem.documents || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-white/40">{t('cases.billed')}</p>
                <p className="text-sm font-semibold text-white">
                  {caseItem.totalBilled ? formatCurrency(caseItem.totalBilled) : '$0'}
                </p>
              </div>
            </div>

            {caseItem.deadline && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-yellow-400 mr-2" />
                  <span className="text-sm text-yellow-300">
                    {t('cases.deadline')}: {formatDate(caseItem.deadline)}
                  </span>
                </div>
              </div>
            )}

            {caseItem.nextAction && (
              <div className="mb-4">
                <p className="text-xs text-white/40 mb-1">{t('cases.nextAction')}</p>
                <p className="text-sm text-white/80">{caseItem.nextAction}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <div className="flex items-center text-xs text-white/40">
                {caseItem.estimatedValue && (
                  <span className="flex items-center">
                    <Target className="h-3 w-3 mr-1" />
                    Est. {formatCurrency(caseItem.estimatedValue)}
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-white/40 hover:text-blue-400 transition-colors">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-2 text-white/40 hover:text-green-400 transition-colors">
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

      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-16 w-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">{t('cases.noCases')}</h3>
          <p className="text-white/60">{t('cases.noCasesDesc')}</p>
        </div>
      )}

      {/* Add Case Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-white">{t('cases.newCase')}</h3>
            <p className="text-white/70 mb-4">Case creation form would go here.</p>
            <div className="flex justify-end space-x-3">
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
                {t('common.create')} {t('nav.cases')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
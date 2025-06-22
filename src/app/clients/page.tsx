'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import Layout from '@/components/layout/Layout';
import LanguageToggle from '@/components/LanguageToggle';
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  User,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  type: string;
  status: string;
  priority: string;
  notes?: string;
  joinDate: string;
  lastContact?: string;
  activeCases: number;
  totalCases: number;
  totalBilled?: number;
}

export default function ClientsPage() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, isRTL, formatCurrency, formatNumber } = useLanguage();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data for demonstration
  const mockClients: Client[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      company: 'Tech Solutions Inc.',
      address: '123 Main St, New York, NY 10001',
      type: 'CORPORATE',
      status: 'ACTIVE',
      priority: 'HIGH',
      notes: 'Key corporate client with multiple ongoing cases',
      joinDate: '2024-01-15',
      lastContact: '2024-06-15',
      activeCases: 3,
      totalCases: 8,
      totalBilled: 125000
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@personal.com',
      phone: '+1 (555) 987-6543',
      company: undefined,
      address: '456 Oak Ave, Los Angeles, CA 90210',
      type: 'INDIVIDUAL',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      notes: 'Personal injury case, very responsive',
      joinDate: '2024-03-22',
      lastContact: '2024-06-10',
      activeCases: 1,
      totalCases: 2,
      totalBilled: 45000
    },
    {
      id: '3',
      name: 'Elizabeth Martinez',
      email: 'e.martinez@consulting.com',
      phone: '+1 (555) 456-7890',
      company: 'Martinez Consulting',
      address: '789 Business Blvd, Chicago, IL 60601',
      type: 'CORPORATE',
      status: 'INACTIVE',
      priority: 'LOW',
      notes: 'Completed contract dispute case',
      joinDate: '2023-11-08',
      lastContact: '2024-04-30',
      activeCases: 0,
      totalCases: 1,
      totalBilled: 28000
    }
  ];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadClients();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setTimeout(() => {
        setClients(mockClients);
        setIsLoading(false);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Failed to load clients');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
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

  const getLocalizedStatus = (status: string) => {
    const statusKey = `clients.${status.toLowerCase()}`;
    return t(statusKey);
  };

  const getLocalizedType = (type: string) => {
    const typeKey = `clients.${type.toLowerCase()}`;
    return t(typeKey);
  };

  const getLocalizedPriority = (priority: string) => {
    const priorityKey = `clients.${priority.toLowerCase()}`;
    return t(priorityKey);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.company?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = !statusFilter || client.status === statusFilter;
    const matchesType = !typeFilter || client.type === typeFilter;
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
        {t('clients.addClient')}
      </button>
    </div>
  );

  return (
    <Layout 
      title={t('clients.title')} 
      subtitle={t('clients.subtitle')}
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
                placeholder={t('clients.search')}
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
            <option value="">{t('clients.allStatuses')}</option>
            <option value="ACTIVE">{t('clients.active')}</option>
            <option value="INACTIVE">{t('clients.inactive')}</option>
            <option value="PENDING">{t('clients.pending')}</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          >
            <option value="">{t('clients.allTypes')}</option>
            <option value="INDIVIDUAL">{t('clients.individual')}</option>
            <option value="CORPORATE">{t('clients.corporate')}</option>
          </select>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{client.name}</h3>
                {client.company && (
                  <p className="text-sm text-white/60 flex items-center mt-1">
                    <Building2 className="h-4 w-4 mr-1" />
                    {client.company}
                  </p>
                )}
              </div>
              <div className="flex space-x-1">
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(client.status)}`}>
                  {getLocalizedStatus(client.status)}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-white/70 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-white/40" />
                {client.email}
              </p>
              {client.phone && (
                <p className="text-sm text-white/70 flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-white/40" />
                  {client.phone}
                </p>
              )}
              {client.address && (
                <p className="text-sm text-white/70 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-white/40" />
                  {client.address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-white/40">{t('clients.activeCases')}</p>
                <p className="text-lg font-semibold text-white">{formatNumber(client.activeCases)}</p>
              </div>
              <div>
                <p className="text-xs text-white/40">{t('clients.totalBilled')}</p>
                <p className="text-lg font-semibold text-white">
                  {client.totalBilled ? formatCurrency(client.totalBilled) : '$0'}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(client.priority)}`}>
                {getLocalizedPriority(client.priority)} {t('clients.priority')}
              </span>
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

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">{t('clients.noClients')}</h3>
          <p className="text-white/60">{t('clients.noClientsDesc')}</p>
        </div>
      )}

      {/* Add Client Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-white">{t('clients.addClient')}</h3>
            <p className="text-white/70 mb-4">Client creation form would go here.</p>
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
                {t('common.save')} {t('nav.clients')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
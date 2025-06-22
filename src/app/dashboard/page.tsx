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
  FileText, 
  Clock, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Circle,
  Briefcase,
  Loader2
} from 'lucide-react';

interface DashboardData {
  summary: {
    totalClients: number;
    totalCases: number;
    activeCases: number;
    totalTasks: number;
    pendingTasks: number;
    totalRevenue: number;
    recentRevenue: number;
  };
}

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, isRTL, formatCurrency, formatNumber } = useLanguage();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    if (isAuthenticated && !dashboardData && !error) {
      loadDashboardData();
    }
  }, [isAuthenticated, authLoading, router, dashboardData, error]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getDashboardAnalytics();
      setDashboardData(response.dashboard);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Layout title={t('common.error')} subtitle="">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">{t('common.error')}</h1>
          <p className="text-white/70 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t('common.tryAgain')}
          </button>
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const headerActions = (
    <LanguageToggle />
  );

  return (
    <Layout 
      title={`${t('dashboard.welcome')}, ${user?.firstName}!`} 
      subtitle={t('dashboard.subtitle')}
      headerActions={headerActions}
    >
      {/* Welcome Section */}
      <div className="mb-8">
        <p className="text-white/80 mb-4">
          {t('dashboard.subtitle')}
        </p>
        
        {!dashboardData && !isLoading && (
          <button
            onClick={loadDashboardData}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t('dashboard.loadData')}
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
              <p className="text-sm font-medium text-white/60">{t('dashboard.totalClients')}</p>
              <p className="text-2xl font-bold text-white">
                {formatNumber(dashboardData.summary.totalClients)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Briefcase className="h-6 w-6 text-green-400" />
            </div>
            <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
              <p className="text-sm font-medium text-white/60">{t('dashboard.activeCases')}</p>
              <p className="text-2xl font-bold text-white">
                {formatNumber(dashboardData.summary.activeCases)}
              </p>
              <p className="text-xs text-white/40">
                {t('common.of')} {formatNumber(dashboardData.summary.totalCases)} {t('common.total')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
            <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
              <p className="text-sm font-medium text-white/60">{t('dashboard.pendingTasks')}</p>
              <p className="text-2xl font-bold text-white">
                {formatNumber(dashboardData.summary.pendingTasks)}
              </p>
              <p className="text-xs text-white/40">
                {t('common.of')} {formatNumber(dashboardData.summary.totalTasks)} {t('common.total')}
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
              <p className="text-sm font-medium text-white/60">{t('dashboard.totalRevenue')}</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(dashboardData.summary.totalRevenue)}
              </p>
              <p className="text-xs text-green-400 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {formatCurrency(dashboardData.summary.recentRevenue)} {t('common.thisMonth')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-medium text-white mb-4">{t('dashboard.recentActivity')}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">Dashboard loaded successfully! 🎉</p>
                <p className="text-white/60 text-sm">All systems operational</p>
              </div>
            </div>
            <span className="text-white/40 text-sm">Just now</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">
                  You have {formatNumber(dashboardData.summary.totalClients)} clients
                </p>
                <p className="text-white/60 text-sm">Client management overview</p>
              </div>
            </div>
            <span className="text-white/40 text-sm">Active</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">
                  {formatNumber(dashboardData.summary.activeCases)} active cases
                </p>
                <p className="text-white/60 text-sm">Cases requiring attention</p>
              </div>
            </div>
            <span className="text-white/40 text-sm">Ongoing</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
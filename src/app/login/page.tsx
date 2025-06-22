'use client';

import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import LoginButton from './login-button';

export default function LoginPage() {
  const { t, isRTL } = useLanguage();
  // Use demo credentials by default (can be changed by user)
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demo1234');

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-md w-full space-y-8">
        {/* Language Toggle */}
        <div className="flex justify-end">
          <LanguageToggle />
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Scale className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {t('login.title')}
          </h2>
          <p className="text-blue-200">
            {t('login.subtitle')}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="space-y-6">            
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">
                {t('login.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="admin@legalcasepro.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">
                {t('login.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
              />
            </div>

            {/* Use our specialized login button component for reliable login and redirection */}
            <LoginButton
              email={email}
              password={password}
            />
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <h3 className="text-sm font-medium text-blue-100 mb-3">{t('login.demoCredentials')}</h3>
            <div className="space-y-2 text-xs text-blue-200">
              <div className="bg-white/5 rounded p-2">
                <strong>{t('login.admin')}:</strong> admin@legalcasepro.com / demo123
              </div>
              <div className="bg-white/5 rounded p-2">
                <strong>{t('login.attorney')}:</strong> jane.smith@legalcasepro.com / demo123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
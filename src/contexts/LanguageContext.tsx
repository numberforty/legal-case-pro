'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number | string) => string;
  formatDate: (date: string | Date) => string;
}

const translations = {
  en: {
    // App
    'app.title': 'LegalCase Pro',
    'app.version': 'v2.1.0',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.tryAgain': 'Try Again',
    'common.of': 'of',
    'common.total': 'total',
    'common.thisMonth': 'this month',
    'common.version': 'v',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.caseManagement': 'Case Management',
    'nav.clientManagement': 'Client Management',
    'nav.clients': 'Clients',
    'nav.cases': 'Cases',
    'nav.documents': 'Documents',
    'nav.timeTracking': 'Time Tracking',
    'nav.calendar': 'Calendar',
    'nav.billingFinance': 'Billing & Finance',
    'nav.communication': 'Communication',
    'nav.reportsAnalytics': 'Reports & Analytics',
    'nav.administration': 'Administration',

    // Header
    'header.notifications': 'Notifications',
    'header.logout': 'Logout',
    'header.profile': 'Profile',

    // Dashboard
    'dashboard.loading': 'Loading dashboard...',
    'dashboard.welcome': 'Welcome',
    'dashboard.subtitle': 'Here\'s what\'s happening with your cases today.',
    'dashboard.loadData': 'Load Dashboard Data',
    'dashboard.totalClients': 'Total Clients',
    'dashboard.activeCases': 'Active Cases',
    'dashboard.pendingTasks': 'Pending Tasks',
    'dashboard.totalRevenue': 'Total Revenue',
    'dashboard.recentActivity': 'Recent Activity',

    // Clients
    'clients.title': 'Clients',
    'clients.subtitle': 'Manage client relationships and information',
    'clients.addClient': 'Add Client',
    'clients.search': 'Search clients by name, email, or company...',
    'clients.allStatuses': 'All Statuses',
    'clients.allTypes': 'All Types',
    'clients.activeCases': 'Active Cases',
    'clients.totalBilled': 'Total Billed',
    'clients.priority': 'Priority',
    'clients.noClients': 'No clients found',
    'clients.noClientsDesc': 'Try adjusting your search criteria or add a new client.',
    'clients.active': 'Active',
    'clients.inactive': 'Inactive',
    'clients.pending': 'Pending',
    'clients.individual': 'Individual',
    'clients.corporate': 'Corporate',
    'clients.high': 'High',
    'clients.medium': 'Medium',
    'clients.low': 'Low',

    // Cases
    'cases.title': 'Cases',
    'cases.subtitle': 'Manage and track all your legal cases',
    'cases.newCase': 'New Case',
    'cases.search': 'Search cases by title, case number, or client...',
    'cases.allStatuses': 'All Statuses',
    'cases.allTypes': 'All Types',
    'cases.client': 'Client',
    'cases.assignedTo': 'Assigned To',
    'cases.progress': 'Progress',
    'cases.hours': 'Hours',
    'cases.documents': 'Documents',
    'cases.billed': 'Billed',
    'cases.deadline': 'Deadline',
    'cases.nextAction': 'Next Action',
    'cases.noCases': 'No cases found',
    'cases.noCasesDesc': 'Try adjusting your search criteria or create a new case.',
    'cases.discovery': 'Discovery',
    'cases.mediation': 'Mediation',
    'cases.trial': 'Trial',
    'cases.closed': 'Closed',
    'cases.contractLaw': 'Contract Law',
    'cases.personalInjury': 'Personal Injury',
    'cases.employmentLaw': 'Employment Law',
    'cases.criminalDefense': 'Criminal Defense',
    'cases.familyLaw': 'Family Law',

    // Documents
    'documents.title': 'Documents',
    'documents.subtitle': 'Manage and organize case documents and files',
    'documents.upload': 'Upload Document',
    'documents.search': 'Search documents by name, tags, or description...',
    'documents.allTypes': 'All Types',
    'documents.sortByDate': 'Sort by Date',
    'documents.sortByName': 'Sort by Name',
    'documents.sortBySize': 'Sort by Size',
    'documents.case': 'Case',
    'documents.document': 'Document',
    'documents.size': 'Size',
    'documents.uploaded': 'Uploaded',
    'documents.actions': 'Actions',
    'documents.noDocuments': 'No documents found',
    'documents.noDocumentsDesc': 'Try adjusting your search criteria or upload a new document.',

    // Time Tracking
    'time.title': 'Time Tracking',
    'time.subtitle': 'Track billable hours and manage time entries',
    'time.addEntry': 'Add Time Entry',
    'time.timerRunning': 'Timer Running',
    'time.stop': 'Stop',
    'time.quickTimer': 'Quick Timer',
    'time.selectCase': 'Select a case...',
    'time.description': 'Description of work...',
    'time.startTimer': 'Start Timer',
    'time.totalHours': 'Total Hours',
    'time.billableHours': 'Billable Hours',
    'time.totalRevenue': 'Total Revenue',
    'time.avgRate': 'Avg Rate',
    'time.search': 'Search time entries by description, case, or client...',
    'time.allCases': 'All Cases',
    'time.hours': 'hours',
    'time.revenue': 'revenue',
    'time.manualEntry': 'Manual entry',
    'time.billable': 'Billable',
    'time.nonBillable': 'Non-billable',
    'time.noCharge': 'No charge',
    'time.noEntries': 'No time entries found',
    'time.noEntriesDesc': 'Start tracking time or add manual entries to see your work log.',

    // Login
    'login.title': 'Welcome Back',
    'login.subtitle': 'Sign in to your account to continue',
    'login.email': 'Email Address',
    'login.password': 'Password',
    'login.emailPlaceholder': 'Enter your email',
    'login.passwordPlaceholder': 'Enter your password',
    'login.button': 'Sign In',
    'login.loggingIn': 'Signing in...',

    // Communication
    'communication.title': 'Communication',
    'communication.subtitle': 'Chat and communicate with clients and team members',
    'communication.newChat': 'New Chat',
    'communication.searchConversations': 'Search conversations...',
    'communication.typeMessage': 'Type a message...',
    'communication.selectConversation': 'Select a Conversation',
    'communication.selectConversationDesc': 'Choose a conversation from the sidebar to start chatting',
    'communication.participants': 'participants',
    'communication.attachment': 'Attachment',
    'communication.attachFile': 'Attach File',
    'communication.document': 'Document',
    'communication.image': 'Image',
    'communication.file': 'File',
    'communication.selectContact': 'Select Contact',
    'communication.chooseContact': 'Choose a contact...',
    'communication.startChat': 'Start Chat',
    'communication.online': 'Online',
    'communication.offline': 'Offline',
    'communication.away': 'Away',

    // Language
    'language.english': 'English',
    'language.arabic': 'العربية',
  },
  ar: {
    // App
    'app.title': 'لييغال كيس برو',
    'app.version': 'الإصدار 2.1.0',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.create': 'إنشاء',
    'common.update': 'تحديث',
    'common.view': 'عرض',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.tryAgain': 'حاول مرة أخرى',
    'common.of': 'من',
    'common.total': 'الإجمالي',
    'common.thisMonth': 'هذا الشهر',
    'common.version': 'ر',

    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.caseManagement': 'إدارة القضايا',
    'nav.clientManagement': 'إدارة العملاء',
    'nav.clients': 'العملاء',
    'nav.cases': 'القضايا',
    'nav.documents': 'المستندات',
    'nav.timeTracking': 'تتبع الوقت',
    'nav.calendar': 'التقويم',
    'nav.billingFinance': 'الفوترة والمالية',
    'nav.communication': 'التواصل',
    'nav.reportsAnalytics': 'التقارير والتحليلات',
    'nav.administration': 'الإدارة',

    // Header
    'header.notifications': 'الإشعارات',
    'header.logout': 'تسجيل الخروج',
    'header.profile': 'الملف الشخصي',

    // Dashboard
    'dashboard.loading': 'جاري تحميل لوحة التحكم...',
    'dashboard.welcome': 'مرحباً بك',
    'dashboard.subtitle': 'إليك ما يحدث مع قضاياك اليوم.',
    'dashboard.loadData': 'تحميل بيانات لوحة التحكم',
    'dashboard.totalClients': 'إجمالي العملاء',
    'dashboard.activeCases': 'القضايا النشطة',
    'dashboard.pendingTasks': 'المهام المعلقة',
    'dashboard.totalRevenue': 'إجمالي الإيرادات',
    'dashboard.recentActivity': 'النشاط الأخير',

    // Clients
    'clients.title': 'العملاء',
    'clients.subtitle': 'إدارة علاقات العملاء والمعلومات',
    'clients.addClient': 'إضافة عميل',
    'clients.search': 'البحث في العملاء بالاسم أو البريد الإلكتروني أو الشركة...',
    'clients.allStatuses': 'جميع الحالات',
    'clients.allTypes': 'جميع الأنواع',
    'clients.activeCases': 'القضايا النشطة',
    'clients.totalBilled': 'إجمالي الفواتير',
    'clients.priority': 'الأولوية',
    'clients.noClients': 'لم يتم العثور على عملاء',
    'clients.noClientsDesc': 'حاول تعديل معايير البحث أو إضافة عميل جديد.',
    'clients.active': 'نشط',
    'clients.inactive': 'غير نشط',
    'clients.pending': 'في الانتظار',
    'clients.individual': 'فردي',
    'clients.corporate': 'شركة',
    'clients.high': 'عالية',
    'clients.medium': 'متوسطة',
    'clients.low': 'منخفضة',

    // Cases
    'cases.title': 'القضايا',
    'cases.subtitle': 'إدارة وتتبع جميع القضايا القانونية',
    'cases.newCase': 'قضية جديدة',
    'cases.search': 'البحث في القضايا بالعنوان أو رقم القضية أو العميل...',
    'cases.allStatuses': 'جميع الحالات',
    'cases.allTypes': 'جميع الأنواع',
    'cases.client': 'العميل',
    'cases.assignedTo': 'مسند إلى',
    'cases.progress': 'التقدم',
    'cases.hours': 'الساعات',
    'cases.documents': 'المستندات',
    'cases.billed': 'مُفوتر',
    'cases.deadline': 'الموعد النهائي',
    'cases.nextAction': 'الإجراء التالي',
    'cases.noCases': 'لم يتم العثور على قضايا',
    'cases.noCasesDesc': 'حاول تعديل معايير البحث أو إنشاء قضية جديدة.',
    'cases.discovery': 'الاستكشاف',
    'cases.mediation': 'الوساطة',
    'cases.trial': 'المحاكمة',
    'cases.closed': 'مغلقة',
    'cases.contractLaw': 'قانون العقود',
    'cases.personalInjury': 'الإصابة الشخصية',
    'cases.employmentLaw': 'قانون العمل',
    'cases.criminalDefense': 'الدفاع الجنائي',
    'cases.familyLaw': 'قانون الأسرة',

    // Documents
    'documents.title': 'المستندات',
    'documents.subtitle': 'إدارة وتنظيم مستندات وملفات القضايا',
    'documents.upload': 'رفع مستند',
    'documents.search': 'البحث في المستندات بالاسم أو العلامات أو الوصف...',
    'documents.allTypes': 'جميع الأنواع',
    'documents.sortByDate': 'ترتيب حسب التاريخ',
    'documents.sortByName': 'ترتيب حسب الاسم',
    'documents.sortBySize': 'ترتيب حسب الحجم',
    'documents.case': 'القضية',
    'documents.document': 'المستند',
    'documents.size': 'الحجم',
    'documents.uploaded': 'مرفوع',
    'documents.actions': 'الإجراءات',
    'documents.noDocuments': 'لم يتم العثور على مستندات',
    'documents.noDocumentsDesc': 'حاول تعديل معايير البحث أو رفع مستند جديد.',

    // Time Tracking
    'time.title': 'تتبع الوقت',
    'time.subtitle': 'تتبع الساعات القابلة للفوترة وإدارة إدخالات الوقت',
    'time.addEntry': 'إضافة إدخال وقت',
    'time.timerRunning': 'المؤقت يعمل',
    'time.stop': 'إيقاف',
    'time.quickTimer': 'مؤقت سريع',
    'time.selectCase': 'اختر قضية...',
    'time.description': 'وصف العمل...',
    'time.startTimer': 'بدء المؤقت',
    'time.totalHours': 'إجمالي الساعات',
    'time.billableHours': 'الساعات القابلة للفوترة',
    'time.totalRevenue': 'إجمالي الإيرادات',
    'time.avgRate': 'متوسط السعر',
    'time.search': 'البحث في إدخالات الوقت بالوصف أو القضية أو العميل...',
    'time.allCases': 'جميع القضايا',
    'time.hours': 'ساعات',
    'time.revenue': 'إيرادات',
    'time.manualEntry': 'إدخال يدوي',
    'time.billable': 'قابل للفوترة',
    'time.nonBillable': 'غير قابل للفوترة',
    'time.noCharge': 'بدون رسوم',
    'time.noEntries': 'لم يتم العثور على إدخالات وقت',
    'time.noEntriesDesc': 'ابدأ في تتبع الوقت أو أضف إدخالات يدوية لرؤية سجل عملك.',

    // Login
    'login.title': 'مرحباً بعودتك',
    'login.subtitle': 'سجل دخولك إلى حسابك للمتابعة',
    'login.email': 'عنوان البريد الإلكتروني',
    'login.password': 'كلمة المرور',
    'login.emailPlaceholder': 'أدخل بريدك الإلكتروني',
    'login.passwordPlaceholder': 'أدخل كلمة المرور',
    'login.button': 'تسجيل الدخول',
    'login.loggingIn': 'جاري تسجيل الدخول...',

    // Communication
    'communication.title': 'التواصل',
    'communication.subtitle': 'الدردشة والتواصل مع العملاء وأعضاء الفريق',
    'communication.newChat': 'محادثة جديدة',
    'communication.searchConversations': 'البحث في المحادثات...',
    'communication.typeMessage': 'اكتب رسالة...',
    'communication.selectConversation': 'اختر محادثة',
    'communication.selectConversationDesc': 'اختر محادثة من الشريط الجانبي لبدء الدردشة',
    'communication.participants': 'مشاركين',
    'communication.attachment': 'مرفق',
    'communication.attachFile': 'إرفاق ملف',
    'communication.document': 'مستند',
    'communication.image': 'صورة',
    'communication.file': 'ملف',
    'communication.selectContact': 'اختيار جهة الاتصال',
    'communication.chooseContact': 'اختر جهة اتصال...',
    'communication.startChat': 'بدء المحادثة',
    'communication.online': 'متصل',
    'communication.offline': 'غير متصل',
    'communication.away': 'بعيد',
      
    // Language
    'language.english': 'English',
    'language.arabic': 'العربية',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    
    // Set document direction and lang attribute
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Force English numerals for ALL numbers, regardless of language
  const forceEnglishNumerals = (str: string): string => {
    return str.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (match) => {
      // Convert Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩) and Extended Arabic-Indic digits to ASCII
      const arabicIndic = '\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669';
      const extendedArabicIndic = '\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9';
      const ascii = '0123456789';
      
      let index = arabicIndic.indexOf(match);
      if (index !== -1) return ascii[index];
      
      index = extendedArabicIndic.indexOf(match);
      if (index !== -1) return ascii[index];
      
      return match;
    });
  };

  const formatCurrency = (amount: number): string => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
    return forceEnglishNumerals(formatted);
  };

  const formatNumber = (num: number | string): string => {
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numValue)) return String(num);
    
    const formatted = new Intl.NumberFormat('en-US').format(numValue);
    return forceEnglishNumerals(formatted);
  };

  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Always use English locale for dates to prevent Arabic numerals
    const formatted = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    
    return forceEnglishNumerals(formatted);
  };

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t,
    isRTL: language === 'ar',
    formatCurrency,
    formatNumber,
    formatDate,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}


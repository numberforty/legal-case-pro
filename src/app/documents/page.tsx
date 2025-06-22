'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import Layout from '@/components/layout/Layout';
import LanguageToggle from '@/components/LanguageToggle';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus,
  Upload,
  Download,
  File,
  Folder,
  FolderOpen,
  Image,
  FileSpreadsheet,
  FileIcon,
  Calendar,
  User,
  Edit,
  Trash2,
  Eye,
  Share,
  Lock,
  Unlock,
  Tag,
  Clock,
  Loader2,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  MoreVertical
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: {
    firstName: string;
    lastName: string;
  };
  case?: {
    id: string;
    title: string;
    caseNumber: string;
  };
  client?: {
    id: string;
    name: string;
  };
  tags: string[];
  isConfidential: boolean;
  version: number;
  description?: string;
}

export default function DocumentsPage() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, isRTL, formatNumber } = useLanguage();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [caseFilter, setCaseFilter] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock data for demonstration
  const mockDocuments: Document[] = [
    {
      id: '1',
      name: 'Contract_Amendment_v3.pdf',
      type: 'application/pdf',
      size: 2048576, // 2MB
      uploadedAt: '2024-06-20T10:30:00Z',
      uploadedBy: {
        firstName: 'John',
        lastName: 'Doe'
      },
      case: {
        id: '1',
        title: 'Contract Dispute Resolution',
        caseNumber: 'CASE-2024-001'
      },
      client: {
        id: '1',
        name: 'Sarah Johnson'
      },
      tags: ['contract', 'amendment', 'legal'],
      isConfidential: true,
      version: 3,
      description: 'Final amendment to the software licensing agreement'
    },
    {
      id: '2',
      name: 'Medical_Records_Summary.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 512000, // 500KB
      uploadedAt: '2024-06-19T14:15:00Z',
      uploadedBy: {
        firstName: 'Jane',
        lastName: 'Smith'
      },
      case: {
        id: '2',
        title: 'Personal Injury Claim',
        caseNumber: 'CASE-2024-002'
      },
      client: {
        id: '2',
        name: 'Michael Chen'
      },
      tags: ['medical', 'records', 'injury'],
      isConfidential: true,
      version: 1,
      description: 'Comprehensive medical records analysis'
    },
    {
      id: '3',
      name: 'Employment_Policy_Review.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 1024000, // 1MB
      uploadedAt: '2024-06-18T09:45:00Z',
      uploadedBy: {
        firstName: 'John',
        lastName: 'Doe'
      },
      case: {
        id: '3',
        title: 'Employment Discrimination',
        caseNumber: 'CASE-2024-003'
      },
      client: {
        id: '3',
        name: 'Elizabeth Martinez'
      },
      tags: ['employment', 'policy', 'discrimination'],
      isConfidential: false,
      version: 2,
      description: 'Review of company employment policies'
    },
    {
      id: '4',
      name: 'Evidence_Photos.zip',
      type: 'application/zip',
      size: 15728640, // 15MB
      uploadedAt: '2024-06-17T16:20:00Z',
      uploadedBy: {
        firstName: 'Jane',
        lastName: 'Smith'
      },
      case: {
        id: '2',
        title: 'Personal Injury Claim',
        caseNumber: 'CASE-2024-002'
      },
      client: {
        id: '2',
        name: 'Michael Chen'
      },
      tags: ['evidence', 'photos', 'accident'],
      isConfidential: true,
      version: 1,
      description: 'Accident scene and vehicle damage photographs'
    }
  ];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadDocuments();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setTimeout(() => {
        setDocuments(mockDocuments);
        setIsLoading(false);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Failed to load documents');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'en-US' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="h-8 w-8 text-red-400" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="h-8 w-8 text-green-400" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileIcon className="h-8 w-8 text-blue-400" />;
    if (mimeType.includes('image')) return <Image className="h-8 w-8 text-purple-400" />;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <Folder className="h-8 w-8 text-yellow-400" />;
    return <File className="h-8 w-8 text-gray-400" />;
  };

  const sortedAndFilteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesType = !typeFilter || doc.type.includes(typeFilter);
      const matchesCase = !caseFilter || doc.case?.id === caseFilter;
      return matchesSearch && matchesType && matchesCase;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.uploadedAt).getTime();
          bValue = new Date(b.uploadedAt).getTime();
          break;
        case 'size':
          aValue = a.size;
          bValue = b.size;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
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
        onClick={() => setShowUploadModal(true)}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
      >
        <Upload className="h-4 w-4 mr-2" />
        {t('documents.upload')}
      </button>
    </div>
  );

  return (
    <Layout 
      title={t('documents.title')} 
      subtitle={t('documents.subtitle')}
      headerActions={headerActions}
    >
      {/* Filters and View Controls */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-white/40" />
              <input
                type="text"
                placeholder={t('documents.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-white/40"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
            >
              <option value="">{t('documents.allTypes')}</option>
              <option value="pdf">PDF</option>
              <option value="word">Word</option>
              <option value="excel">Excel</option>
              <option value="image">Images</option>
              <option value="zip">Archives</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
            >
              <option value="date">{t('documents.sortByDate')}</option>
              <option value="name">{t('documents.sortByName')}</option>
              <option value="size">{t('documents.sortBySize')}</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-5 w-5 text-white" /> : <SortDesc className="h-5 w-5 text-white" />}
            </button>
            <div className="flex border border-white/10 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-purple-500/20 text-purple-400' : 'text-white/40'} hover:bg-white/10 transition-colors`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-purple-500/20 text-purple-400' : 'text-white/40'} hover:bg-white/10 transition-colors`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedAndFilteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center justify-center mb-3">
                {getFileIcon(doc.type)}
              </div>
              
              <div className="text-center mb-3">
                <h3 className="font-medium text-white text-sm truncate" title={doc.name}>
                  {doc.name}
                </h3>
                <p className="text-xs text-white/40 mt-1">{formatFileSize(doc.size)}</p>
              </div>

              {doc.case && (
                <div className="mb-2">
                  <p className="text-xs text-white/40">{t('documents.case')}</p>
                  <p className="text-xs font-medium text-white/70 truncate">{doc.case.caseNumber}</p>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40">
                  {formatDate(doc.uploadedAt)}
                </span>
                {doc.isConfidential && (
                  <Lock className="h-3 w-3 text-red-400" />
                )}
              </div>

              {doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {doc.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">
                      {tag}
                    </span>
                  ))}
                  {doc.tags.length > 2 && (
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded border border-gray-500/30">
                      +{formatNumber(doc.tags.length - 2)}
                    </span>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-white/10">
                <span className="text-xs text-white/40">{t('common.version')}{formatNumber(doc.version)}</span>
                <div className="flex space-x-1">
                  <button className="p-1 text-white/40 hover:text-blue-400 transition-colors">
                    <Eye className="h-3 w-3" />
                  </button>
                  <button className="p-1 text-white/40 hover:text-green-400 transition-colors">
                    <Download className="h-3 w-3" />
                  </button>
                  <button className="p-1 text-white/40 hover:text-purple-400 transition-colors">
                    <Share className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  {t('documents.document')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  {t('documents.case')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  {t('documents.size')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  {t('documents.uploaded')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  {t('documents.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {sortedAndFilteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-white truncate">
                            {doc.name}
                          </p>
                          {doc.isConfidential && (
                            <Lock className="h-3 w-3 text-red-400 ml-2" />
                          )}
                        </div>
                        {doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {doc.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="px-1 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {doc.case ? (
                      <div>
                        <p className="text-sm text-white">{doc.case.caseNumber}</p>
                        <p className="text-xs text-white/60 truncate">{doc.case.title}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-white/40">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                    {formatFileSize(doc.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm text-white">{formatDate(doc.uploadedAt)}</p>
                      <p className="text-xs text-white/60">
                        by {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-400 hover:text-blue-300">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-400 hover:text-green-300">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="text-purple-400 hover:text-purple-300">
                        <Share className="h-4 w-4" />
                      </button>
                      <button className="text-white/40 hover:text-white/60">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sortedAndFilteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">{t('documents.noDocuments')}</h3>
          <p className="text-white/60">{t('documents.noDocumentsDesc')}</p>
        </div>
      )}

      {/* Upload Modal Placeholder */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-white">{t('documents.upload')}</h3>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center mb-4">
              <Upload className="h-8 w-8 text-white/40 mx-auto mb-2" />
              <p className="text-sm text-white/60">Drag and drop files here or click to browse</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {t('documents.upload')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
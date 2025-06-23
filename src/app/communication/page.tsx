// CHUNK 1: Imports and Interfaces
// Copy this to the top of your communication page.tsx file

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import LanguageToggle from '@/components/LanguageToggle';
import { 
  MessageSquare,
  Send,
  Phone,
  Video,
  Users,
  Search,
  Plus,
  Paperclip,
  Smile,
  MoreVertical,
  Check,
  CheckCheck,
  Circle,
  Loader2,
  FileText,
  Image,
  Download,
  X,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Power,
  PowerOff,
  RefreshCw
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'online' | 'offline' | 'away';
  whatsappNumber?: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file';
  status: 'sent' | 'delivered' | 'read';
  platform?: 'internal' | 'whatsapp';
}

interface Conversation {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'case' | 'whatsapp';
  participants: Contact[];
  lastMessage?: Message;
  unreadCount: number;
  platform: 'internal' | 'whatsapp';
}
// CHUNK 2: Component Declaration and State
// Copy this after the interfaces

export default function CommunicationPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const { t, isRTL, formatDate } = useLanguage();
    const router = useRouter();
    
    // State management
    const [selectedTab, setSelectedTab] = useState<'internal' | 'whatsapp'>('internal');
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showNewChat, setShowNewChat] = useState(false);
    
    // WhatsApp state
    const [whatsappStatus, setWhatsappStatus] = useState({
      isReady: false,
      isConnecting: false,
      error: 'WhatsApp not connected'
    });

    // Contacts loaded from the API
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContactId, setSelectedContactId] = useState('');

  // CHUNK 4: Functions and useEffect hooks
// Copy this after the mock data

  // Check WhatsApp status with improved error handling
  const checkWhatsAppStatus = useCallback(async (retryAttempt = 0) => {
    try {
      // Use AbortController to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch('/api/whatsapp/status', {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const status = await response.json();
        console.log('WhatsApp status updated:', status);
        setWhatsappStatus(status);
        return status; // Return status for chaining
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError; // Re-throw to be handled by the outer catch
      }
    } catch (error) {
      console.error('Failed to check WhatsApp status:', error);
      
      // Only show error in UI if we've retried or it's not an abort error
      if (retryAttempt > 0 || !((error as { name?: string })?.name === 'AbortError')) {
        setWhatsappStatus(prev => ({
          isReady: false,
          isConnecting: false,
          error: 'Connection check failed'
        }));
      }
      
      // Retry once with a short delay for transient errors
      if (retryAttempt === 0) {
        console.log('Retrying WhatsApp status check once...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return checkWhatsAppStatus(1);
      }
      
      return null; // Indicate failure
    }
  }, []);

  // Initialize WhatsApp with retry logic
  const initializeWhatsApp = async (retryCount = 0) => {
    try {
      // If already connecting, don't try to initialize again
      if (whatsappStatus.isConnecting) {
        console.log('WhatsApp connection already in progress');
        return;
      }
      
      // Update UI immediately to show connection attempt
      setWhatsappStatus(prev => ({ 
        ...prev, 
        isConnecting: true, 
        error: undefined 
      }));

      // Always ensure we disconnect first, regardless of current state
      try {
        console.log('Ensuring WhatsApp is disconnected before reconnecting...');
        const disconnectResponse = await fetch('/api/whatsapp/disconnect', { 
          method: 'POST',
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (!disconnectResponse.ok) {
          console.warn('WhatsApp disconnect returned:', disconnectResponse.status);
        }
      } catch (disconnectErr) {
        console.error('WhatsApp disconnect error:', disconnectErr);
        // Continue anyway - we'll try to initialize a new session
      }
      
      // Wait longer for disconnect to complete (increase from 2s to 5s)
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Start new session with robust error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const response = await fetch('/api/whatsapp/status', { 
          method: 'POST',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const result = await response.json();
        console.log("Status updated:", result);
        
        // Give a longer pause before checking status again
        await new Promise(resolve => setTimeout(resolve, 3000));
        await checkWhatsAppStatus();
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError; // Re-throw to be handled by the outer catch
      }
    } catch (error) {
      console.error("WhatsApp initialization error:", error);
      
      if (retryCount < 3) { // Increase max retries
        const backoffDelay = Math.pow(2, retryCount) * 3000; // Exponential backoff
        setWhatsappStatus({ 
          isReady: false, 
          isConnecting: false, 
          error: `Retrying connection (${retryCount + 1}/4)...` 
        });
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return initializeWhatsApp(retryCount + 1);
      }
      
      // All retries failed
      setWhatsappStatus({
        isReady: false,
        isConnecting: false,
        error: `Initialization failed: ${error instanceof Error ? error.message : 'Connection failed'}`
      });
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Tracking interval reference to prevent multiple instances
    let statusCheckInterval: NodeJS.Timeout | null = null;

    if (isAuthenticated) {
      loadCommunicationData();
      // Initial status check
      checkWhatsAppStatus();
      
      // Check status every 10 seconds (increased from 5s to reduce server load)
      // and store interval reference for proper cleanup
      statusCheckInterval = setInterval(checkWhatsAppStatus, 10000);

      // Cleanup function
      return () => {
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          statusCheckInterval = null;
        }
      };
    }
  }, [isAuthenticated, authLoading, router, checkWhatsAppStatus]);

  const loadCommunicationData = useCallback(async () => {
    try {
      setIsLoading(true);

      if (selectedTab === 'internal') {
        setConversations([]);
        setSelectedConversation(null);
        setMessages([]);
      } else {
        const [clientsResp, messagesResp] = await Promise.all([
          fetch('/api/whatsapp/clients'),
          fetch('/api/whatsapp/messages?limit=50')
        ]);

        if (!clientsResp.ok) throw new Error('Failed to load WhatsApp clients');
        if (!messagesResp.ok)
          throw new Error('Failed to load WhatsApp messages');

        const clientsData = await clientsResp.json();
        const data = await messagesResp.json();

        const loadedContacts: Contact[] = (clientsData.clients || []).map((client: any) => ({
          id: client.id,
          name: client.name || (client.whatsappNumber || '').replace(/\D/g, ''),
          email: '',
          role: 'Client',
          status: 'online',
          whatsappNumber: client.whatsappNumber,
        }));
        setContacts(loadedContacts);

        const convoMap = new Map<string, Conversation>();

        (clientsData.clients || []).forEach((client: any) => {
          const phone = (client.whatsappNumber || '').replace(/\D/g, '');
          if (!phone) return;

          const contact: Contact = {
            id: client.id,
            name: client.name || phone,
            email: '',
            role: 'Client',
            status: 'online',
            whatsappNumber: client.whatsappNumber
          };

          convoMap.set(phone, {
            id: phone,
            name: client.name || phone,
            type: 'whatsapp',
            participants: [contact],
            unreadCount: 0,
            platform: 'whatsapp'
          });
        });

        (data.messages || []).forEach((msg: any) => {
          const phoneRaw = msg.direction === 'INBOUND' ? msg.from : msg.to;
          const phone = phoneRaw.replace(/@c\.us$/, '').replace(/\D/g, '');

          if (!convoMap.has(phone)) {
            const contact: Contact = {
              id: msg.client?.id || phone,
              name: msg.client?.name || phone,
              email: '',
              role: 'Client',
              status: 'online',
              whatsappNumber: msg.client?.whatsappNumber || `+${phone}`
            };

            convoMap.set(phone, {
              id: phone,
              name: msg.client?.name || phone,
              type: 'whatsapp',
              participants: [contact],
              unreadCount: 0,
              platform: 'whatsapp'
            });
          }

          const conv = convoMap.get(phone)!;
          conv.lastMessage = {
            id: msg.id,
            senderId: msg.direction === 'OUTBOUND' ? 'current-user' : conv.id,
            content: msg.body || '',
            timestamp: new Date(msg.timestamp).toISOString(),
            type: msg.mediaPath ? 'file' : 'text',
            status: (msg.status || 'SENT').toLowerCase(),
            platform: 'whatsapp'
          } as Message;
        });

        const convos = Array.from(convoMap.values()).sort((a, b) => {
          const aTime = a.lastMessage
            ? new Date(a.lastMessage.timestamp).getTime()
            : 0;
          const bTime = b.lastMessage
            ? new Date(b.lastMessage.timestamp).getTime()
            : 0;
          return bTime - aTime;
        });

        setConversations(convos);
        if (convos.length > 0) {
          setSelectedConversation(convos[0].id);
          const msgs = (data.messages || [])
            .filter((m: any) => {
              const p =
                m.direction === 'INBOUND' ? m.from : m.to;
              return p.replace(/@c\.us$/, '').replace(/\D/g, '') === convos[0].id;
            })
            .map((m: any) => ({
              id: m.id,
              senderId:
                m.direction === 'OUTBOUND' ? 'current-user' : convos[0].id,
              content: m.body || '',
              timestamp: new Date(m.timestamp).toISOString(),
              type: m.mediaPath ? 'file' : 'text',
              status: (m.status || 'SENT').toLowerCase(),
              platform: 'whatsapp'
            })) as Message[];
          setMessages(msgs);
        } else {
          setSelectedConversation(null);
          setMessages([]);
        }
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load communication data:', err);
      setIsLoading(false);
    }
  }, [selectedTab]);

  const refreshMessages = useCallback(async () => {
    if (selectedTab !== 'whatsapp') {
      await loadCommunicationData();
      return;
    }

    if (!selectedConversation) {
      await loadCommunicationData();
      return;
    }

    try {
      const resp = await fetch(
        `/api/whatsapp/history?phoneNumber=${selectedConversation}&limit=50`
      );
      if (!resp.ok) throw new Error('Failed to load history');
      const data = await resp.json();
      const msgs: Message[] = (data.messages || []).map((m: any) => ({
        id: m.id,
        senderId: m.direction === 'OUTBOUND' ? 'current-user' : selectedConversation,
        content: m.body || '',
        timestamp: new Date(m.timestamp).toISOString(),
        type: m.mediaPath ? 'file' : 'text',
        status: (m.status || 'SENT').toLowerCase(),
        platform: 'whatsapp'
      }));
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to refresh WhatsApp history:', err);
    }
  }, [selectedConversation, selectedTab, loadCommunicationData]);

  useEffect(() => {
    loadCommunicationData();
  }, [selectedTab]);

  useEffect(() => {
    refreshMessages();
  }, [selectedConversation, selectedTab, refreshMessages]);

  // CHUNK 5: Handler Functions and Helper Functions
// Copy this after the useEffect hooks

const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    if (selectedTab === 'whatsapp') {
      // Try to send WhatsApp message
      try {
        // If WhatsApp isn't ready, prompt user to connect or use fallback
        if (!whatsappStatus.isReady) {
          // Get the contact's WhatsApp number if available
          const phoneNumber = selectedConv?.participants[0]?.whatsappNumber || '+1234567890';
          
          // Create fallback URL to WhatsApp web
          const encodedMessage = encodeURIComponent(newMessage);
          const fallbackUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodedMessage}`;
          
          const openWhatsApp = confirm('WhatsApp is not connected. Use WhatsApp Web instead?');
          if (openWhatsApp) {
            window.open(fallbackUrl, '_blank');
          }
          return;
        }
        
        // Try to send through our API if connected
        const response = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: selectedConv?.participants[0]?.whatsappNumber || '+1234567890',
            message: newMessage
          })
        });
        
        // Check if response is OK
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Handle fallback scenario if API says so
        if (result.fallbackUrl) {
          const openWhatsApp = confirm('WhatsApp not connected. Open WhatsApp Web?');
          if (openWhatsApp) {
            window.open(result.fallbackUrl, '_blank');
          }
        }
      } catch (error) {
        console.error('Failed to send WhatsApp message:', error);
        alert(`Failed to send WhatsApp message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      // Internal message
      const message: Message = {
        id: `msg-${Date.now()}`,
        senderId: 'current-user',
        content: newMessage,
        timestamp: new Date().toISOString(),
        type: 'text',
        status: 'sent',
        platform: 'internal'
      };

      setMessages(prev => [...prev, message]);
    }
    
    setNewMessage('');
  };

  const getWhatsAppStatusColor = () => {
    if (whatsappStatus.isReady) return 'text-green-400';
    if (whatsappStatus.isConnecting) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getWhatsAppStatusIcon = () => {
    if (whatsappStatus.isReady) return <CheckCircle className="h-4 w-4" />;
    if (whatsappStatus.isConnecting) return <Loader2 className="h-4 w-4 animate-spin" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  const headerActions = (
    <div className="flex items-center space-x-4">
      <LanguageToggle />
      <button
        onClick={() => setShowNewChat(true)}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Chat
      </button>
    </div>
  );

  // CHUNK 6: JSX Return and Tab Navigation
// Copy this after the headerActions

return (
    <Layout 
      title="Communication" 
      subtitle="Chat and communicate with clients and team members"
      headerActions={headerActions}
    >
      <div className="h-[calc(100vh-12rem)] bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
        
        {/* TAB NAVIGATION - This should be visible! */}
        <div className="flex border-b border-white/10 bg-white/5">
          <button
            onClick={() => setSelectedTab('internal')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors flex items-center justify-center ${
              selectedTab === 'internal'
                ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-400'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Internal Chat
          </button>
          
          <button
            onClick={() => setSelectedTab('whatsapp')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors flex items-center justify-center ${
              selectedTab === 'whatsapp'
                ? 'bg-green-600/20 text-green-400 border-b-2 border-green-400'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <Smartphone className="h-5 w-5 mr-2" />
            WhatsApp
            <div className={`ml-2 ${getWhatsAppStatusColor()}`}>
              {getWhatsAppStatusIcon()}
            </div>
          </button>
        </div>

        {/* WHATSAPP STATUS BAR - Only show when WhatsApp tab is selected */}
        {selectedTab === 'whatsapp' && (
          <div className="bg-white/5 border-b border-white/10 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 ${getWhatsAppStatusColor()}`}>
                  {getWhatsAppStatusIcon()}
                  <span className="text-sm font-medium">
                    {whatsappStatus.isReady ? 'WhatsApp Connected' :
                     whatsappStatus.isConnecting ? 'Connecting to WhatsApp...' :
                     'WhatsApp Disconnected'}
                  </span>
                </div>
                {whatsappStatus.error && (
                  <span className="text-xs text-red-400">
                    {whatsappStatus.error}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {!whatsappStatus.isReady && !whatsappStatus.isConnecting && (
                  <button
                    onClick={(e) => { e.preventDefault(); initializeWhatsApp(0); }}
                    disabled={whatsappStatus.isConnecting}
                    className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Power className="h-4 w-4 mr-2" />
                    Connect WhatsApp
                  </button>
                )}
                
                {whatsappStatus.isReady && (
                  <button
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      refreshMessages();
                      checkWhatsAppStatus(0);
                    }}
                    className="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

// CHUNK 7: Main Layout and Conversations Sidebar
// Copy this after the WhatsApp status bar

        <div className="flex h-full">
          {/* Conversations Sidebar */}
          <div className="w-80 bg-white/5 border-r border-white/10 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-white/40" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {selectedTab === 'whatsapp' && filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <Smartphone className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <h3 className="text-white/60 font-medium mb-2">No WhatsApp Conversations</h3>
                  <p className="text-white/40 text-sm mb-4">
                    {whatsappStatus.isReady 
                      ? 'Start chatting with clients on WhatsApp'
                      : 'Connect WhatsApp to see conversations'
                    }
                  </p>
                  {!whatsappStatus.isReady && (
                    <button
                      onClick={(e) => { e.preventDefault(); initializeWhatsApp(0); }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center mx-auto"
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      Connect WhatsApp
                    </button>
                  )}
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${
                      selectedConversation === conversation.id ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 ${conversation.platform === 'whatsapp' ? 'bg-green-600' : 'bg-purple-600'} rounded-full flex items-center justify-center`}>
                          {conversation.platform === 'whatsapp' ? (
                            <Smartphone className="h-5 w-5 text-white" />
                          ) : conversation.type === 'case' ? (
                            <Users className="h-5 w-5 text-white" />
                          ) : (
                            <span className="text-white font-medium">
                              {conversation.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">{conversation.name}</h4>
                          {conversation.platform === 'whatsapp' && (
                            <p className="text-xs text-green-400">WhatsApp</p>
                          )}
                        </div>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className={`${conversation.platform === 'whatsapp' ? 'bg-green-600' : 'bg-purple-600'} text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center`}>
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <p className="text-sm text-white/70 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          // CHUNK 8: Chat Area Start
// Copy this after the conversations sidebar

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 ${selectedConv.platform === 'whatsapp' ? 'bg-green-600' : 'bg-purple-600'} rounded-full flex items-center justify-center`}>
                        {selectedConv.platform === 'whatsapp' ? (
                          <Smartphone className="h-5 w-5 text-white" />
                        ) : (
                          <span className="text-white font-medium">
                            {selectedConv.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-white font-medium">{selectedConv.name}</h3>
                        <p className="text-sm text-white/60">
                          {selectedConv.platform === 'whatsapp' ? 'WhatsApp Chat' : 'Internal Chat'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-white/60 hover:text-white transition-colors">
                        <Phone className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-white/60 hover:text-white transition-colors">
                        <Video className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-white/60 hover:text-white transition-colors">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isOwnMessage = message.senderId === 'current-user';
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="max-w-xs lg:max-w-md">
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwnMessage
                                ? selectedTab === 'whatsapp' 
                                  ? 'bg-green-600 text-white'
                                  : 'bg-purple-600 text-white'
                                : 'bg-white/10 text-white'
                            }`}
                          >
                            <p className="break-words">{message.content}</p>
                          </div>
                          <div className={`flex items-center mt-1 space-x-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-xs text-white/40">
                              {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            {isOwnMessage && (
                              <div className="flex items-center space-x-1">
                                <CheckCheck className="h-3 w-3 text-white/40" />
                                {selectedTab === 'whatsapp' && (
                                  <Smartphone className="h-3 w-3 text-green-400" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                // CHUNK 9: Message Input and Empty State
// Copy this after the messages section

                {/* Message Input */}
                <div className="p-4 border-t border-white/10 bg-white/5">
                  {selectedTab === 'whatsapp' && !whatsappStatus.isReady && (
                    <div className="mb-3 p-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-yellow-400">
                          WhatsApp not connected - messages will open WhatsApp Web
                        </span>
                        <button
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); initializeWhatsApp(0); }}
                          className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-white/60 hover:text-white transition-colors">
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <button className="p-2 text-white/60 hover:text-white transition-colors">
                      <Smile className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className={`text-white p-2 rounded-lg transition-colors disabled:opacity-50 ${
                        selectedTab === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // CHUNK 10: Empty State and New Chat Modal
// Copy this after the message input section

<div className="flex-1 flex items-center justify-center">
<div className="text-center">
  {selectedTab === 'whatsapp' ? (
    <Smartphone className="h-16 w-16 text-white/20 mx-auto mb-4" />
  ) : (
    <MessageSquare className="h-16 w-16 text-white/20 mx-auto mb-4" />
  )}
  <h3 className="text-lg font-medium text-white mb-2">
    {selectedTab === 'whatsapp' ? 'WhatsApp Integration' : 'Select a Conversation'}
  </h3>
  <p className="text-white/60 mb-4">
    {selectedTab === 'whatsapp' 
      ? 'Connect WhatsApp to start messaging clients'
      : 'Choose a conversation from the sidebar to start chatting'
    }
  </p>
  {selectedTab === 'whatsapp' && !whatsappStatus.isReady && (
    <button
      onClick={(e) => { e.preventDefault(); initializeWhatsApp(0); }}
      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto"
    >
      <Smartphone className="h-5 w-5 mr-2" />
      Connect WhatsApp
    </button>
  )}
</div>
</div>
)}
</div>
</div>
</div>

{/* New Chat Modal */}
{showNewChat && (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
<div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 w-full max-w-md">
<div className="flex justify-between items-center mb-4">
<h3 className="text-lg font-semibold text-white">New Chat</h3>
<button
onClick={() => setShowNewChat(false)}
className="text-white/60 hover:text-white transition-colors"
>
<X className="h-5 w-5" />
</button>
</div>

<div className="space-y-4">
<div>
<label className="block text-sm font-medium text-white/70 mb-2">
  Chat Type
</label>
<select 
  value={selectedTab}
  onChange={(e) => setSelectedTab(e.target.value as 'internal' | 'whatsapp')}
  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 mb-3"
>
  <option value="internal">Internal Chat</option>
  <option value="whatsapp" disabled={!whatsappStatus.isReady}>
    WhatsApp {!whatsappStatus.isReady ? '(Not Connected)' : ''}
  </option>
</select>
</div>

<div>
<label className="block text-sm font-medium text-white/70 mb-2">
  Select Contact
</label>
<select
  value={selectedContactId}
  onChange={(e) => setSelectedContactId(e.target.value)}
  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
>
  <option value="">Choose a contact...</option>
  {contacts.map((contact) => (
    <option key={contact.id} value={contact.id}>
      {contact.name}
      {selectedTab === 'whatsapp' && contact.whatsappNumber && ` - ${contact.whatsappNumber}`}
    </option>
  ))}
</select>
</div>

<div className="flex justify-end space-x-3">
<button
  onClick={() => setShowNewChat(false)}
  className="px-4 py-2 text-white/70 hover:text-white transition-colors"
>
  Cancel
</button>
<button
  onClick={async () => {
    const contact = contacts.find(c => c.id === selectedContactId);
    if (!contact) return;
    const phone = (contact.whatsappNumber || '').replace(/\D/g, '');
    const convExists = conversations.some(c => c.id === phone);
    if (!convExists) {
      const newConv: Conversation = {
        id: phone,
        name: contact.name || phone,
        type: 'whatsapp',
        participants: [contact],
        unreadCount: 0,
        platform: 'whatsapp'
      };
      setConversations(prev => [newConv, ...prev]);
    }
    setSelectedConversation(phone);
    setShowNewChat(false);
    try {
      const resp = await fetch(`/api/whatsapp/history?phoneNumber=${phone}&limit=50`);
      if (resp.ok) {
        const data = await resp.json();
        const msgs: Message[] = (data.messages || []).map((m: any) => ({
          id: m.id,
          senderId: m.direction === 'OUTBOUND' ? 'current-user' : phone,
          content: m.body || '',
          timestamp: new Date(m.timestamp).toISOString(),
          type: m.mediaPath ? 'file' : 'text',
          status: (m.status || 'SENT').toLowerCase(),
          platform: 'whatsapp'
        }));
        setMessages(msgs);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to load history for new chat', err);
      setMessages([]);
    }
  }}
  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
  disabled={!selectedContactId}
>
  Start Chat
</button>
</div>
</div>
</div>
</div>
)}
</Layout>
);
}
// API client utilities for the legal case management system

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Client {
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

export interface Case {
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

export interface TimeEntry {
  id: string;
  description: string;
  hours: number;
  hourlyRate?: number;
  isBillable: boolean;
  date: string;
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

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  completedAt?: string;
  case: {
    id: string;
    title: string;
    caseNumber: string;
    client: {
      name: string;
    };
  };
  assignedTo: {
    firstName: string;
    lastName: string;
  };
}

export interface WhatsAppMessage {
  id: string;
  twilioSid?: string;
  from: string;
  to: string;
  body?: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  messageType: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'VIDEO';
  mediaPath?: string;
  mediaType?: string;
  timestamp: string;
  clientId?: string;
  caseId?: string;
  client?: {
    id: string;
    name: string;
    whatsappNumber?: string;
  };
  case?: {
    id: string;
    title: string;
    caseNumber: string;
  };
}

export interface WhatsAppStatus {
  isReady: boolean;
  isConnecting: boolean;
  qrCode?: string;
  error?: string;
  clientInfo?: any;
  lastConnected?: Date;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  fallbackUrl?: string;
}



// Custom error class for authentication errors
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        
        // Throw AuthenticationError for 401 responses
        if (response.status === 401) {
          throw new AuthenticationError(errorMessage);
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      // Don't log authentication errors as they're expected when not logged in
      if (!(error instanceof AuthenticationError)) {
        console.error(`API request failed: ${endpoint}`, error);
      }
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<void> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request('/auth/me');
  }

  // Clients
  async getClients(params?: {
    search?: string;
    status?: string;
    type?: string;
  }): Promise<{ clients: Client[] }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.type) searchParams.set('type', params.type);

    const query = searchParams.toString();
    return this.request(`/auth/clients${query ? `?${query}` : ''}`);
  }

  async getClient(id: string): Promise<{ client: Client }> {
    return this.request(`/auth/clients/${id}`);
  }

  async createClient(data: Partial<Client>): Promise<{ client: Client }> {
    return this.request('/auth/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(id: string, data: Partial<Client>): Promise<{ client: Client }> {
    return this.request(`/auth/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id: string): Promise<void> {
    return this.request(`/auth/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Cases
  async getCases(params?: {
    search?: string;
    status?: string;
    type?: string;
  }): Promise<{ cases: Case[] }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.type) searchParams.set('type', params.type);

    const query = searchParams.toString();
    return this.request(`/auth/cases${query ? `?${query}` : ''}`);
  }

  async getCase(id: string): Promise<{ case: Case }> {
    return this.request(`/auth/cases/${id}`);
  }

  async createCase(data: Partial<Case>): Promise<{ case: Case }> {
    return this.request('/auth/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCase(id: string, data: Partial<Case>): Promise<{ case: Case }> {
    return this.request(`/auth/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCase(id: string): Promise<void> {
    return this.request(`/auth/cases/${id}`, {
      method: 'DELETE',
    });
  }

  // Time Entries
  async getTimeEntries(params?: {
    caseId?: string;
    userId?: string;
  }): Promise<{ timeEntries: TimeEntry[]; summary: any }> {
    const searchParams = new URLSearchParams();
    if (params?.caseId) searchParams.set('caseId', params.caseId);
    if (params?.userId) searchParams.set('userId', params.userId);

    const query = searchParams.toString();
    return this.request(`/time-entries${query ? `?${query}` : ''}`);
  }

  async createTimeEntry(data: {
    description: string;
    hours: number;
    hourlyRate?: number;
    isBillable?: boolean;
    caseId: string;
    date?: string;
  }): Promise<{ timeEntry: TimeEntry }> {
    return this.request('/time-entries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Tasks
  async getTasks(params?: {
    caseId?: string;
    status?: string;
    assignedToId?: string;
  }): Promise<{ tasks: Task[] }> {
    const searchParams = new URLSearchParams();
    if (params?.caseId) searchParams.set('caseId', params.caseId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.assignedToId) searchParams.set('assignedToId', params.assignedToId);

    const query = searchParams.toString();
    return this.request(`/tasks${query ? `?${query}` : ''}`);
  }

  async createTask(data: {
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    caseId: string;
    assignedToId: string;
  }): Promise<{ task: Task }> {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics
  async getDashboardAnalytics(): Promise<{ dashboard: any }> {
    return this.request('/analytics/dashboard');
  }
  // WhatsApp Status Management
  async getWhatsAppStatus(): Promise<WhatsAppStatus> {
    return this.request('/whatsapp/status');
  }

  async initializeWhatsApp(): Promise<{ success: boolean; message?: string }> {
    return this.request('/whatsapp/status', {
      method: 'POST',
    });
  }

  async restartWhatsApp(): Promise<{ success: boolean; message?: string }> {
    return this.request('/whatsapp/restart', {
      method: 'POST',
    });
  }

  async disconnectWhatsApp(): Promise<{ success: boolean }> {
    return this.request('/whatsapp/disconnect', {
      method: 'POST',
    });
  }

  // WhatsApp Messaging
  async sendWhatsAppMessage(data: {
    phoneNumber: string;
    message: string;
    clientId?: string;
    caseId?: string;
    mediaPath?: string;
  }): Promise<WhatsAppSendResult> {
    return this.request('/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWhatsAppMessages(params?: {
    clientId?: string;
    caseId?: string;
    phoneNumber?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ messages: WhatsAppMessage[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.clientId) searchParams.set('clientId', params.clientId);
    if (params?.caseId) searchParams.set('caseId', params.caseId);
    if (params?.phoneNumber) searchParams.set('phoneNumber', params.phoneNumber);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const query = searchParams.toString();
    return this.request(`/whatsapp/messages${query ? `?${query}` : ''}`);
  }

  async getWhatsAppHistory(phoneNumber: string, limit = 50): Promise<{ messages: WhatsAppMessage[] }> {
    return this.request(`/whatsapp/history?phoneNumber=${phoneNumber}&limit=${limit}`);
  }

  async updateWhatsAppMessageStatus(messageId: string, status: WhatsAppMessage['status']): Promise<{ success: boolean }> {
    return this.request('/whatsapp/messages/status', {
      method: 'PUT',
      body: JSON.stringify({ messageId, status }),
    });
  }

  // Client methods with WhatsApp support
  async updateClientWhatsApp(clientId: string, data: {
    whatsappNumber?: string;
    whatsappOptIn?: boolean;
  }): Promise<{ client: Client }> {
    return this.request(`/auth/clients/${clientId}/whatsapp`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async findClientByWhatsApp(phoneNumber: string): Promise<{ client: Client | null }> {
    return this.request(`/auth/clients/whatsapp/${encodeURIComponent(phoneNumber)}`);
  }

  // WhatsApp Analytics
  async getWhatsAppAnalytics(params?: {
    clientId?: string;
    caseId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalMessages: number;
    inboundMessages: number;
    outboundMessages: number;
    responseRate: number;
    averageResponseTime: number;
    messagesByDay: Array<{ date: string; count: number }>;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.clientId) searchParams.set('clientId', params.clientId);
    if (params?.caseId) searchParams.set('caseId', params.caseId);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);

    const query = searchParams.toString();
    return this.request(`/whatsapp/analytics${query ? `?${query}` : ''}`);
  }

  // WhatsApp Templates (for future use)
  async getWhatsAppTemplates(): Promise<{ templates: Array<{
    id: string;
    name: string;
    content: string;
    category: string;
    language: string;
  }> }> {
    return this.request('/whatsapp/templates');
  }

  async sendWhatsAppTemplate(data: {
    phoneNumber: string;
    templateId: string;
    parameters?: string[];
    clientId?: string;
    caseId?: string;
  }): Promise<WhatsAppSendResult> {
    return this.request('/whatsapp/send-template', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }


}

export const apiClient = new ApiClient();



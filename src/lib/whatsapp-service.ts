// Create this file: src/lib/whatsapp-service.ts

import { Client, LocalAuth, MessageMedia, Message } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import fs from 'fs-extra';
import path from 'path';

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: number;
  type: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'VIDEO';
  direction: 'INBOUND' | 'OUTBOUND';
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  mediaPath?: string;
  mediaType?: string;
  clientId?: string;
  caseId?: string;
}

export interface WhatsAppStatus {
  isReady: boolean;
  isConnecting: boolean;
  qrCode?: string;
  error?: string;
  clientInfo?: any;
  lastConnected?: Date;
}

class WhatsAppWebService {
  private client: Client | null = null;
  private status: WhatsAppStatus = { isReady: false, isConnecting: false };
  private messageHandlers: ((message: WhatsAppMessage) => void)[] = [];
  private statusHandlers: ((status: WhatsAppStatus) => void)[] = [];

  constructor() {
    // Don't auto-initialize to allow manual control
    console.log('WhatsApp Service initialized');
  }

  async initialize() {
    if (this.client) {
      console.log('WhatsApp client already exists, destroying first...');
      await this.client.destroy();
    }

    try {
      this.updateStatus({ isConnecting: true, error: undefined });
      console.log('Initializing WhatsApp client...');

      // Ensure auth directory exists
      const authPath = path.join(process.cwd(), '.wwebjs_auth');
      await fs.ensureDir(authPath);

      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: 'legal-case-pro',
          dataPath: authPath
        }),
        puppeteer: {
          headless: process.env.NODE_ENV === 'production',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        }
      });

      this.setupEventHandlers();
      await this.client.initialize();
      
      console.log('WhatsApp client initialization started');
    } catch (error) {
      console.error('WhatsApp initialization error:', error);
      this.updateStatus({ 
        isReady: false, 
        isConnecting: false, 
        error: `Initialization failed: ${error.message}` 
      });
    }
  }

  private setupEventHandlers() {
    if (!this.client) return;

    // QR Code generation
    this.client.on('qr', async (qr) => {
      try {
        console.log('WhatsApp QR Code generated');
        const qrCodeDataUrl = await QRCode.toDataURL(qr, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        this.updateStatus({ 
          isConnecting: true, 
          qrCode: qrCodeDataUrl,
          error: undefined 
        });
        console.log('QR Code ready for scanning');
      } catch (error) {
        console.error('QR Code generation error:', error);
      }
    });

    // Client ready
    this.client.on('ready', async () => {
      console.log('WhatsApp Client is ready!');
      
      try {
        const clientInfo = this.client?.info;
        this.updateStatus({ 
          isReady: true, 
          isConnecting: false, 
          qrCode: undefined,
          error: undefined,
          lastConnected: new Date(),
          clientInfo
        });
        console.log('WhatsApp connected successfully:', clientInfo?.wid?.user);
      } catch (error) {
        console.error('Error getting client info:', error);
        this.updateStatus({ 
          isReady: true, 
          isConnecting: false, 
          qrCode: undefined,
          error: undefined,
          lastConnected: new Date()
        });
      }
    });

    // Authentication success
    this.client.on('authenticated', () => {
      console.log('WhatsApp authenticated successfully');
      this.updateStatus({ 
        isConnecting: true, 
        qrCode: undefined,
        error: undefined 
      });
    });

    // Authentication failure
    this.client.on('auth_failure', (msg) => {
      console.error('WhatsApp authentication failed:', msg);
      this.updateStatus({ 
        isReady: false, 
        isConnecting: false, 
        error: 'Authentication failed. Please scan QR code again.' 
      });
    });

    // Disconnection
    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp disconnected:', reason);
      this.updateStatus({ 
        isReady: false, 
        isConnecting: false, 
        error: `Disconnected: ${reason}` 
      });
    });

    // Incoming messages
    this.client.on('message', async (message) => {
      console.log('New message received:', message.body);
      await this.handleIncomingMessage(message);
    });
  }

  private updateStatus(newStatus: Partial<WhatsAppStatus>) {
    this.status = { ...this.status, ...newStatus };
    console.log('Status updated:', this.status);
    this.statusHandlers.forEach(handler => {
      try {
        handler(this.status);
      } catch (error) {
        console.error('Status handler error:', error);
      }
    });
  }

  private async handleIncomingMessage(message: Message) {
    try {
      const phoneNumber = message.from.replace('@c.us', '').replace(/\D/g, '');
      
      const messageData: WhatsAppMessage = {
        id: message.id._serialized,
        from: message.from,
        to: message.to,
        body: message.body,
        timestamp: message.timestamp * 1000,
        type: 'TEXT',
        direction: 'INBOUND',
        status: 'READ' as const
      };

      console.log('Processing incoming message:', {
        from: phoneNumber,
        body: message.body
      });

      // Notify handlers
      this.messageHandlers.forEach(handler => {
        try {
          handler(messageData);
        } catch (error) {
          console.error('Message handler error:', error);
        }
      });
    } catch (error) {
      console.error('Handle incoming message error:', error);
    }
  }

  async sendMessage(phoneNumber: string, message: string, options?: {
    caseId?: string;
    clientId?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string; fallbackUrl?: string }> {
    if (!this.client || !this.status.isReady) {
      const fallbackUrl = `https://wa.me/${this.formatPhoneNumber(phoneNumber, false)}?text=${encodeURIComponent(message)}`;
      return { 
        success: false, 
        error: 'WhatsApp not connected', 
        fallbackUrl 
      };
    }

    try {
      const chatId = this.formatPhoneNumber(phoneNumber);
      const sentMessage = await this.client.sendMessage(chatId, message);

      console.log('Message sent successfully:', {
        to: phoneNumber,
        messageId: sentMessage.id._serialized
      });

      return {
        success: true,
        messageId: sentMessage.id._serialized
      };
    } catch (error) {
      console.error('Send message error:', error);
      const fallbackUrl = `https://wa.me/${this.formatPhoneNumber(phoneNumber, false)}?text=${encodeURIComponent(message)}`;
      return { 
        success: false, 
        error: error.message, 
        fallbackUrl 
      };
    }
  }

  private formatPhoneNumber(phoneNumber: string, withSuffix = true): string {
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle different country codes and formats
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    if (!cleaned.startsWith('1') && cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }
    
    return withSuffix ? cleaned + '@c.us' : cleaned;
  }

  // Public methods for frontend
  getStatus(): WhatsAppStatus {
    return { ...this.status };
  }

  onMessage(handler: (message: WhatsAppMessage) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  onStatusChange(handler: (status: WhatsAppStatus) => void): () => void {
    this.statusHandlers.push(handler);
    return () => {
      const index = this.statusHandlers.indexOf(handler);
      if (index > -1) {
        this.statusHandlers.splice(index, 1);
      }
    };
  }

  async restart(): Promise<void> {
    try {
      if (this.client) {
        await this.client.destroy();
      }
      await this.initialize();
    } catch (error) {
      console.error('Restart error:', error);
      this.updateStatus({ 
        error: `Restart failed: ${error.message}` 
      });
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.destroy();
        this.client = null;
      }
      this.updateStatus({ 
        isReady: false, 
        isConnecting: false,
        qrCode: undefined,
        error: undefined 
      });
      console.log('WhatsApp disconnected successfully');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }
}

// Create singleton instance
let whatsappService: WhatsAppWebService | null = null;

export function getWhatsAppService(): WhatsAppWebService {
  if (!whatsappService) {
    whatsappService = new WhatsAppWebService();
  }
  return whatsappService;
}

export default WhatsAppWebService;
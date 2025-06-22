// QUICK FIX: Create these API route files to stop the 404 errors
// You can copy each section into the respective file

// =============================================================================
// FILE: pages/api/whatsapp/status.ts
// =============================================================================
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Return a mock status for now
      const mockStatus = {
        isReady: false,
        isConnecting: false,
        qrCode: undefined,
        error: undefined,
        clientInfo: undefined,
        lastConnected: undefined
      };
      
      res.status(200).json(mockStatus);
    } catch (error) {
      console.error('Get WhatsApp status error:', error);
      res.status(500).json({ error: 'Failed to get WhatsApp status' });
    }
  } else if (req.method === 'POST') {
    try {
      // Mock initialization
      res.status(200).json({ 
        success: true, 
        message: 'WhatsApp service initialization started (demo mode)' 
      });
    } catch (error) {
      console.error('Initialize WhatsApp error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to initialize WhatsApp service' 
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// =============================================================================
// FILE: pages/api/whatsapp/send.ts
// =============================================================================
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, message, mediaPath, caseId, clientId } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }

    // Mock send - provide fallback URL for WhatsApp Web
    const fallbackUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    
    res.status(200).json({
      success: false,
      error: 'WhatsApp service not yet configured',
      fallbackUrl: fallbackUrl
    });
  } catch (error) {
    console.error('WhatsApp send error:', error);
    const fallbackUrl = `https://wa.me/${req.body.phoneNumber?.replace(/\D/g, '')}?text=${encodeURIComponent(req.body.message || '')}`;
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send WhatsApp message',
      fallbackUrl
    });
  }
}

// =============================================================================
// FILE: pages/api/whatsapp/messages.ts
// =============================================================================
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Return mock empty messages
      res.status(200).json({ 
        messages: [], 
        total: 0 
      });
    } catch (error) {
      console.error('Get WhatsApp messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// =============================================================================
// FILE: pages/api/whatsapp/history.ts
// =============================================================================
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, limit = '50' } = req.query;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Return mock empty history
    res.status(200).json({ messages: [] });
  } catch (error) {
    console.error('Get WhatsApp history error:', error);
    res.status(500).json({ error: 'Failed to get WhatsApp history' });
  }
}

// =============================================================================
// FILE: pages/api/whatsapp/restart.ts
// =============================================================================
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    res.status(200).json({ 
      success: true, 
      message: 'WhatsApp service restart initiated (demo mode)' 
    });
  } catch (error) {
    console.error('Restart WhatsApp error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to restart WhatsApp service' 
    });
  }
}

// =============================================================================
// FILE: pages/api/whatsapp/disconnect.ts
// =============================================================================
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    res.status(200).json({ 
      success: true, 
      message: 'WhatsApp service disconnected (demo mode)' 
    });
  } catch (error) {
    console.error('Disconnect WhatsApp error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to disconnect WhatsApp service' 
    });
  }
}

// =============================================================================
// FILE: pages/api/whatsapp/analytics.ts
// =============================================================================
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return mock analytics
    res.status(200).json({
      totalMessages: 0,
      inboundMessages: 0,
      outboundMessages: 0,
      responseRate: 0,
      averageResponseTime: 0,
      messagesByDay: []
    });
  } catch (error) {
    console.error('Get WhatsApp analytics error:', error);
    res.status(500).json({ error: 'Failed to get WhatsApp analytics' });
  }
}
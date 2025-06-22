// 5. pages/api/whatsapp/history.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getWhatsAppService } from '../../../lib/whatsapp-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, limit = '50' } = req.query;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const whatsappService = getWhatsAppService();
    const messages = await whatsappService.getChatHistory(phoneNumber as string, parseInt(limit as string));
    
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Get WhatsApp history error:', error);
    res.status(500).json({ error: 'Failed to get WhatsApp history' });
  }
}
// 2. pages/api/whatsapp/send.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getWhatsAppService } from '../../../lib/whatsapp-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, message, mediaPath, caseId, clientId } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }

    const whatsappService = getWhatsAppService();
    
    let result;
    if (mediaPath) {
      result = await whatsappService.sendMedia(phoneNumber, mediaPath, message, { caseId, clientId });
    } else {
      result = await whatsappService.sendMessage(phoneNumber, message, { caseId, clientId });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('WhatsApp send error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send WhatsApp message',
      fallbackUrl: `https://wa.me/${req.body.phoneNumber?.replace(/\D/g, '')}?text=${encodeURIComponent(req.body.message || '')}`
    });
  }
}
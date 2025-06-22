// Update your pages/api/whatsapp/send.ts file with this:

import { NextApiRequest, NextApiResponse } from 'next';
import { getWhatsAppService } from '../../../src/lib/whatsapp-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, message, caseId, clientId } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }

    const whatsappService = getWhatsAppService();
    const result = await whatsappService.sendMessage(phoneNumber, message, { caseId, clientId });

    res.status(200).json(result);
  } catch (error) {
    console.error('WhatsApp send error:', error);
    const cleanedPhone = req.body.phoneNumber?.replace(/\D/g, '') || '';
    const fallbackUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(req.body.message || '')}`;
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send WhatsApp message',
      fallbackUrl
    });
  }
}
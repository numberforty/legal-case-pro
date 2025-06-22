// 6. pages/api/whatsapp/restart.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getWhatsAppService } from '../../../lib/whatsapp-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const whatsappService = getWhatsAppService();
    await whatsappService.restart();
    res.status(200).json({ success: true, message: 'WhatsApp service restarted' });
  } catch (error) {
    console.error('Restart WhatsApp error:', error);
    res.status(500).json({ success: false, error: 'Failed to restart WhatsApp service' });
  }
}

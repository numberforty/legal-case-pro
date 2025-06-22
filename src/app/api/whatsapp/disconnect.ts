// 7. pages/api/whatsapp/disconnect.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getWhatsAppService } from '../../../lib/whatsapp-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const whatsappService = getWhatsAppService();
    await whatsappService.disconnect();
    res.status(200).json({ success: true, message: 'WhatsApp service disconnected' });
  } catch (error) {
    console.error('Disconnect WhatsApp error:', error);
    res.status(500).json({ success: false, error: 'Failed to disconnect WhatsApp service' });
  }
}
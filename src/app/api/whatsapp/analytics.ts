// 8. pages/api/whatsapp/analytics.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getWhatsAppService } from '../../../lib/whatsapp-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { clientId, caseId, startDate, endDate } = req.query;
    
    const params: any = {};
    if (clientId) params.clientId = clientId as string;
    if (caseId) params.caseId = caseId as string;
    if (startDate) params.startDate = new Date(startDate as string);
    if (endDate) params.endDate = new Date(endDate as string);

    const whatsappService = getWhatsAppService();
    const analytics = await whatsappService.getMessageAnalytics(params);
    
    res.status(200).json(analytics);
  } catch (error) {
    console.error('Get WhatsApp analytics error:', error);
    res.status(500).json({ error: 'Failed to get WhatsApp analytics' });
  }
}
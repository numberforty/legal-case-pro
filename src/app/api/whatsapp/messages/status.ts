// 4. pages/api/whatsapp/messages/status.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messageId, status } = req.body;
    
    if (!messageId || !status) {
      return res.status(400).json({ error: 'Message ID and status are required' });
    }

    await prisma.whatsAppMessage.update({
      where: { id: messageId },
      data: { status }
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Update WhatsApp message status error:', error);
    res.status(500).json({ error: 'Failed to update message status' });
  }
}
// 3. pages/api/whatsapp/messages.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getWhatsAppService } from '../../../lib/whatsapp-service';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { phoneNumber, clientId, caseId, limit = '50', offset = '0' } = req.query;
      
      const where: any = {};
      
      if (phoneNumber) {
        const cleanedPhone = (phoneNumber as string).replace(/\D/g, '');
        where.OR = [
          { from: { contains: cleanedPhone } },
          { to: { contains: cleanedPhone } }
        ];
      }
      
      if (clientId) where.clientId = clientId as string;
      if (caseId) where.caseId = caseId as string;

      const [messages, total] = await Promise.all([
        prisma.whatsAppMessage.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          take: parseInt(limit as string),
          skip: parseInt(offset as string),
          include: {
            client: {
              select: { id: true, name: true, whatsappNumber: true }
            },
            case: {
              select: { id: true, title: true, caseNumber: true }
            }
          }
        }),
        prisma.whatsAppMessage.count({ where })
      ]);

      const formattedMessages = messages.reverse().map(msg => ({
        id: msg.id,
        from: msg.from,
        to: msg.to,
        body: msg.body,
        timestamp: msg.timestamp.getTime(),
        type: msg.messageType,
        direction: msg.direction,
        status: msg.status,
        mediaPath: msg.mediaPath,
        mediaType: msg.mediaType,
        clientId: msg.clientId,
        caseId: msg.caseId,
        client: msg.client,
        case: msg.case
      }));

      res.status(200).json({ messages: formattedMessages, total });
    } catch (error) {
      console.error('Get WhatsApp messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  } else if (req.method === 'POST') {
    try {
      // Save a new message to database (called by WhatsApp service)
      const messageData = req.body;
      
      await prisma.whatsAppMessage.create({
        data: {
          id: messageData.id,
          from: messageData.from,
          to: messageData.to,
          body: messageData.body || '',
          direction: messageData.direction,
          status: messageData.status,
          messageType: messageData.type,
          mediaPath: messageData.mediaPath,
          mediaType: messageData.mediaType,
          timestamp: new Date(messageData.timestamp),
          clientId: messageData.clientId,
          caseId: messageData.caseId,
        }
      });
      
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Save WhatsApp message error:', error);
      res.status(500).json({ error: 'Failed to save message' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
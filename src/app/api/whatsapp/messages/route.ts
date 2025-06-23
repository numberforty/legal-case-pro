import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppService } from '@/lib/whatsapp-service';
import { authenticateRequest } from '@/lib/edge-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');
    const clientId = searchParams.get('clientId');
    const caseId = searchParams.get('caseId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: any = {};
    if (phoneNumber) {
      const cleaned = phoneNumber.replace(/\D/g, '');
      where.OR = [
        { from: { contains: cleaned } },
        { to: { contains: cleaned } }
      ];
    }
    if (clientId) where.clientId = clientId;
    if (caseId) where.caseId = caseId;

    const [messages, total] = await Promise.all([
      prisma.whatsAppMessage.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
        include: {
          client: { select: { id: true, name: true, whatsappNumber: true } },
          case: { select: { id: true, title: true, caseNumber: true } }
        }
      }),
      prisma.whatsAppMessage.count({ where })
    ]);

    const formatted = messages.reverse().map(msg => ({
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

    return NextResponse.json({ messages: formatted, total });
  } catch (error) {
    console.error('Get WhatsApp messages error:', error);
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    const messageData = await request.json();
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
        caseId: messageData.caseId
      }
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Save WhatsApp message error:', error);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}

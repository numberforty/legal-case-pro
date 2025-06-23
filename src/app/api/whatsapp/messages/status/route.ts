import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/edge-auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    const { messageId, status } = await request.json();
    if (!messageId || !status) {
      return NextResponse.json({ error: 'Message ID and status are required' }, { status: 400 });
    }

    await prisma.whatsAppMessage.update({
      where: { id: messageId },
      data: { status }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update WhatsApp message status error:', error);
    return NextResponse.json({ error: 'Failed to update message status' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
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

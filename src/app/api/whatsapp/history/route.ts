import { NextResponse } from 'next/server';
import { getWhatsAppService } from '@/lib/whatsapp-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const whatsappService = getWhatsAppService();
    const messages = await whatsappService.getChatHistory(phoneNumber, limit);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get WhatsApp history error:', error);
    return NextResponse.json({ error: 'Failed to get WhatsApp history' }, { status: 500 });
  }
}

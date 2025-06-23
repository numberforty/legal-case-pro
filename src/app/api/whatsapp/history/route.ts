import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppService } from '@/lib/whatsapp-service';
import { authenticateRequest } from '@/lib/edge-auth';

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

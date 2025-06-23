import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppService } from '@/lib/whatsapp-service';
import { authenticateRequest } from '@/lib/edge-auth';

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    const whatsappService = getWhatsAppService();
    await whatsappService.restart();
    return NextResponse.json({ success: true, message: 'WhatsApp service restarted' });
  } catch (error) {
    console.error('Restart WhatsApp error:', error);
    return NextResponse.json({ success: false, error: 'Failed to restart WhatsApp service' }, { status: 500 });
  }
}

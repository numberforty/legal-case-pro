import { NextResponse } from 'next/server';
import { getWhatsAppService } from '@/lib/whatsapp-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, message, caseId, clientId } = body;

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    const whatsappService = getWhatsAppService();
    const result = await whatsappService.sendMessage(phoneNumber, message, {
      caseId,
      clientId
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('WhatsApp send error:', error);
    const fallbackUrl = `https://wa.me/${body?.phoneNumber?.replace(/\D/g, '')}?text=${encodeURIComponent(body?.message || '')}`;
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send WhatsApp message',
        fallbackUrl 
      },
      { status: 500 }
    );
  }
}

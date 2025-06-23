import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppService } from '@/lib/whatsapp-service';
import { authenticateRequest } from '@/lib/edge-auth';

export async function POST(request: NextRequest) {
  let body: {
    phoneNumber?: string;
    message?: string;
    caseId?: string;
    clientId?: string;
  } | undefined;
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    body = await request.json();
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
    const fallbackUrl = body?.phoneNumber
      ? `https://wa.me/${body.phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(body.message || '')}`
      : undefined;
    
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

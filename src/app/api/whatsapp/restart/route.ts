import { NextResponse } from 'next/server';
import { getWhatsAppService } from '@/lib/whatsapp-service';

export async function POST() {
  try {
    const whatsappService = getWhatsAppService();
    await whatsappService.restart();
    return NextResponse.json({ success: true, message: 'WhatsApp service restarted' });
  } catch (error) {
    console.error('Restart WhatsApp error:', error);
    return NextResponse.json({ success: false, error: 'Failed to restart WhatsApp service' }, { status: 500 });
  }
}

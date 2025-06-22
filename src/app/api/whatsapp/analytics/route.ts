import { NextResponse } from 'next/server';
import { getWhatsAppService } from '@/lib/whatsapp-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId') || undefined;
    const caseId = searchParams.get('caseId') || undefined;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const params: {
      clientId?: string;
      caseId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {};
    if (clientId) params.clientId = clientId;
    if (caseId) params.caseId = caseId;
    if (startDate) params.startDate = new Date(startDate);
    if (endDate) params.endDate = new Date(endDate);

    const whatsappService = getWhatsAppService();
    const analytics = await whatsappService.getMessageAnalytics(params);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Get WhatsApp analytics error:', error);
    return NextResponse.json({ error: 'Failed to get WhatsApp analytics' }, { status: 500 });
  }
}

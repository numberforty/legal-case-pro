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

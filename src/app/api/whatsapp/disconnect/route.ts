import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppService } from '@/lib/whatsapp-service';
import { authenticateRequest } from '@/lib/edge-auth';

// POST handler for disconnecting WhatsApp
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
    
    // Important fix: Use setTimeout to avoid waiting for complete disconnection
    // This prevents the protocol error by handling the disconnect in the background
    setTimeout(() => {
      whatsappService.disconnect().catch(err => {
        console.error('Background WhatsApp disconnect failed:', err);
      });
    }, 100);
    
    return NextResponse.json({ 
      success: true, 
      message: 'WhatsApp service disconnect initiated'
    });
  } catch (error) {
    console.error('Disconnect WhatsApp error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect WhatsApp service' },
      { status: 500 }
    );
  }
}

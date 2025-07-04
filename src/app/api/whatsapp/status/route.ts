import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppService } from '@/lib/whatsapp-service';
import { authenticateRequest } from '@/lib/edge-auth';

// GET handler for retrieving WhatsApp status
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    const whatsappService = getWhatsAppService();
    const status = whatsappService.getStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Get WhatsApp status error:', error);
    return NextResponse.json(
      { error: 'Failed to get WhatsApp status' },
      { status: 500 }
    );
  }
}

// POST handler for initializing WhatsApp
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
    
    // Start initialization process without awaiting - critical fix for protocol error
    // By not awaiting, we avoid the Turbopack protocol error during browser automation
    setTimeout(() => {
      whatsappService.initialize().catch(err => {
        console.error("Background WhatsApp initialization failed:", err);
      });
    }, 100);
    
    return NextResponse.json({
      success: true,
      message: 'WhatsApp service initialization started'
    });
  } catch (error) {
    console.error('Initialize WhatsApp error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize WhatsApp service' },
      { status: 500 }
    );
  }
}

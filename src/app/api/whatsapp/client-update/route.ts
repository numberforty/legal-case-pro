// API route to update client WhatsApp information
// src/app/api/whatsapp/client-update/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/edge-auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { clientId, whatsappNumber, whatsappOptIn } = data;
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Update client WhatsApp information
    const client = await prisma.client.update({
      where: {
        id: clientId
      },
      data: {
        ...(whatsappNumber !== undefined && { whatsappNumber }),
        ...(whatsappOptIn !== undefined && { whatsappOptIn })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsappNumber: true,
        whatsappOptIn: true,
        company: true
      }
    });

    return NextResponse.json({ client });
  } catch (error) {
    console.error('Error updating client WhatsApp information:', error);
    return NextResponse.json(
      { error: 'Failed to update client WhatsApp information' },
      { status: 500 }
    );
  }
}

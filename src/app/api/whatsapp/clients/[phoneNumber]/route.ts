// API route to find a client by WhatsApp number
// src/app/api/whatsapp/clients/[phoneNumber]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateRequest } from '@/lib/edge-auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { phoneNumber: string } }
) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { phoneNumber } = params;
    
    // Format phone number by removing special characters
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    
    // Find client with matching WhatsApp number
    const client = await prisma.client.findFirst({
      where: {
        whatsappNumber: {
          contains: formattedNumber
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsappNumber: true,
        whatsappOptIn: true,
        company: true,
        type: true,
        status: true,
      }
    });

    if (!client) {
      return NextResponse.json(
        { client: null },
        { status: 404 }
      );
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error('Error finding client by WhatsApp number:', error);
    return NextResponse.json(
      { error: 'Failed to find client' },
      { status: 500 }
    );
  }
}

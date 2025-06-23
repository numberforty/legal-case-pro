import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/edge-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request if utility is available
    const authResult = await authenticateRequest(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { whatsappNumber: { not: null } },
          { whatsappOptIn: true }
        ]
      },
      select: {
        id: true,
        name: true,
        whatsappNumber: true
      }
    });

    return NextResponse.json({ clients });
  } catch (error) {
    console.error('Error retrieving WhatsApp clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

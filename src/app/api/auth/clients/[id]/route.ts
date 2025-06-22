import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        cases: {
          include: {
            assignedTo: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            cases: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Calculate total billed amount
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        case: {
          clientId: client.id,
        },
        isBillable: true,
      },
    });

    const totalBilled = timeEntries.reduce(
      (sum, entry) => sum + (entry.hours * (entry.hourlyRate || 0)),
      0
    );

    const clientWithMetrics = {
      ...client,
      activeCases: client.cases.filter(c => c.status === 'ACTIVE').length,
      totalCases: client._count.cases,
      totalBilled,
    };

    return NextResponse.json({ client: clientWithMetrics });
  } catch (error) {
    console.error('Get client error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const data = await request.json();
    const {
      name,
      email,
      phone,
      company,
      address,
      type,
      priority,
      status,
      notes,
    } = data;

    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        name,
        email: email?.toLowerCase(),
        phone,
        company,
        address,
        type: type?.toUpperCase(),
        priority: priority?.toUpperCase(),
        status: status?.toUpperCase(),
        notes,
        lastContact: new Date(),
      },
    });

    return NextResponse.json({ client });
  } catch (error) {
    console.error('Update client error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if client has active cases
    const activeCases = await prisma.case.count({
      where: {
        clientId: params.id,
        status: { in: ['ACTIVE', 'REVIEW', 'DISCOVERY', 'TRIAL'] },
      },
    });

    if (activeCases > 0) {
      return NextResponse.json(
        { error: 'Cannot delete client with active cases' },
        { status: 400 }
      );
    }

    await prisma.client.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
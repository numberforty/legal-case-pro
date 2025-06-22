import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
    }

    if (type && type !== 'all') {
      whereClause.type = type.toUpperCase();
    }

    const clients = await prisma.client.findMany({
      where: whereClause,
      include: {
        cases: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: {
            cases: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate additional metrics for each client
    const clientsWithMetrics = clients.map(client => ({
      ...client,
      activeCases: client.cases.filter(c => c.status === 'ACTIVE').length,
      totalCases: client._count.cases,
    }));

    return NextResponse.json({ clients: clientsWithMetrics });
  } catch (error) {
    console.error('Get clients error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
      priority = 'MEDIUM',
      notes,
    } = data;

    if (!name || !email || !type) {
      return NextResponse.json(
        { error: 'Name, email, and type are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'Client with this email already exists' },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        company,
        address,
        type: type.toUpperCase(),
        priority: priority.toUpperCase(),
        notes,
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error('Create client error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
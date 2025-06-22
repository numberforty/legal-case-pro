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
    const caseId = searchParams.get('caseId');
    const userId = searchParams.get('userId');

    let whereClause: any = {};

    if (caseId) {
      whereClause.caseId = caseId;
    }

    if (userId) {
      whereClause.userId = userId;
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where: whereClause,
      include: {
        case: {
          select: {
            id: true,
            title: true,
            caseNumber: true,
            client: {
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Calculate totals
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const billableHours = timeEntries
      .filter(entry => entry.isBillable)
      .reduce((sum, entry) => sum + entry.hours, 0);
    const totalAmount = timeEntries
      .filter(entry => entry.isBillable)
      .reduce((sum, entry) => sum + (entry.hours * (entry.hourlyRate || 0)), 0);

    return NextResponse.json({
      timeEntries,
      summary: {
        totalHours,
        billableHours,
        totalAmount,
      },
    });
  } catch (error) {
    console.error('Get time entries error:', error);
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
      description,
      hours,
      hourlyRate = 450,
      isBillable = true,
      caseId,
      date,
    } = data;

    if (!description || !hours || !caseId) {
      return NextResponse.json(
        { error: 'Description, hours, and case are required' },
        { status: 400 }
      );
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        description,
        hours: parseFloat(hours),
        hourlyRate: parseFloat(hourlyRate),
        isBillable,
        caseId,
        userId: user.id,
        date: date ? new Date(date) : new Date(),
      },
      include: {
        case: {
          select: {
            title: true,
            caseNumber: true,
            client: {
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({ timeEntry }, { status: 201 });
  } catch (error) {
    console.error('Create time entry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
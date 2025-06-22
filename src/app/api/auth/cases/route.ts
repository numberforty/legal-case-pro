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
        { title: { contains: search, mode: 'insensitive' } },
        { caseNumber: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
    }

    if (type && type !== 'all') {
      whereClause.type = type.toUpperCase();
    }

    const cases = await prisma.case.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            documents: true,
            timeEntries: true,
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate additional metrics for each case
    const casesWithMetrics = await Promise.all(
      cases.map(async (caseItem) => {
        const timeEntries = await prisma.timeEntry.findMany({
          where: { caseId: caseItem.id },
        });

        const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
        const billableHours = timeEntries
          .filter(entry => entry.isBillable)
          .reduce((sum, entry) => sum + entry.hours, 0);

        return {
          ...caseItem,
          totalHours,
          billableHours,
          documents: caseItem._count.documents,
          timeEntries: caseItem._count.timeEntries,
          tasks: caseItem._count.tasks,
        };
      })
    );

    return NextResponse.json({ cases: casesWithMetrics });
  } catch (error) {
    console.error('Get cases error:', error);
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
      title,
      caseNumber,
      description,
      type,
      priority = 'MEDIUM',
      clientId,
      assignedToId,
      estimatedValue,
      deadline,
      courtDate,
      opposing,
    } = data;

    if (!title || !type || !clientId || !assignedToId) {
      return NextResponse.json(
        { error: 'Title, type, client, and assigned attorney are required' },
        { status: 400 }
      );
    }

    // Generate case number if not provided
    let finalCaseNumber = caseNumber;
    if (!finalCaseNumber) {
      const year = new Date().getFullYear();
      const caseCount = await prisma.case.count();
      finalCaseNumber = `LC-${year}-${String(caseCount + 1).padStart(3, '0')}`;
    }

    // Check if case number already exists
    const existingCase = await prisma.case.findUnique({
      where: { caseNumber: finalCaseNumber },
    });

    if (existingCase) {
      return NextResponse.json(
        { error: 'Case number already exists' },
        { status: 400 }
      );
    }

    const newCase = await prisma.case.create({
      data: {
        title,
        caseNumber: finalCaseNumber,
        description,
        type: type.toUpperCase(),
        priority: priority.toUpperCase(),
        clientId,
        assignedToId,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        deadline: deadline ? new Date(deadline) : null,
        courtDate: courtDate ? new Date(courtDate) : null,
        opposing,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({ case: newCase }, { status: 201 });
  } catch (error) {
    console.error('Create case error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
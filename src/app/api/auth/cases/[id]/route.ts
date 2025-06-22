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

    const caseItem = await prisma.case.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        documents: {
          orderBy: {
            uploadedAt: 'desc',
          },
        },
        timeEntries: {
          include: {
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
        },
        tasks: {
          include: {
            assignedTo: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            dueDate: 'asc',
          },
        },
      },
    });

    if (!caseItem) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Calculate metrics
    const totalHours = caseItem.timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const billableHours = caseItem.timeEntries
      .filter(entry => entry.isBillable)
      .reduce((sum, entry) => sum + entry.hours, 0);
    const totalBilled = caseItem.timeEntries
      .filter(entry => entry.isBillable)
      .reduce((sum, entry) => sum + (entry.hours * (entry.hourlyRate || 0)), 0);

    const caseWithMetrics = {
      ...caseItem,
      totalHours,
      billableHours,
      totalBilled,
    };

    return NextResponse.json({ case: caseWithMetrics });
  } catch (error) {
    console.error('Get case error:', error);
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
      title,
      description,
      type,
      status,
      priority,
      estimatedValue,
      progress,
      deadline,
      courtDate,
      opposing,
      nextAction,
      assignedToId,
    } = data;

    const updatedCase = await prisma.case.update({
      where: { id: params.id },
      data: {
        title,
        description,
        type: type?.toUpperCase(),
        status: status?.toUpperCase(),
        priority: priority?.toUpperCase(),
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
        progress: progress ? parseInt(progress) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        courtDate: courtDate ? new Date(courtDate) : undefined,
        opposing,
        nextAction,
        assignedToId,
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

    return NextResponse.json({ case: updatedCase });
  } catch (error) {
    console.error('Update case error:', error);
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

    // Only allow admins or partners to delete cases
    if (user.role !== 'ADMIN' && user.role !== 'PARTNER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await prisma.case.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Case deleted successfully' });
  } catch (error) {
    console.error('Delete case error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
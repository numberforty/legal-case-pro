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
    const status = searchParams.get('status');
    const assignedToId = searchParams.get('assignedToId');

    let whereClause: any = {};

    if (caseId) {
      whereClause.caseId = caseId;
    }

    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
    }

    if (assignedToId) {
      whereClause.assignedToId = assignedToId;
    }

    const tasks = await prisma.task.findMany({
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
        assignedTo: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        {
          priority: 'desc',
        },
        {
          dueDate: 'asc',
        },
      ],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
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
      description,
      priority = 'MEDIUM',
      dueDate,
      caseId,
      assignedToId,
    } = data;

    if (!title || !caseId || !assignedToId) {
      return NextResponse.json(
        { error: 'Title, case, and assigned user are required' },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority.toUpperCase(),
        dueDate: dueDate ? new Date(dueDate) : null,
        caseId,
        assignedToId,
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
        assignedTo: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
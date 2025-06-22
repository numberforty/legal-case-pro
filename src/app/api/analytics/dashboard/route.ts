import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Dashboard Analytics API called ===');
    
    const token = request.cookies.get('auth-token')?.value;
    console.log('Token present:', !!token);
    
    if (!token) {
      console.log('No token, returning 401');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.log('Returning mock dashboard data');

    // Return static mock data for now
    const dashboard = {
      summary: {
        totalClients: 25,
        totalCases: 45,
        activeCases: 12,
        totalTasks: 87,
        pendingTasks: 23,
        totalRevenue: 125000,
        recentRevenue: 15000
      },
      upcomingDeadlines: [],
      recentTimeEntries: [],
      topClients: []
    };

    console.log('Dashboard data prepared, sending response');
    return NextResponse.json({ dashboard });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
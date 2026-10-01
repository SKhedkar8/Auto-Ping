import { NextResponse } from 'next/server';
import { getAdminDashboardStats } from '@/lib/db';

export async function GET() {
  const stats = getAdminDashboardStats();
  return NextResponse.json({ data: stats });
}

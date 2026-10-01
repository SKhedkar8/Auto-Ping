import { NextResponse } from 'next/server';
import { getSlotsForCenter } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'Date query parameter is required (YYYY-MM-DD)' }, { status: 400 });
  }

  const slots = getSlotsForCenter(id, date);
  return NextResponse.json({ data: slots });
}

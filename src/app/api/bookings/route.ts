import { NextResponse } from 'next/server';
import { createBooking, getBookings } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || undefined;
  const status = searchParams.get('status') || undefined;
  const centerId = searchParams.get('centerId') || undefined;

  const bookings = getBookings({ userId, status, centerId });
  return NextResponse.json({ data: bookings });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, vehicleId, centerId, slotId, serviceDate, serviceTime, services, notes, estimatedCostMin, estimatedCostMax } = body;

    if (!userId || !vehicleId || !centerId || !slotId || !serviceDate || !serviceTime || !services?.length) {
      return NextResponse.json({ error: 'Please provide vehicle, service center, date, time slot, and at least one service.' }, { status: 400 });
    }

    const booking = createBooking({
      userId,
      vehicleId,
      centerId,
      slotId,
      serviceDate,
      serviceTime,
      services,
      notes,
      estimatedCostMin: Number(estimatedCostMin) || 2000,
      estimatedCostMax: Number(estimatedCostMax) || 3500,
    });

    return NextResponse.json({ data: booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

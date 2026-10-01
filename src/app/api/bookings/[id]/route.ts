import { NextResponse } from 'next/server';
import { cancelBooking, completeBooking, confirmBooking, getBookingById, rescheduleBooking } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const booking = getBookingById(id);
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }
  return NextResponse.json({ data: booking });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const action = body.action || (body.status === 'CONFIRMED' ? 'CONFIRM' : undefined);

    if (action === 'CONFIRM') {
      const confirmed = confirmBooking(id);
      return NextResponse.json({ data: confirmed });
    }

    if (action === 'CANCEL') {
      const cancelled = cancelBooking(id, body.reason);
      return NextResponse.json({ data: cancelled });
    }

    if (action === 'RESCHEDULE') {
      const { newSlotId, newDate, newTime } = body;
      if (!newSlotId || !newDate || !newTime) {
        return NextResponse.json({ error: 'newSlotId, newDate, and newTime are required' }, { status: 400 });
      }
      const rescheduled = rescheduleBooking(id, newSlotId, newDate, newTime);
      return NextResponse.json({ data: rescheduled });
    }

    if (action === 'COMPLETE') {
      const { finalCost, finalKm, servicesDone, notes } = body;
      if (!finalCost || !finalKm) {
        return NextResponse.json({ error: 'finalCost and finalKm are required' }, { status: 400 });
      }
      const completed = completeBooking(id, Number(finalCost), Number(finalKm), servicesDone || [], notes);
      return NextResponse.json({ data: completed });
    }

    return NextResponse.json({ error: 'Invalid booking action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

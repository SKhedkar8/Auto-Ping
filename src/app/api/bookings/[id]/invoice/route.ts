import { NextResponse } from 'next/server';
import { getBookingById, getInvoiceByBookingId } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = getBookingById(id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const invoice = getInvoiceByBookingId(id);
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not yet generated. Service is not marked as completed.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: invoice, booking });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createServiceRecord, getServiceRecords } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get('vehicleId') || undefined;
  const records = getServiceRecords(vehicleId);
  return NextResponse.json({ data: records });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicleId, centerName, date, km, servicesDone, totalCost, notes } = body;

    if (!vehicleId || !centerName || !date || !km || !totalCost) {
      return NextResponse.json({ error: 'vehicleId, centerName, date, km, and totalCost are required.' }, { status: 400 });
    }

    const record = createServiceRecord({
      vehicleId,
      centerName,
      date,
      km: Number(km),
      servicesDone: Array.isArray(servicesDone) ? servicesDone : [servicesDone || 'General Service'],
      totalCost: Number(totalCost),
      notes,
    });

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

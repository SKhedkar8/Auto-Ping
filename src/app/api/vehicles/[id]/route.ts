import { NextResponse } from 'next/server';
import { deleteVehicle, getVehicleById, updateVehicleKm } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const vehicle = getVehicleById(id);
  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }
  return NextResponse.json({ data: vehicle });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (body.currentKm !== undefined) {
      const updated = updateVehicleKm(id, Number(body.currentKm));
      return NextResponse.json({ data: updated });
    }
    return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteVehicle(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

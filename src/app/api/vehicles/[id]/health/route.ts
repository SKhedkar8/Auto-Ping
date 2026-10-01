import { NextResponse } from 'next/server';
import { getVehicleById } from '@/lib/db';
import { calculateVehicleHealth } from '@/lib/health';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const vehicle = getVehicleById(id);
  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }

  const health = calculateVehicleHealth({
    vehicleType: vehicle.type,
    currentKm: vehicle.currentKm,
    purchaseYear: vehicle.purchaseYear,
    lastServiceDate: vehicle.lastServiceDate,
    lastServiceKm: vehicle.lastServiceKm,
  });

  return NextResponse.json({
    data: {
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.brandName} ${vehicle.modelName}`,
      currentKm: vehicle.currentKm,
      ...health,
    },
  });
}

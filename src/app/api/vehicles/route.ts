import { NextResponse } from 'next/server';
import { createVehicle, getVehicles } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const vehicles = getVehicles(userId || undefined);
  return NextResponse.json({ data: vehicles });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, brandName, modelName, modelId, type, vehicleClass, registrationNo, purchaseYear, currentKm, fuelType, lastServiceDate, lastServiceKm, imageUrl } = body;

    if (!brandName || !modelName || !currentKm || !purchaseYear) {
      return NextResponse.json({ error: 'Missing required vehicle fields: Brand, Model, Purchase Year, and Current KM are mandatory.' }, { status: 400 });
    }

    const vehicle = createVehicle({
      userId: userId || 'user-customer-1',
      brandName,
      modelName,
      modelId: modelId || 'model-custom',
      type: type || 'CAR',
      vehicleClass: vehicleClass || 'suv',
      registrationNo: registrationNo || 'NEW-REG',
      purchaseYear: Number(purchaseYear),
      currentKm: Number(currentKm),
      fuelType: fuelType || 'PETROL',
      lastServiceDate: lastServiceDate || undefined,
      lastServiceKm: lastServiceKm ? Number(lastServiceKm) : undefined,
      imageUrl: imageUrl || undefined,
    });

    return NextResponse.json({ data: vehicle }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

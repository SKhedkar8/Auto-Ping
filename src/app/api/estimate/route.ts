import { NextResponse } from 'next/server';
import { calculateCostEstimate } from '@/lib/estimate';
import { CenterType, Vehicle } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { serviceBasePrices, vehicleClass, centerType } = await request.json();

    if (!Array.isArray(serviceBasePrices) || serviceBasePrices.length === 0) {
      return NextResponse.json({ error: 'serviceBasePrices must be a non-empty array' }, { status: 400 });
    }

    const estimate = calculateCostEstimate({
      serviceBasePrices,
      vehicleClass: (vehicleClass || 'suv') as Vehicle['vehicleClass'],
      centerType: (centerType || 'AUTHORIZED') as CenterType,
    });

    return NextResponse.json({ data: estimate });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

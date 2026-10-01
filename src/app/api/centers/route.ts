import { NextResponse } from 'next/server';
import { createServiceCenter, getServiceCenters } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || undefined;
  const tab = searchParams.get('tab') || undefined; // 'AUTHORIZED' | 'MULTI_BRAND' | 'LOCAL'
  const vehicleBrand = searchParams.get('brand') || undefined;

  let centers = getServiceCenters(city, tab);

  if (tab === 'AUTHORIZED' && vehicleBrand) {
    centers = centers.filter(
      (c) =>
        c.brandsSupported.length === 0 ||
        c.brandsSupported.some((b) => b.toLowerCase().includes(vehicleBrand.toLowerCase()))
    );
  }

  return NextResponse.json({ data: centers });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newCenter = createServiceCenter(body);
    return NextResponse.json({ data: newCenter }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

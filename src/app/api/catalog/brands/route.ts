import { NextResponse } from 'next/server';
import { getCatalogBrands } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || undefined;
  const brands = getCatalogBrands(type);
  return NextResponse.json({ data: brands });
}

import { NextResponse } from 'next/server';
import { getCatalogModels } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get('brandId') || undefined;
  const models = getCatalogModels(brandId);
  return NextResponse.json({ data: models });
}

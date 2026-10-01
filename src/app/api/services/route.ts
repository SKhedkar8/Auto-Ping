import { NextResponse } from 'next/server';
import { getCatalogServices } from '@/lib/db';

export async function GET() {
  const services = getCatalogServices();
  return NextResponse.json({ data: services });
}

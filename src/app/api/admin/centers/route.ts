import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';
import { ServiceCenter } from '@/lib/types';

export async function PATCH(request: Request) {
  try {
    const { id, ...updates } = await request.json();
    const db = getDatabase();
    const idx = db.centers.findIndex((c) => c.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Center not found' }, { status: 404 });
    db.centers[idx] = { ...db.centers[idx], ...updates };
    saveDatabase(db);
    return NextResponse.json({ data: db.centers[idx] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

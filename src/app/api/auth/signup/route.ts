import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';
import { User } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { name, email, mobile, city, preferredCity } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const db = getDatabase();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 400 });
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      mobile: mobile || '9800000000',
      role: 'CUSTOMER',
      city: city || 'Pune',
      preferredCity: preferredCity || city || 'Pune',
      isActive: true,
      prefs: { inApp: true, email: true, whatsapp: true, sms: true },
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDatabase(db);

    return NextResponse.json({ data: newUser });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

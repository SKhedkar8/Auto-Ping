import { NextResponse } from 'next/server';
import { getUserByEmailOrMobile } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { identifier, password, role } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Please enter both identifier and password.' }, { status: 400 });
    }

    const user = getUserByEmailOrMobile(identifier);

    // For Admin login, check email & password
    if (role === 'ADMIN') {
      if (identifier.toLowerCase() === 'admin@autoping.com' && password === 'Admin@123') {
        return NextResponse.json({ data: user || { id: 'user-admin-1', role: 'ADMIN', name: 'Auto Ping Admin', email: 'admin@autoping.com' } });
      }
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }

    // For Customer demo testing
    if (user) {
      return NextResponse.json({ data: user });
    }

    // If identifier is demo customer
    if (identifier.toLowerCase() === 'shreyas@example.com' || identifier === '9876543210') {
      const demoUser = getUserByEmailOrMobile('shreyas@example.com');
      return NextResponse.json({ data: demoUser });
    }

    return NextResponse.json({ error: 'User not found. Try demo login or sign up.' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

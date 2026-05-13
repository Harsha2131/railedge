import { NextResponse } from 'next/server';
import { readDB } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const db = await readDB();
    const user = db.users.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

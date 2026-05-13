import { NextResponse } from 'next/server';
import { readDB, writeDB, User } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const db = await readDB();
    
    if (db.users.some(u => u.email === email)) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 400 });
    }

    const newUser: User = {
      id: 'u' + Date.now(),
      name,
      email,
      password,
      role: 'USER',
    };

    db.users.push(newUser);
    await writeDB(db);

    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      initials: newUser.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    };

    return NextResponse.json({ user: userData }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

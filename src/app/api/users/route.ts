import { NextResponse } from 'next/server';
import { readDB } from '@/lib/db';

export async function GET() {
  try {
    const db = await readDB();
    const users = db.users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      bookings: db.bookings.filter(b => b.userId === u.id).length,
      joined: '2024-01-01',
      status: 'active'
    }));
    return NextResponse.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

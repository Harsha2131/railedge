import { NextResponse } from 'next/server';
import { getUsers, getBookings } from '@/lib/db';

export async function GET() {
  try {
    const users = await getUsers();
    const allBookings = await getBookings();
    
    const usersWithStats = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      bookings: allBookings.filter(b => b.userId === u.id).length,
      joined: '2024-01-01',
      status: 'active'
    }));
    return NextResponse.json(usersWithStats);
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

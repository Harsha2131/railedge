import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { Booking } from '@/lib/mockData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const { getBookings } = await import('@/lib/db');
    const bookings = await getBookings(userId || undefined);
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { createBooking } = await import('@/lib/db');
    const newBooking = await createBooking(body);
    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


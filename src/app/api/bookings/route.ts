import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { Booking } from '@/lib/mockData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const db = await readDB();
    let bookings = db.bookings;

    if (userId) {
      bookings = bookings.filter(b => b.userId === userId);
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newBooking = body as Booking;

    if (!newBooking.trainName || !newBooking.passengers || newBooking.passengers.length === 0) {
      return NextResponse.json({ error: 'Invalid booking data' }, { status: 400 });
    }

    const db = await readDB();

    newBooking.id = 'bk' + Date.now();
    newBooking.pnr = 'PNR' + Math.floor(Math.random() * 9000000 + 1000000);
    newBooking.bookedAt = new Date().toISOString();
    newBooking.status = newBooking.status || 'CONFIRMED';

    db.bookings.push(newBooking);
    await writeDB(db);

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


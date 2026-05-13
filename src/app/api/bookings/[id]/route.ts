import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await readDB();
    const idx = db.bookings.findIndex(b => b.id === id);

    if (idx === -1) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    db.bookings[idx].status = 'CANCELLED';
    db.bookings[idx].cancelledAt = new Date().toISOString();
    await writeDB(db);

    return NextResponse.json(db.bookings[idx]);
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { cancelBooking, getBookings } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await cancelBooking(id);

    if (!success) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const bookings = await getBookings();
    const updated = bookings.find(b => b.id === id);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

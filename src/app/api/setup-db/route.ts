import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { MOCK_TRAINS } from '@/lib/mockData';

export async function GET() {
  try {
    // Seed Initial Users (tables must already exist — run the SQL schema in Supabase Dashboard first)
    const initialUsers = [
      { id: 'u1', name: 'Harsha Kumar',  email: 'harsha@example.com',   password: 'pass123',  role: 'USER' },
      { id: 'u2', name: 'Admin User',    email: 'admin@railedge.in',    password: 'admin123', role: 'ADMIN' },
      { id: 'u3', name: 'Rahul Sharma',  email: 'rahul@example.com',    password: 'pass123',  role: 'USER' },
    ];

    for (const user of initialUsers) {
      const { error } = await supabase.from('users').upsert(user, { onConflict: 'id', ignoreDuplicates: true });
      if (error && !error.message.includes('duplicate')) throw new Error(`Users: ${error.message}`);
    }

    // Seed Trains
    for (const train of MOCK_TRAINS) {
      const { error } = await supabase.from('trains').upsert({
        id: train.id,
        number: train.number,
        name: train.name,
        type: train.type,
        source: train.source,
        source_code: train.sourceCode,
        destination: train.destination,
        destination_code: train.destinationCode,
        departure: train.departure,
        arrival: train.arrival,
        duration: train.duration,
        rating: train.rating,
        on_time_percent: train.onTimePercent,
        distance: train.distance,
        classes: train.classes,
        days: train.days,
      }, { onConflict: 'id', ignoreDuplicates: true });
      if (error && !error.message.includes('duplicate')) throw new Error(`Trains: ${error.message}`);
    }

    return NextResponse.json({ message: 'Database seeded successfully! ✅' });
  } catch (error) {
    console.error('Setup DB Error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

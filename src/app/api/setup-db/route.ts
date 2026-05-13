import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { MOCK_TRAINS } from '@/lib/mockData';

export async function GET() {
  try {
    // 1. Create Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'USER',
        phone TEXT,
        city TEXT,
        gender TEXT,
        payment_methods JSONB,
        notifications JSONB
      );
    `;

    // 2. Create Trains Table
    await sql`
      CREATE TABLE IF NOT EXISTS trains (
        id TEXT PRIMARY KEY,
        number TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        source TEXT NOT NULL,
        source_code TEXT NOT NULL,
        destination TEXT NOT NULL,
        destination_code TEXT NOT NULL,
        departure TEXT NOT NULL,
        arrival TEXT NOT NULL,
        duration TEXT NOT NULL,
        rating NUMERIC NOT NULL,
        on_time_percent NUMERIC NOT NULL,
        distance NUMERIC NOT NULL,
        classes JSONB NOT NULL,
        days TEXT[]
      );
    `;

    // 3. Create Bookings Table
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        pnr TEXT UNIQUE NOT NULL,
        train_name TEXT NOT NULL,
        train_number TEXT NOT NULL,
        source TEXT NOT NULL,
        source_code TEXT NOT NULL,
        destination TEXT NOT NULL,
        destination_code TEXT NOT NULL,
        departure TEXT NOT NULL,
        arrival TEXT NOT NULL,
        duration TEXT NOT NULL,
        date TEXT NOT NULL,
        class TEXT NOT NULL,
        passengers JSONB NOT NULL,
        total_amount NUMERIC NOT NULL,
        status TEXT NOT NULL DEFAULT 'CONFIRMED',
        booked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        cancelled_at TIMESTAMPTZ,
        payment_method TEXT,
        seat_numbers TEXT[],
        coach_number TEXT
      );
    `;

    // 4. Seed Initial Users
    const initialUsers = [
      ['u1', 'Harsha Kumar', 'harsha@example.com', 'pass123', 'USER'],
      ['u2', 'Admin User', 'admin@railedge.in', 'admin123', 'ADMIN'],
      ['u3', 'Rahul Sharma', 'rahul@example.com', 'pass123', 'USER']
    ];

    for (const [id, name, email, password, role] of initialUsers) {
      await sql`
        INSERT INTO users (id, name, email, password, role)
        VALUES (${id}, ${name}, ${email}, ${password}, ${role})
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    // 5. Seed Initial Trains
    for (const train of MOCK_TRAINS) {
      await sql`
        INSERT INTO trains (
          id, number, name, type, source, source_code, destination, 
          destination_code, departure, arrival, duration, rating, 
          on_time_percent, distance, classes, days
        )
        VALUES (
          ${train.id}, 
          ${train.number}, 
          ${train.name}, 
          ${train.type},
          ${train.source}, 
          ${train.sourceCode}, 
          ${train.destination}, 
          ${train.destinationCode}, 
          ${train.departure}, 
          ${train.arrival}, 
          ${train.duration}, 
          ${train.rating},
          ${train.onTimePercent},
          ${train.distance},
          ${JSON.stringify(train.classes)}, 
          ${`{${train.days.join(',')}}`}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    return NextResponse.json({ message: 'Database setup successful!' });
  } catch (error) {
    console.error('Setup DB Error:', error);
    return NextResponse.json({ error: 'Failed to setup database', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

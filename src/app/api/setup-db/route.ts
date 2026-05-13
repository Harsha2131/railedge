import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { MOCK_TRAINS } from '@/lib/mockData';
import postgres from 'postgres';

export async function GET() {
  try {
    // We use the postgres package exclusively for table creation since supabase-js cannot run DDL
    const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL!;
    if (!connectionString) {
      throw new Error("Missing POSTGRES_URL environment variable.");
    }
    
    const sql = postgres(connectionString, {
      ssl: { rejectUnauthorized: false },
      max: 1,
      connect_timeout: 10,
    });

    // 1. Create Tables
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

    // 2. Refresh PostgREST API Schema Cache (Supabase specific)
    // This forces the Supabase API to recognize the new tables immediately
    await supabase.rpc('reload_schema_cache').catch(() => {
      // Ignore if RPC doesn't exist, it usually updates on its own after a few seconds
    });

    // Wait 2 seconds to give the API cache time to update
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Seed Initial Users
    const initialUsers = [
      { id: 'u1', name: 'Harsha Kumar',  email: 'harsha@example.com',   password: 'pass123',  role: 'USER' },
      { id: 'u2', name: 'Admin User',    email: 'admin@railedge.in',    password: 'admin123', role: 'ADMIN' },
      { id: 'u3', name: 'Rahul Sharma',  email: 'rahul@example.com',    password: 'pass123',  role: 'USER' },
    ];

    for (const user of initialUsers) {
      const { error } = await supabase.from('users').upsert(user, { onConflict: 'id', ignoreDuplicates: true });
      if (error && !error.message.includes('duplicate')) throw new Error(`Users: ${error.message}`);
    }

    // 4. Seed Trains
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

    return NextResponse.json({ message: 'Database setup and seeded successfully! ✅' });
  } catch (error) {
    console.error('Setup DB Error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await readDB();
    
    const trainIndex = db.trains.findIndex(t => t.id === id);
    if (trainIndex === -1) {
      return NextResponse.json({ error: 'Train not found' }, { status: 404 });
    }

    db.trains[trainIndex] = { 
      ...body,
      id: db.trains[trainIndex].id
    };

    await writeDB(db);
    return NextResponse.json(db.trains[trainIndex]);
  } catch (error) {
    console.error('Update train error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await readDB();
    
    const initialCount = db.trains.length;
    db.trains = db.trains.filter(t => t.id !== id);
    
    if (db.trains.length === initialCount) {
      return NextResponse.json({ error: 'Train not found' }, { status: 404 });
    }

    await writeDB(db);
    return NextResponse.json({ message: 'Train deleted successfully' });
  } catch (error) {
    console.error('Delete train error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

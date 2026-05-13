import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await readDB();
    
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    db.users[userIndex] = { 
      ...db.users[userIndex], 
      ...body,
      id: db.users[userIndex].id 
    };

    await writeDB(db);

    const { password, ...safeUser } = db.users[userIndex];
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Update user error:', error);
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
    
    const initialCount = db.users.length;
    db.users = db.users.filter(u => u.id !== id);
    
    if (db.users.length === initialCount) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await writeDB(db);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

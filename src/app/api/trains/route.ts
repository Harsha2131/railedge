import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { Train } from '@/lib/mockData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const trainClass = searchParams.get('class');

    const db = await readDB();
    let trains = db.trains;

    if (from) {
      trains = trains.filter(t => 
        t.source.toLowerCase().includes(from.toLowerCase()) || 
        t.sourceCode.toLowerCase().includes(from.toLowerCase())
      );
    }
    if (to) {
      trains = trains.filter(t => 
        t.destination.toLowerCase().includes(to.toLowerCase()) || 
        t.destinationCode.toLowerCase().includes(to.toLowerCase())
      );
    }
    if (trainClass && trainClass !== 'ALL') {
      trains = trains.filter(t => t.classes.some(c => c.code === trainClass));
    }

    return NextResponse.json(trains);
  } catch (error) {
    console.error('Fetch trains error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTrain = body as Train;
    
    if (!newTrain.name || !newTrain.number || !newTrain.source || !newTrain.destination) {
      return NextResponse.json({ error: 'Missing required train fields' }, { status: 400 });
    }

    const db = await readDB();
    
    newTrain.id = 't' + Date.now();
    
    db.trains.push(newTrain);
    await writeDB(db);

    return NextResponse.json(newTrain, { status: 201 });
  } catch (error) {
    console.error('Create train error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

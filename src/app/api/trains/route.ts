import { NextResponse } from 'next/server';
import { getTrains } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const trainClass = searchParams.get('class');

    let trains = await getTrains();

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

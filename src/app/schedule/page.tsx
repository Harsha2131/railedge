'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Clock, AlertCircle } from 'lucide-react';

export default function SchedulePage() {
  const [trainNum, setTrainNum] = useState('');
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainNum.trim()) return;
    setLoading(true);
    setSchedule(null);
    setError('');

    try {
      const response = await fetch('/api/trains');
      if (!response.ok) throw new Error('Failed to fetch trains');
      const trains = await response.json();

      const query = trainNum.trim().toLowerCase();
      const train = trains.find((t: any) =>
        t.number === trainNum.trim() ||
        t.name.toLowerCase().includes(query)
      );

      if (train) {
        setSchedule({
          trainName: train.name,
          trainNumber: train.number,
          type: train.type,
          runsOn: train.days || ['Daily'],
          duration: train.duration,
          distance: train.distance,
          classes: train.classes,
          route: [
            {
              station: train.source,
              code: train.sourceCode,
              arrival: 'Origin / Start',
              departure: train.departure,
              distance: '0 km',
              halt: '—',
            },
            {
              station: train.destination,
              code: train.destinationCode,
              arrival: train.arrival,
              departure: 'Terminus / End',
              distance: `${train.distance} km`,
              halt: '—',
            },
          ],
        });
      } else {
        setError(`No train found with number or name "${trainNum}". Try e.g. "12301" or "Rajdhani".`);
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '2rem 0' }}>
        <div className="container">
          <div className="card-elevated" style={{ maxWidth: 860, margin: '0 auto', padding: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ width: 48, height: 48, background: '#fff7ed', color: '#ea580c', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Train Schedule</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Check arrival/departure timings by train number or name</p>
              </div>
            </div>

            <form onSubmit={getSchedule} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input
                className="input"
                placeholder="Enter Train Number (e.g. 12301) or Name (e.g. Rajdhani)"
                value={trainNum}
                onChange={e => setTrainNum(e.target.value)}
                style={{ flex: 1 }}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent)', border: 'none', whiteSpace: 'nowrap' }} disabled={loading}>
                {loading ? 'Fetching...' : 'View Schedule'}
              </button>
            </form>

            {error && (
              <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {schedule && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: '#f8fafc', borderRadius: 12, marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                      {schedule.trainName}
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: 6 }}>#{schedule.trainNumber}</span>
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Runs on: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{schedule.runsOn.join(', ')}</span>
                      &nbsp;·&nbsp;Duration: <strong>{schedule.duration}</strong>
                      &nbsp;·&nbsp;Distance: <strong>{schedule.distance} km</strong>
                    </p>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: 100, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                    {schedule.type}
                  </span>
                </div>

                {schedule.classes && schedule.classes.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Classes:</span>
                    {schedule.classes.map((c: any) => (
                      <span key={c.code} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: 6, border: '1px solid #bfdbfe' }}>
                        {c.code} – {c.name}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-light)' }}>
                        {['Station', 'Code', 'Arrival', 'Departure', 'Distance', 'Halt'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.route.map((stop: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-light)', background: i === 0 ? '#f0fdf4' : i === schedule.route.length - 1 ? '#fef3c7' : '#fff' }}>
                          <td style={{ padding: '1rem', fontWeight: 700, color: '#0f172a' }}>{stop.station}</td>
                          <td style={{ padding: '1rem', fontWeight: 700, color: '#2563eb', fontSize: '0.85rem' }}>{stop.code}</td>
                          <td style={{ padding: '1rem', color: i === 0 ? '#16a34a' : '#0f172a', fontWeight: i === 0 ? 600 : 400 }}>{stop.arrival}</td>
                          <td style={{ padding: '1rem', color: i === schedule.route.length - 1 ? '#92400e' : '#0f172a', fontWeight: i === schedule.route.length - 1 ? 600 : 400 }}>{stop.departure}</td>
                          <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{stop.distance}</td>
                          <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{stop.halt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

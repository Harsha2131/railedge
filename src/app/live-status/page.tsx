'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Navigation, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function LiveStatusPage() {
  const [trainNum, setTrainNum] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainNum.trim()) return;
    setLoading(true);
    setStatus(null);
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
        setStatus({
          trainName: train.name,
          trainNumber: train.number,
          source: train.source,
          destination: train.destination,
          delay: train.onTimePercent >= 90 ? 'On Time' : `~${100 - train.onTimePercent} mins late`,
          isLate: train.onTimePercent < 90,
          lastUpdated: 'Just now',
          stops: [
            { name: train.source, code: train.sourceCode, arrival: 'Origin', departure: train.departure, status: 'DEPARTED' },
            { name: 'En Route', code: '...', arrival: '—', departure: '—', status: 'AT STATION' },
            { name: train.destination, code: train.destinationCode, arrival: train.arrival, departure: 'Terminus', status: 'UPCOMING' },
          ],
          classes: train.classes,
          onTimePercent: train.onTimePercent,
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
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div className="card-elevated" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: 44, height: 44, background: '#eff6ff', color: '#2563eb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Navigation size={22} />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.4rem', marginBottom: '0.15rem' }}>Live Train Status</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Track any train by number or name</p>
                </div>
              </div>

              <form onSubmit={checkStatus} style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  className="input"
                  placeholder="Enter Train Number (e.g. 12301) or Name"
                  value={trainNum}
                  onChange={e => setTrainNum(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent)', border: 'none', whiteSpace: 'nowrap' }} disabled={loading}>
                  {loading ? 'Locating...' : 'Track Train'}
                </button>
              </form>

              {error && (
                <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  {error}
                </div>
              )}
            </div>

            {status && (
              <div className="card-elevated" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{status.trainName}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Train #{status.trainNumber} · Updated: {status.lastUpdated}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem', color: status.isLate ? '#dc2626' : '#16a34a' }}>
                      {status.isLate ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                      {status.delay}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>On-time: {status.onTimePercent}%</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', background: '#f8fafc', borderRadius: 10, marginBottom: '1.75rem', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span>{status.source} ({status.stops[0].code})</span>
                  <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, #22c55e, #2563eb, #94a3b8)', borderRadius: 2 }} />
                  <span>{status.destination} ({status.stops[status.stops.length - 1].code})</span>
                </div>

                <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                  <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: '#e2e8f0' }} />
                  {status.stops.map((stop: any, i: number) => (
                    <div key={i} style={{ position: 'relative', marginBottom: i < status.stops.length - 1 ? '2rem' : 0 }}>
                      <div style={{
                        position: 'absolute', left: '-29px', top: '4px', width: '14px', height: '14px',
                        borderRadius: '50%',
                        background: stop.status === 'DEPARTED' ? '#22c55e' : stop.status === 'AT STATION' ? '#2563eb' : '#fff',
                        border: '2px solid ' + (stop.status === 'UPCOMING' ? '#cbd5e1' : stop.status === 'DEPARTED' ? '#22c55e' : '#2563eb'),
                        zIndex: 2,
                        boxShadow: stop.status === 'AT STATION' ? '0 0 0 4px rgba(37,99,235,0.15)' : 'none',
                      }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.975rem', color: stop.status === 'UPCOMING' ? '#94a3b8' : '#0f172a' }}>{stop.name}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Arr: {stop.arrival} · Dep: {stop.departure}</p>
                        </div>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.7rem', borderRadius: 100,
                          background: stop.status === 'DEPARTED' ? '#f0fdf4' : stop.status === 'AT STATION' ? '#eff6ff' : '#f8fafc',
                          color: stop.status === 'DEPARTED' ? '#166534' : stop.status === 'AT STATION' ? '#1d4ed8' : '#64748b',
                          border: '1px solid ' + (stop.status === 'DEPARTED' ? '#bbf7d0' : stop.status === 'AT STATION' ? '#bfdbfe' : '#e2e8f0')
                        }}>
                          {stop.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

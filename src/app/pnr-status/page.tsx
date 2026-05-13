'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Search, CheckCircle, AlertCircle } from 'lucide-react';

export default function PNRStatusPage() {
  const [pnr, setPnr] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkPNR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnr.trim()) return;
    setLoading(true);
    setStatus(null);
    setError('');

    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();

      const booking = data.find((b: any) => b.pnr === pnr.trim().toUpperCase());

      if (booking) {
        setStatus({
          pnr: booking.pnr,
          trainName: booking.trainName,
          trainNumber: booking.trainNumber,
          source: booking.source || booking.sourceCode,
          destination: booking.destination || booking.destinationCode,
          date: booking.date,
          status: booking.status,
          class: booking.class,
          coach: booking.coachNumber || 'B1',
          seat: booking.seatNumbers?.join(', ') || '-',
          passengers: booking.passengers,
          totalAmount: booking.totalAmount,
        });
      } else {
        setError(`No booking found for PNR: ${pnr.toUpperCase()}. Please verify and try again.`);
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = status?.status === 'CONFIRMED' ? '#16a34a' : status?.status === 'CANCELLED' ? '#dc2626' : '#d97706';
  const statusBg = status?.status === 'CONFIRMED' ? '#f0fdf4' : status?.status === 'CANCELLED' ? '#fef2f2' : '#fffbeb';

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '2rem 0' }}>
        <div className="container">
          <div className="card-elevated" style={{ maxWidth: 640, margin: '0 auto', padding: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ width: 48, height: 48, background: '#f0fdf4', color: '#16a34a', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Search size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>PNR Status Enquiry</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enter your PNR number to check booking status</p>
              </div>
            </div>

            <form onSubmit={checkPNR} style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                className="input"
                placeholder="Enter PNR Number (e.g. PNR123456)"
                value={pnr}
                onChange={e => setPnr(e.target.value)}
                style={{ textTransform: 'uppercase', flex: 1 }}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent)', border: 'none', whiteSpace: 'nowrap' }} disabled={loading}>
                {loading ? 'Checking...' : 'Check PNR'}
              </button>
            </form>

            {error && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {status && (
              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>{status.trainName}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{status.trainNumber} · {status.class}</p>
                  </div>
                  <span style={{ padding: '0.4rem 0.9rem', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700, background: statusBg, color: statusColor }}>
                    {status.status}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', background: '#f8fafc', borderRadius: 10, marginBottom: '1.25rem', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span style={{ color: '#0f172a' }}>{status.source}</span>
                  <span style={{ color: '#94a3b8', fontSize: '1.1rem' }}>→</span>
                  <span style={{ color: '#0f172a' }}>{status.destination}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: 12, marginBottom: '1.25rem' }}>
                  <div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>PNR Number</p>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#2563eb' }}>{status.pnr}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Journey Date</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{new Date(status.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Coach</p>
                    <p style={{ fontSize: '1rem', fontWeight: 700 }}>{status.coach}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Seat / Berth</p>
                    <p style={{ fontSize: '1rem', fontWeight: 700 }}>{status.seat}</p>
                  </div>
                </div>

                {status.passengers && status.passengers.length > 0 && (
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Passengers ({status.passengers.length})</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {status.passengers.map((p: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0.875rem', background: '#f8fafc', borderRadius: 8, fontSize: '0.875rem' }}>
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{p.age} yrs · {p.gender}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

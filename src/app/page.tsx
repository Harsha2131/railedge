'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { MapPin, Calendar, Search } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      router.push('/admin');
    }
  }, [user, router]);

  if (user?.role === 'ADMIN') return null;

  const handleSearch = () => {
    if (!from || !to) return;
    router.push(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&passengers=1&class=ALL`);
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <div style={{ background: 'var(--primary)', color: '#fff', padding: '3rem 0 6rem', textAlign: 'center' }}>
          <div className="container">
            <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 900 }}>Welcome to RailEdge</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>Indian Railways Official Booking Partner</p>
          </div>
        </div>

        <div className="container" style={{ marginTop: '-4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {[
              { title: 'Book Ticket', desc: 'Reserve seats on express trains', icon: '🎫', link: '/search', color: '#ff9933' },
              { title: 'Cancel Ticket', desc: 'Instant refund on cancellations', icon: '❌', link: '/my-tickets', color: '#dc2626' },
              { title: 'Booking History', desc: 'View all your past journeys', icon: '📜', link: '/my-tickets', color: '#003366' },
              { title: 'PNR Status', desc: 'Check current waitlist status', icon: '🔍', link: '/pnr-status', color: '#16a34a' },
              { title: 'Live Status', desc: 'Track your train in real-time', icon: '📡', link: '/live-status', color: '#7c3aed' },
              { title: 'Train Schedule', desc: 'Check arrival/departure times', icon: '🕒', link: '/schedule', color: '#0891b2' },
            ].map(card => (
              <Link key={card.title} href={card.link} className="card-elevated" style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center', 
                padding: '2rem', transition: 'transform 0.2s, box-shadow 0.2s', borderTop: `4px solid ${card.color}`
              }}>
                <div style={{ fontSize: '3rem' }}>{card.icon}</div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{card.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{card.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="card-elevated" style={{ padding: '2.5rem', marginBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ width: 8, height: 24, background: 'var(--accent)', borderRadius: 4 }} />
              <h2 style={{ fontSize: '1.5rem' }}>Plan My Journey</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1.25rem', alignItems: 'end' }}>
              <div className="input-group">
                <label className="input-label">From Station</label>
                <div className="input-icon-wrap">
                  <MapPin className="input-icon" size={18} />
                  <input className="input" value={from} onChange={e => setFrom(e.target.value)} placeholder="e.g. New Delhi" />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">To Station</label>
                <div className="input-icon-wrap">
                  <MapPin className="input-icon" size={18} />
                  <input className="input" value={to} onChange={e => setTo(e.target.value)} placeholder="e.g. Mumbai" />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Travel Date</label>
                <div className="input-icon-wrap">
                  <Calendar className="input-icon" size={18} />
                  <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
                </div>
              </div>

              <button onClick={handleSearch} className="btn btn-primary btn-xl" style={{ background: 'var(--accent)', color: '#fff', height: 48, border: 'none' }}>
                Search Trains
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

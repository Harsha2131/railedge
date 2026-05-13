'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { Train as TrainType, Booking } from '@/lib/mockData';
import { BarChart3, Train, Ticket, Users, TrendingUp, AlertCircle, CheckCircle, Clock, Shield, X, CreditCard } from 'lucide-react';

const SIDEBAR_LINKS = [
  { key: 'overview',  label: 'Overview',   icon: <BarChart3 size={16} /> },
  { key: 'trains',    label: 'Trains',      icon: <Train size={16} /> },
  { key: 'bookings',  label: 'Bookings',    icon: <Ticket size={16} /> },
  { key: 'users',     label: 'Users',       icon: <Users size={16} /> },
];

interface AdminUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  bookings: number;
  joined: string;
  status: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [section, setSection] = useState('overview');
  const [trains, setTrains] = useState<TrainType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showAllLogs, setShowAllLogs] = useState(false);

  const fetchData = async () => {
    try {
      const [t, b, u] = await Promise.all([
        fetch('/api/trains').then(res => res.json()),
        fetch('/api/bookings').then(res => res.json()),
        fetch('/api/users').then(res => res.json())
      ]);
      setTrains(Array.isArray(t) ? t : []);
      setBookings(Array.isArray(b) ? b : []);
      setUsers(Array.isArray(u) ? u : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleDownloadReport = () => {
    if (bookings.length === 0) return;
    
    const headers = ['PNR', 'Train Name', 'Train Number', 'Source', 'Destination', 'Date', 'Amount', 'Status', 'Booked At'];
    const rows = bookings.map(b => [
      b.pnr,
      b.trainName,
      b.trainNumber,
      `"${b.source}"`,
      `"${b.destination}"`,
      b.date,
      b.totalAmount,
      b.status,
      b.bookedAt
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `RailEdge_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  }

  if (user.role !== 'ADMIN') {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <Shield size={48} color="#dc2626" />
          <h2 style={{ color: '#0f172a' }}>Access Denied</h2>
          <p style={{ color: '#64748b' }}>Admin privileges required to view this page.</p>
          <button onClick={() => router.push('/')} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, padding: '0.75rem 1.75rem', fontWeight: 700, cursor: 'pointer' }}>Go Home</button>
        </div>
      </>
    );
  }

  const confirmed  = bookings.filter(b => b.status === 'CONFIRMED').length;
  const cancelled  = bookings.filter(b => b.status === 'CANCELLED').length;
  const totalRev   = bookings.filter(b => b.status === 'CONFIRMED').reduce((a, b) => a + b.totalAmount, 0);

  const STAT_CARDS = [
    { label: 'Total Trains',    value: trains.length,         icon: <Train size={20} />,    color: '#2563eb', bg: '#eff6ff' },
    { label: 'Total Bookings',  value: bookings.length,        icon: <Ticket size={20} />,   color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Revenue (₹)',     value: totalRev.toLocaleString(),   icon: <TrendingUp size={20} />,color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Total Users',     value: users.length,           icon: <Users size={20} />,    color: '#d97706', bg: '#fef3c7' },
  ];

  const getRevenueData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = Array(7).fill(0);
    const today = new Date();
    
    bookings.forEach(b => {
      if (b.status === 'CONFIRMED') {
        const date = new Date(b.bookedAt);
        const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 3600 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          data[6 - diffDays] += b.totalAmount;
        }
      }
    });
    
    const max = Math.max(...data, 1000);
    return data.map((val, i) => ({
      val,
      height: Math.max((val / max) * 100, 5),
      label: days[(today.getDay() - (6 - i) + 7) % 7]
    }));
  };

  const revenueData = getRevenueData();

  return (
    <>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(1.3);}}`}</style>
      <Navbar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)', background: '#f8fafc' }}>
        <aside style={{ width: 220, background: '#fff', borderRight: '1px solid #e2e8f0', padding: '1.5rem 0.875rem', flexShrink: 0 }}>
          <div style={{ marginBottom: '1.5rem', padding: '0 0.625rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>Admin Panel</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Live Dashboard</span>
            </div>
          </div>
          {SIDEBAR_LINKS.map(l => (
            <button key={l.key} onClick={() => setSection(l.key)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.875rem', borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: '0.25rem', transition: 'all 0.15s', background: section === l.key ? 'linear-gradient(135deg,#eff6ff,#f5f3ff)' : 'transparent', color: section === l.key ? '#2563eb' : '#64748b', fontWeight: section === l.key ? 700 : 500, fontSize: '0.875rem', textAlign: 'left' }}>
              <span style={{ color: section === l.key ? '#2563eb' : '#94a3b8' }}>{l.icon}</span>{l.label}
            </button>
          ))}
        </aside>

        <main style={{ flex: 1, padding: '1.75rem', overflow: 'auto' }}>
          {section === 'overview' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Executive Overview</h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Real-time system performance and booking analytics</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '0.4rem 0.75rem', marginRight: '0.5rem' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a' }}>Auto-refreshing (30s)</span>
                  </div>
                  <button onClick={fetchData} style={{ padding: '0.5rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={14} /> Refresh Now
                  </button>
                  <button onClick={handleDownloadReport} style={{ padding: '0.5rem 1rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', fontSize: '0.8rem', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>Download Report</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {STAT_CARDS.map(c => (
                  <div key={c.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>{c.icon}</div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#22c55e', background: '#f0fdf4', padding: '0.2rem 0.5rem', borderRadius: 100 }}>+12%</span>
                    </div>
                    <p style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', lineHeight: 1, marginBottom: '0.25rem' }}>{c.value}</p>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>{c.label}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Revenue Analysis</h3>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.15rem' }}>Last 7 days · Total ₹{totalRev.toLocaleString()}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><div style={{ width: 10, height: 10, borderRadius: 3, background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }} /><span style={{ fontSize: '0.7rem', color: '#64748b' }}>Today</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><div style={{ width: 10, height: 10, borderRadius: 3, background: '#e2e8f0' }} /><span style={{ fontSize: '0.7rem', color: '#64748b' }}>Previous</span></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, paddingBottom: 20 }}>
                      {[100, 75, 50, 25, 0].map(p => {
                        const maxVal = Math.max(...revenueData.map(d => d.val), 1000);
                        return <span key={p} style={{ fontSize: '0.58rem', color: '#cbd5e1', fontWeight: 600 }}>₹{p === 0 ? '0' : ((maxVal * p / 100) / 1000).toFixed(1) + 'k'}</span>;
                      })}
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                      {[0, 25, 50, 75, 100].map(p => (
                        <div key={p} style={{ position: 'absolute', left: 0, right: 0, bottom: `calc(20px + ${p * 1.4}px)`, height: 1, background: '#f1f5f9', zIndex: 0 }} />
                      ))}
                      <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: '6px', paddingBottom: 20, position: 'relative', zIndex: 1 }}>
                        {revenueData.map((d, i) => {
                          const maxVal = Math.max(...revenueData.map(x => x.val), 1000);
                          const barH = Math.max(Math.round((d.val / maxVal) * 120), d.val > 0 ? 6 : 2);
                          return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                              {d.val > 0 && <span style={{ fontSize: '0.55rem', fontWeight: 700, color: i === 6 ? '#2563eb' : '#94a3b8', whiteSpace: 'nowrap' }}>₹{d.val >= 1000 ? (d.val/1000).toFixed(1)+'k' : d.val}</span>}
                              <div
                                title={`₹${d.val.toLocaleString()}`}
                                style={{ width: '100%', height: barH, background: i === 6 ? 'linear-gradient(180deg,#7c3aed,#2563eb)' : '#e2e8f0', borderRadius: '5px 5px 2px 2px', transition: 'height 0.4s ease', cursor: 'default' }}
                              />
                              <span style={{ fontSize: '0.6rem', color: i === 6 ? '#2563eb' : '#94a3b8', fontWeight: 700, marginTop: 2 }}>{d.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>System Health</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { label: 'Server Status', value: 'Operational', color: '#22c55e' },
                      { label: 'Database Latency', value: '24ms', color: '#22c55e' },
                      { label: 'API Response', value: '98.4%', color: '#22c55e' },
                      { label: 'Active Socket Conn.', value: '1,420', color: '#2563eb' },
                    ].map(s => (
                      <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{s.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{s.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
                      <strong style={{ color: '#0f172a' }}>Tip:</strong> System load is currently low. Great time for database maintenance.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Recent Activity Feed</h3>
                  <button onClick={() => setShowAllLogs(true)} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '0.3rem 0.75rem', cursor: 'pointer' }}>View All Logs ({bookings.length})</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {bookings.slice(0, 5).map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: b.status === 'CONFIRMED' ? '#f0fdf4' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                        {b.status === 'CONFIRMED' ? '✅' : '❌'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                          <strong style={{ fontWeight: 700 }}>{b.passengers[0]?.name || 'Unknown'}</strong> {b.status === 'CONFIRMED' ? 'booked' : 'cancelled'} a ticket for <strong style={{ fontWeight: 700 }}>{b.trainName}</strong>
                        </p>
                        <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>PNR: {b.pnr} · {new Date(b.bookedAt).toLocaleTimeString()}</p>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>₹{b.totalAmount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '1.5rem' }}>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.5rem' }}>
                  <h4 style={{ fontWeight: 700, marginBottom: '1.25rem', color: '#0f172a' }}>Booking Status</h4>
                  {[
                    { label: 'Confirmed', count: confirmed,  color: '#22c55e', pct: bookings.length ? Math.round((confirmed / bookings.length) * 100) : 0 },
                    { label: 'Cancelled', count: cancelled,  color: '#dc2626', pct: bookings.length ? Math.round((cancelled / bookings.length) * 100) : 0 },
                    { label: 'Waiting',   count: bookings.length - confirmed - cancelled, color: '#f59e0b', pct: bookings.length ? Math.round(((bookings.length - confirmed - cancelled) / bookings.length) * 100) : 0 },
                  ].map(row => (
                    <div key={row.label} style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.875rem' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{row.label}</span>
                        <span style={{ fontWeight: 700, color: row.color }}>{row.count} ({row.pct}%)</span>
                      </div>
                      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${row.pct}%`, background: row.color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.5rem' }}>
                  <h4 style={{ fontWeight: 700, marginBottom: '1.25rem', color: '#0f172a' }}>Recent Bookings</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {bookings.slice(0, 3).map(b => (
                      <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: 10 }}>
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{b.pnr}</p>
                          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.trainName} · {b.sourceCode}→{b.destinationCode}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>₹{b.totalAmount.toLocaleString()}</p>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 100, background: b.status === 'CONFIRMED' ? '#f0fdf4' : b.status === 'CANCELLED' ? '#fef2f2' : '#fffbeb', color: b.status === 'CONFIRMED' ? '#166534' : b.status === 'CANCELLED' ? '#991b1b' : '#92400e' }}>{b.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {section === 'trains' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Train Routes</h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>All available train routes in the system</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '0.4rem 0.85rem' }}>
                  <CheckCircle size={13} color="#16a34a" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#16a34a' }}>{trains.length} Trains Active</span>
                </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      {['Train', 'Route', 'Type', 'Classes', 'Rating', 'On-time %'].map(h => (
                        <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trains.map((t, i) => (
                      <tr key={t.id} style={{ borderBottom: i < trains.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{t.name}</p>
                          <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>#{t.number}</p>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#334155' }}>{t.sourceCode} → {t.destinationCode}</td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 100, background: '#eff6ff', color: '#2563eb' }}>{t.type}</span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#334155' }}>{t.classes.map(c => c.code).join(', ')}</td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>⭐ {t.rating}</td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem' }}>
                            {t.onTimePercent >= 85 ? <CheckCircle size={13} color="#22c55e" /> : t.onTimePercent >= 75 ? <Clock size={13} color="#f59e0b" /> : <AlertCircle size={13} color="#dc2626" />}
                            <span style={{ fontWeight: 600, color: t.onTimePercent >= 85 ? '#166534' : t.onTimePercent >= 75 ? '#92400e' : '#991b1b' }}>{t.onTimePercent}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {section === 'bookings' && (
            <>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>All Bookings</h2>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      {['PNR', 'Train', 'Route', 'Booked At', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, i) => (
                      <tr key={b.id} style={{ borderBottom: i < bookings.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb' }}>{b.pnr}</p>
                          <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ID: {b.id}</p>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <p style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>{b.trainName}</p>
                          <p style={{ fontSize: '0.72rem', color: '#64748b' }}>{b.passengers[0]?.name} + {b.passengers.length - 1} more</p>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>{b.sourceCode} → {b.destinationCode}</td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{new Date(b.bookedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                          <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{new Date(b.bookedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 100, background: b.status === 'CONFIRMED' ? '#f0fdf4' : b.status === 'CANCELLED' ? '#fef2f2' : '#fffbeb', color: b.status === 'CONFIRMED' ? '#166534' : b.status === 'CANCELLED' ? '#991b1b' : '#92400e' }}>{b.status}</span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                           <button onClick={() => { setSelectedBooking(b); setShowBookingModal(true); }}
                             style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.7rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s' }}>
                             Details
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {section === 'users' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Registered Users</h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>All registered users and their booking activity</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '0.4rem 0.85rem' }}>
                  <Users size={13} color="#2563eb" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb' }}>{users.length} Users</span>
                </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      {['User', 'Email', 'Role', 'Total Bookings', 'Status'].map(h => (
                        <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: u.role === 'ADMIN' ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : 'linear-gradient(135deg,#2563eb,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: '#fff' }}>
                              {u.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>{u.email}</td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 100, background: u.role === 'ADMIN' ? '#f5f3ff' : '#f8fafc', color: u.role === 'ADMIN' ? '#7c3aed' : '#64748b', border: `1px solid ${u.role === 'ADMIN' ? '#ddd6fe' : '#e2e8f0'}` }}>{u.role}</span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{u.bookings}</td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 100, background: u.status === 'active' ? '#f0fdf4' : '#f8fafc', color: u.status === 'active' ? '#166534' : '#94a3b8' }}>{u.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
      {showBookingModal && selectedBooking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 540, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Booking Details</h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>PNR: <strong style={{ color: '#2563eb' }}>{selectedBooking.pnr}</strong></p>
              </div>
              <button onClick={() => setShowBookingModal(false)} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
            </div>
            
            <div style={{ padding: '1.75rem', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Train Information</p>
                  <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{selectedBooking.trainName}</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Train #{selectedBooking.trainNumber} · {selectedBooking.class}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Journey Date</p>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{new Date(selectedBooking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedBooking.sourceCode} → {selectedBooking.destinationCode}</p>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Passenger List ({selectedBooking.passengers.length})</p>
                <div style={{ background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                  {selectedBooking.passengers.map((p, i) => (
                    <div key={i} style={{ padding: '1rem 1.25rem', borderBottom: i < selectedBooking.passengers.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{p.name}</p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.age} yrs · {p.gender} · {p.berthPreference}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb' }}>{selectedBooking.coachNumber}</p>
                        <p style={{ fontSize: '0.72rem', color: '#64748b' }}>Seat {selectedBooking.seatNumbers[i]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', borderRadius: 16, padding: '1.25rem', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                    <CreditCard size={16} color="#64748b" />
                    <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Payment Details</p>
                  </div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>₹{selectedBooking.totalAmount.toLocaleString()}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Via {selectedBooking.paymentMethod}</p>
                </div>
                <div style={{ background: selectedBooking.status === 'CONFIRMED' ? '#f0fdf4' : '#fef2f2', borderRadius: 16, padding: '1.25rem', border: `1px solid ${selectedBooking.status === 'CONFIRMED' ? '#dcfce7' : '#fee2e2'}` }}>
                  <p style={{ fontSize: '0.68rem', fontWeight: 700, color: selectedBooking.status === 'CONFIRMED' ? '#166534' : '#991b1b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Booking Status</p>
                  <p style={{ fontSize: '1rem', fontWeight: 900, color: selectedBooking.status === 'CONFIRMED' ? '#166534' : '#991b1b' }}>{selectedBooking.status}</p>
                  <p style={{ fontSize: '0.72rem', color: '#64748b' }}>{new Date(selectedBooking.bookedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowBookingModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: 700, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showAllLogs && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 700, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }}>
            <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>All System Logs</h3>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>{bookings.length} total events</p>
              </div>
              <button onClick={() => setShowAllLogs(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: '1.1rem' }}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '1rem 1.75rem' }}>
              {bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
                  <p style={{ fontWeight: 600 }}>No activity logs yet</p>
                </div>
              ) : (
                [...bookings].sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()).map((b, i) => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 0', borderBottom: i < bookings.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: b.status === 'CONFIRMED' ? '#f0fdf4' : b.status === 'CANCELLED' ? '#fef2f2' : '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                      {b.status === 'CONFIRMED' ? '✅' : b.status === 'CANCELLED' ? '❌' : '⏳'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', color: '#0f172a', marginBottom: '0.15rem' }}>
                        <strong style={{ fontWeight: 700 }}>{b.passengers[0]?.name || 'Unknown'}</strong>
                        {b.passengers.length > 1 && <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}> +{b.passengers.length - 1} more</span>}
                        {' '}{b.status === 'CONFIRMED' ? 'booked' : b.status === 'CANCELLED' ? 'cancelled' : 'waitlisted'} <strong style={{ fontWeight: 700 }}>{b.trainName}</strong>
                      </p>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        PNR: <span style={{ color: '#2563eb', fontWeight: 700 }}>{b.pnr}</span> · {b.sourceCode}→{b.destinationCode} · {new Date(b.bookedAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>₹{b.totalAmount.toLocaleString()}</p>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 100, background: b.status === 'CONFIRMED' ? '#f0fdf4' : b.status === 'CANCELLED' ? '#fef2f2' : '#fffbeb', color: b.status === 'CONFIRMED' ? '#166534' : b.status === 'CANCELLED' ? '#991b1b' : '#92400e' }}>{b.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', flexShrink: 0 }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Showing all <strong style={{ color: '#0f172a' }}>{bookings.length}</strong> logs</span>
              <button onClick={() => setShowAllLogs(false)} style={{ padding: '0.6rem 1.5rem', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

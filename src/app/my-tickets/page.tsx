'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Booking } from '@/lib/mockData';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { Train, Calendar, MapPin, Users, X, Download, Clock, CheckCircle, RefreshCw } from 'lucide-react';

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  CONFIRMED: { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0', label: 'Confirmed' },
  CANCELLED: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', label: 'Cancelled' },
  WAITING:   { bg: '#fffbeb', color: '#92400e', border: '#fde68a', label: 'Waiting List' },
};

function TicketModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const st = STATUS_STYLES[booking.status];
  return (
    <>
      <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }} onClick={onClose}>
        <div className="modal-content" style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }} onClick={e => e.stopPropagation()}>
          <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', padding: '1.5rem', position: 'relative' }}>
            <button className="modal-close" onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><X size={16} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Train size={20} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.15rem' }}>E-TICKET · {booking.pnr}</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{booking.trainName}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{booking.sourceCode}</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>{booking.source}</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#60a5fa', marginTop: 4 }}>{booking.departure}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', flex: 1, padding: '0 1rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} />{booking.duration}</p>
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.2)' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#60a5fa' }} />
                  <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.2)' }} />
                </div>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>#{booking.trainNumber}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{booking.destinationCode}</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>{booking.destination}</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#60a5fa', marginTop: 4 }}>{booking.arrival}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', background: '#f8fafc' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', border: '1px solid #e2e8f0', marginLeft: -28 }} />
            <div style={{ flex: 1, borderTop: '2px dashed #e2e8f0', margin: '0 0.5rem' }} />
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', border: '1px solid #e2e8f0', marginRight: -28 }} />
          </div>

          <div style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {[
                ['PNR', booking.pnr],
                ['Date', new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })],
                ['Class', booking.class],
                ['Coach', booking.coachNumber],
                ['Seat(s)', booking.seatNumbers?.join(', ') || 'N/A'],
                ['Payment', booking.paymentMethod || 'Online'],
              ].map(([k, v]) => (
                <div key={k}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{k}</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{v}</p>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.625rem' }}>Passengers</p>
              {booking.passengers.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: i < booking.passengers.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{p.name}</p>
                    <p style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.age} yrs · {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'} · {p.berthPreference}</p>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb' }}>Seat {p.seatNumber || 'TBA'}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.2rem' }}>TOTAL PAID</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>₹{booking.totalAmount.toLocaleString()}</p>
              </div>
              <span style={{ padding: '0.375rem 1rem', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
            </div>
          </div>

          {booking.status === 'CONFIRMED' && (
            <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => window.print()} style={{ flex: 1, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', border: 'none', borderRadius: 10, padding: '0.7rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Download size={15} /> Download PDF Ticket
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .modal-overlay { background: none !important; position: absolute; left: 0; top: 0; padding: 0 !important; width: 100%; }
          .modal-content, .modal-content * { visibility: visible; }
          .modal-content { width: 100% !important; max-width: 100% !important; box-shadow: none !important; border: none !important; margin: 0 !important; border-radius: 0 !important; }
          .modal-close, button { display: none !important; }
        }
      `}</style>
    </>
  );
}

export default function MyTicketsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`/api/bookings?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setBookings(Array.isArray(data) ? data : []))
        .catch(() => setBookings([]))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '3.5rem' }}>🎫</div>
          <h2 style={{ color: '#0f172a', fontWeight: 800 }}>Sign in to view your tickets</h2>
          <p style={{ color: '#64748b' }}>Your bookings will appear here after you sign in.</p>
          <button onClick={() => router.push('/auth/login')} style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', border: 'none', borderRadius: 12, padding: '0.75rem 2rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>Sign In</button>
        </div>
      </>
    );
  }

  const todayString = new Date().toISOString().split('T')[0];
  const filtered = bookings.filter(b => {
    if (tab === 'cancelled') return b.status === 'CANCELLED';
    if (tab === 'past') return b.status !== 'CANCELLED' && b.date < todayString;
    return b.status !== 'CANCELLED' && b.date >= todayString;
  });

  const handleCancel = async (id: string) => {
    setCancelling(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'PATCH' });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' as const } : b));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(null);
    }
  };

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', count: bookings.filter(b => b.status !== 'CANCELLED' && b.date >= todayString).length },
    { key: 'past',     label: 'Past',     count: bookings.filter(b => b.status !== 'CANCELLED' && b.date < todayString).length },
    { key: 'cancelled',label: 'Cancelled',count: bookings.filter(b => b.status === 'CANCELLED').length },
  ];

  return (
    <>
      <Navbar />
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .ticket-card:hover{box-shadow:0 8px 32px rgba(37,99,235,0.12);border-color:#bfdbfe!important;transform:translateY(-2px);}
        .cancel-btn:hover{background:#fef2f2!important;border-color:#fca5a5!important;}
      `}</style>
      <main style={{ background: '#f8fafc', minHeight: '80vh', padding: '2rem 0 3rem' }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>My Tickets</h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage all your train bookings and e-tickets</p>
            </div>
            <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                <Users size={14} color="#2563eb" />
                <strong style={{ color: '#0f172a' }}>{bookings.length}</strong> total booking{bookings.length !== 1 ? 's' : ''}
              </div>
              <button onClick={() => {
                setIsLoading(true);
                fetch(`/api/bookings?userId=${user.id}`).then(r => r.json()).then(d => setBookings(Array.isArray(d) ? d : [])).finally(() => setIsLoading(false));
              }} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.625rem', cursor: 'pointer', display: 'flex', color: '#64748b' }}>
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.25rem', background: '#fff', borderRadius: 12, padding: '0.375rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', width: 'fit-content' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
                style={{ padding: '0.5rem 1.25rem', borderRadius: 9, fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: tab === t.key ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : 'transparent', color: tab === t.key ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                {t.label}
                <span style={{ fontSize: '0.7rem', fontWeight: 800, background: tab === t.key ? 'rgba(255,255,255,0.2)' : '#f1f5f9', color: tab === t.key ? '#fff' : '#64748b', padding: '0.1rem 0.4rem', borderRadius: 100 }}>{t.count}</span>
              </button>
            ))}
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
              <p style={{ color: '#64748b' }}>Loading your tickets...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
              <h3 style={{ color: '#334155', marginBottom: '0.5rem' }}>No {tab} tickets</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {tab === 'upcoming' ? 'Book a train to see your upcoming journeys here.' : `You have no ${tab} bookings.`}
              </p>
              {tab === 'upcoming' && (
                <button onClick={() => router.push('/search')} style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', border: 'none', borderRadius: 12, padding: '0.75rem 1.75rem', fontWeight: 700, cursor: 'pointer' }}>Search Trains</button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filtered.map(booking => {
                const st = STATUS_STYLES[booking.status];
                const isUpcoming = booking.date >= todayString && booking.status === 'CONFIRMED';
                return (
                  <div key={booking.id} className="ticket-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', transition: 'all 0.2s' }}>
                    <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', padding: '0.875rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <Train size={16} color="rgba(255,255,255,0.7)" />
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>{booking.trainName}</span>
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>#{booking.trainNumber}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {booking.paymentMethod && (
                          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.6rem', borderRadius: 100 }}>via {booking.paymentMethod}</span>
                        )}
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: 100, background: st.bg, color: st.color }}>{st.label}</span>
                      </div>
                    </div>

                    <div style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <p style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{booking.departure}</p>
                          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb' }}>{booking.sourceCode}</p>
                          <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{booking.source}</p>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                          <p style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={11} />{booking.duration}</p>
                          <div style={{ width: '100%', height: 2, background: 'linear-gradient(90deg,#2563eb,#7c3aed)', borderRadius: 1 }} />
                          <p style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{booking.class}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{booking.arrival}</p>
                          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb' }}>{booking.destinationCode}</p>
                          <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{booking.destination}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: '#64748b' }}>
                          <Calendar size={13} color="#2563eb" />
                          {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: '#64748b' }}>
                          <MapPin size={13} color="#2563eb" />
                          {booking.class} · Coach {booking.coachNumber}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: '#64748b' }}>
                          <Users size={13} color="#2563eb" />
                          {booking.passengers.length} passenger{booking.passengers.length > 1 ? 's' : ''}
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>₹{booking.totalAmount.toLocaleString()}</div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.625rem' }}>
                        <button onClick={() => setSelectedBooking(booking)} style={{ flex: 1, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', border: 'none', borderRadius: 10, padding: '0.625rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                          <CheckCircle size={14} /> View E-Ticket
                        </button>
                        {isUpcoming && (
                          <button className="cancel-btn" onClick={() => handleCancel(booking.id)} disabled={cancelling === booking.id}
                            style={{ background: '#fff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 10, padding: '0.625rem 1rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem', transition: 'all 0.2s' }}>
                            {cancelling === booking.id ? <span style={{ width: 14, height: 14, border: '2px solid #fecaca', borderTopColor: '#dc2626', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> : <X size={14} />}
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      {selectedBooking && <TicketModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />}
    </>
  );
}

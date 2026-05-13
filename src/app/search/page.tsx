'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { STATIONS, Train } from '@/lib/mockData';
import { MapPin, ArrowRightLeft, Calendar, Users, Search, Star, Clock, Zap, Filter, ChevronDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CLASS_FILTERS = ['ALL', '1A', '2A', '3A', 'SL', 'CC', 'EC'];
const SORT_OPTIONS = [
  { value: 'departure', label: 'Departure Time' },
  { value: 'duration', label: 'Duration' },
  { value: 'price', label: 'Price (Low→High)' },
  { value: 'rating', label: 'Rating' },
];
const TRAIN_TYPE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  RAJDHANI:  { label: 'Rajdhani',  color: '#7c3aed', bg: '#f5f3ff' },
  SHATABDI:  { label: 'Shatabdi', color: '#0369a1', bg: '#e0f2fe' },
  SUPERFAST: { label: 'Superfast', color: '#b45309', bg: '#fef3c7' },
  EXPRESS:   { label: 'Express',  color: '#166534', bg: '#dcfce7' },
};

function SearchContent() {
  const params = useSearchParams();
  const router = useRouter();

  const [from, setFrom] = useState(params.get('from') || '');
  const [to, setTo] = useState(params.get('to') || '');
  const [date, setDate] = useState(params.get('date') || new Date().toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState(Number(params.get('passengers')) || 1);
  const [selectedClass, setSelectedClass] = useState(params.get('class') || 'ALL');
  const [sortBy, setSortBy] = useState('departure');
  const [fromSugg, setFromSugg] = useState<typeof STATIONS>([]);
  const [toSugg, setToSugg] = useState<typeof STATIONS>([]);
  const [showFilters, setShowFilters] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const [allTrains, setAllTrains] = useState<Train[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrains = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/trains');
        const data = await res.json();
        setAllTrains(data);
      } catch (error) {
        console.error('Failed to fetch trains', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrains();
  }, []);

  const trains = useMemo(() => {
    let list = allTrains.filter(t => {
      const matchFrom = !from || t.source.toLowerCase().includes(from.toLowerCase()) || t.sourceCode.toLowerCase().includes(from.toLowerCase());
      const matchTo = !to || t.destination.toLowerCase().includes(to.toLowerCase()) || t.destinationCode.toLowerCase().includes(to.toLowerCase());
      const matchClass = selectedClass === 'ALL' || t.classes.some(c => c.code === selectedClass);
      return matchFrom && matchTo && matchClass;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === 'price') return Math.min(...a.classes.map(c => c.basePrice)) - Math.min(...b.classes.map(c => c.basePrice));
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'departure') return a.departure.localeCompare(b.departure);
      return 0;
    });
    return list;
  }, [allTrains, from, to, selectedClass, sortBy]);

  const doSearch = () => {
    router.push(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&passengers=${passengers}&class=${selectedClass}`);
  };

  const swap = () => { const t = from; setFrom(to); setTo(t); };

  return (
    <>
      <Navbar />
      <style>{`
        .train-row:hover{box-shadow:0 4px 20px rgba(0,51,102,0.1);border-color:var(--accent)!important;transform:translateY(-1px);}
        .class-p:hover{border-color:var(--accent)!important;background:#fff8f0!important;}
        .class-p.sel{border-color:var(--accent)!important;background:#fff8f0!important;color:var(--primary)!important;box-shadow: 0 0 0 2px var(--accent);}
        .book-btn:hover{background:var(--accent-dark)!important;transform:translateY(-1px);}
        .sort-sel:focus{outline:none;border-color:var(--primary);}
      `}</style>

      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr 1fr 1fr auto auto', gap: '0.625rem', alignItems: 'flex-end' }}>
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.3rem' }}>From</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                <input value={from} onChange={e => { setFrom(e.target.value); setFromSugg(e.target.value.length >= 1 ? STATIONS.filter(s => s.name.toLowerCase().includes(e.target.value.toLowerCase()) || s.code.toLowerCase().includes(e.target.value.toLowerCase())).slice(0,5) : []); }}
                  placeholder="Origin" style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.6rem 0.75rem 0.6rem 2.25rem', fontSize: '0.875rem', outline: 'none', color: '#0f172a' }} />
              </div>
              {fromSugg.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, marginTop: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                  {fromSugg.map(s => <button key={s.code} onClick={() => { setFrom(s.name); setFromSugg([]); }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1rem', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#0f172a' }}><span>{s.name}</span><span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>{s.code}</span></button>)}
                </div>
              )}
            </div>
            <button onClick={swap} style={{ width: 36, height: 36, borderRadius: '50%', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '0.15rem', color: '#64748b', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563eb'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLButtonElement).style.color = '#64748b'; }}>
              <ArrowRightLeft size={14} />
            </button>
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.3rem' }}>To</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                <input value={to} onChange={e => { setTo(e.target.value); setToSugg(e.target.value.length >= 1 ? STATIONS.filter(s => s.name.toLowerCase().includes(e.target.value.toLowerCase()) || s.code.toLowerCase().includes(e.target.value.toLowerCase())).slice(0,5) : []); }}
                  placeholder="Destination" style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.6rem 0.75rem 0.6rem 2.25rem', fontSize: '0.875rem', outline: 'none', color: '#0f172a' }} />
              </div>
              {toSugg.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, marginTop: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                  {toSugg.map(s => <button key={s.code} onClick={() => { setTo(s.name); setToSugg([]); }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1rem', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#0f172a' }}><span>{s.name}</span><span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>{s.code}</span></button>)}
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.3rem' }}>Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.6rem 0.75rem 0.6rem 2.25rem', fontSize: '0.875rem', outline: 'none', color: '#0f172a' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.3rem' }}>Passengers</label>
              <div style={{ position: 'relative' }}>
                <Users size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.6rem 0.75rem 0.6rem 2.25rem', fontSize: '0.875rem', outline: 'none', color: '#0f172a', appearance: 'none', background: '#fff' }}>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
            </div>
            <button id="search-btn" onClick={doSearch} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '0.6rem 1.25rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', height: 38 }}>
              <Search size={15} /> Search
            </button>
            <button onClick={() => setShowFilters(v => !v)} style={{ background: showFilters ? '#fff8f0' : '#f8fafc', color: showFilters ? 'var(--primary)' : '#64748b', border: `1px solid ${showFilters ? 'var(--accent)' : '#e2e8f0'}`, borderRadius: 10, padding: '0.6rem 1rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', height: 38 }}>
              <Filter size={14} /><ChevronDown size={12} />
            </button>
          </div>

          {showFilters && (
            <div style={{ marginTop: '0.875rem', padding: '0.875rem', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Class</p>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {CLASS_FILTERS.map(c => (
                    <button key={c} className={`class-p${selectedClass === c ? ' sel' : ''}`} onClick={() => setSelectedClass(c)}
                      style={{ padding: '0.3rem 0.75rem', border: `1px solid ${selectedClass === c ? '#2563eb' : '#e2e8f0'}`, borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, background: selectedClass === c ? '#eff6ff' : '#fff', color: selectedClass === c ? '#2563eb' : '#64748b', cursor: 'pointer', transition: 'all 0.15s' }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Sort By</p>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-sel"
                  style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.3rem 0.75rem', fontSize: '0.8rem', background: '#fff', color: '#0f172a', cursor: 'pointer' }}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <main style={{ padding: '1.5rem 0 3rem', background: '#f8fafc', minHeight: '60vh' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              <strong style={{ color: '#0f172a' }}>{trains.length}</strong> train{trains.length !== 1 ? 's' : ''} found
              {from && to ? ` · ${from} → ${to}` : ''}
            </p>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Searching trains...</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : trains.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚂</div>
              <h3 style={{ color: '#334155', marginBottom: '0.5rem' }}>No trains found</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Try adjusting your search — change the route or class filter.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {trains.map(train => <TrainCard key={train.id} train={train} date={date} passengers={passengers} />)}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function TrainCard({ train, date, passengers }: { train: Train; date: string; passengers: number }) {
  const [selectedClass, setSelectedClass] = useState('');
  const badge = TRAIN_TYPE_BADGE[train.type];
  const minPrice = Math.min(...train.classes.map(c => c.basePrice));

  return (
    <div className="train-row" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem 1.5rem', transition: 'all 0.2s', cursor: 'default' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{train.name}</h3>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 100, background: badge.bg, color: badge.color }}>{badge.label}</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>#{train.number} · {train.distance} km · Runs: {train.days.join(', ')}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: 'flex-end', marginBottom: '0.2rem' }}>
            <Star size={13} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{train.rating}</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            <Zap size={11} style={{ display: 'inline', marginRight: 2, color: '#22c55e' }} />
            {train.onTimePercent}% on time
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{train.departure}</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', marginTop: '0.25rem' }}>{train.sourceCode}</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{train.source}</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={12} />{train.duration}
          </div>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, #2563eb, #7c3aed)', borderRadius: 1 }} />
            <ArrowRight size={14} color="#7c3aed" />
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{train.arrival}</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', marginTop: '0.25rem' }}>{train.destinationCode}</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{train.destination}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {train.classes.map(cls => (
            <button key={cls.code} className={`class-p${selectedClass === cls.code ? ' sel' : ''}`} onClick={() => setSelectedClass(cls.code === selectedClass ? '' : cls.code)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.45rem 0.875rem', border: `1px solid ${selectedClass === cls.code ? '#2563eb' : '#e2e8f0'}`, borderRadius: 10, background: selectedClass === cls.code ? '#eff6ff' : '#f8fafc', cursor: 'pointer', transition: 'all 0.15s', minWidth: 70 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: selectedClass === cls.code ? '#1d4ed8' : '#334155' }}>{cls.code}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: selectedClass === cls.code ? '#2563eb' : '#0f172a' }}>₹{cls.basePrice.toLocaleString()}</span>
              <span style={{ fontSize: '0.62rem', color: cls.available > 0 ? '#16a34a' : cls.status === 'RAC' ? '#d97706' : '#dc2626', fontWeight: 600 }}>
                {cls.available > 0 ? `${cls.available} avail` : cls.status === 'RAC' ? 'RAC' : `WL (${Math.floor(Math.random() * 40 + 50)}% prob)`}
              </span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem' }}>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Starts from <strong style={{ color: '#0f172a' }}>₹{minPrice.toLocaleString()}</strong></p>
          <Link href={`/booking/${train.id}?date=${date}&passengers=${passengers}&class=${selectedClass || train.classes[0]?.code}`}
            className="book-btn"
            style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', border: 'none', borderRadius: 10, padding: '0.6rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', transition: 'all 0.2s' }}>
            Book Now <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>}>
      <SearchContent />
    </Suspense>
  );
}

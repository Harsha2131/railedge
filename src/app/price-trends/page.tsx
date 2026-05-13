'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import { PRICE_TREND_DATA, generateCalendarData, STATIONS } from '@/lib/mockData';
import { TrendingUp, TrendingDown, Calendar, Info } from 'lucide-react';

const INSIGHTS = [
  { icon: '📅', title: 'Best days to travel', desc: 'Mondays and Tuesdays are typically 15–20% cheaper than weekends.', color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0' },
  { icon: '📈', title: 'Avoid festive dates', desc: 'Prices spike 40–80% around Diwali, Holi and long weekends.', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  { icon: '⏰', title: 'Book 30–45 days early', desc: 'Booking in advance saves an average of ₹800 per ticket.', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  { icon: '🌙', title: 'Night trains are cheaper', desc: 'Overnight trains (dep. 21:00–03:00) cost 10–12% less on average.', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
];

function PriceChart({ data }: { data: typeof PRICE_TREND_DATA }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<{ x: number; y: number; label: string; values: string[] } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.offsetWidth;
    const H = 260;
    canvas.width = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const PAD = { top: 20, right: 20, bottom: 40, left: 55 };
    const cW = W - PAD.left - PAD.right;
    const cH = H - PAD.top - PAD.bottom;
    const N = data.labels.length;

    const allPrices = data.datasets.flatMap(d => d.prices);
    const minP = Math.min(...allPrices) * 0.9;
    const maxP = Math.max(...allPrices) * 1.05;

    const toX = (i: number) => PAD.left + (i / (N - 1)) * cW;
    const toY = (p: number) => PAD.top + cH - ((p - minP) / (maxP - minP)) * cH;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = PAD.top + (cH / 4) * i;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + cW, y); ctx.stroke();
      const val = maxP - ((maxP - minP) / 4) * i;
      ctx.fillStyle = '#94a3b8'; ctx.font = '11px Inter,sans-serif'; ctx.textAlign = 'right';
      ctx.fillText('₹' + Math.round(val).toLocaleString(), PAD.left - 6, y + 4);
    }

    // X labels
    ctx.fillStyle = '#94a3b8'; ctx.textAlign = 'center';
    const step = Math.floor(N / 6);
    for (let i = 0; i < N; i += step) {
      ctx.fillText(data.labels[i], toX(i), H - 10);
    }

    const COLORS = [['#2563eb', '#7c3aed'], ['#0891b2', '#06b6d4'], ['#16a34a', '#22c55e']];
    data.datasets.forEach((ds, di) => {
      const [c1, c2] = COLORS[di];
      // Area fill
      const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + cH);
      grad.addColorStop(0, c1 + '30'); grad.addColorStop(1, c1 + '00');
      ctx.beginPath();
      ds.prices.forEach((p, i) => i === 0 ? ctx.moveTo(toX(i), toY(p)) : ctx.lineTo(toX(i), toY(p)));
      ctx.lineTo(toX(N - 1), PAD.top + cH); ctx.lineTo(toX(0), PAD.top + cH); ctx.closePath();
      ctx.fillStyle = grad; ctx.fill();
      // Line
      const lineGrad = ctx.createLinearGradient(PAD.left, 0, PAD.left + cW, 0);
      lineGrad.addColorStop(0, c1); lineGrad.addColorStop(1, c2);
      ctx.beginPath(); ctx.strokeStyle = lineGrad; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
      ds.prices.forEach((p, i) => i === 0 ? ctx.moveTo(toX(i), toY(p)) : ctx.lineTo(toX(i), toY(p)));
      ctx.stroke();
    });
  }, [data]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: 260, display: 'block' }} onMouseLeave={() => setHovered(null)}
        onMouseMove={e => {
          const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const N = data.labels.length;
          const PAD_L = 55, PAD_R = 20;
          const cW = rect.width - PAD_L - PAD_R;
          const idx = Math.round(((mx - PAD_L) / cW) * (N - 1));
          if (idx >= 0 && idx < N) {
            setHovered({ x: mx, y: e.clientY - rect.top, label: data.labels[idx], values: data.datasets.map(d => '₹' + d.prices[idx].toLocaleString()) });
          }
        }}
      />
      {hovered && (
        <div style={{ position: 'absolute', left: Math.min(hovered.x + 12, 280), top: hovered.y - 10, background: '#0f172a', color: '#fff', borderRadius: 10, padding: '0.625rem 0.875rem', fontSize: '0.78rem', pointerEvents: 'none', zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
          <p style={{ fontWeight: 700, marginBottom: '0.4rem', color: '#93c5fd' }}>{hovered.label}</p>
          {data.datasets.map((ds, i) => <p key={i} style={{ color: i === 0 ? '#93c5fd' : i === 1 ? '#67e8f9' : '#86efac', marginBottom: '0.15rem' }}>{ds.label}: {hovered.values[i]}</p>)}
        </div>
      )}
    </div>
  );
}

function PriceCalendar() {
  const [data] = useState(() => generateCalendarData());
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const levelStyle = {
    cheap:    { bg: '#dcfce7', color: '#166534', border: '#86efac' },
    moderate: { bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
    expensive:{ bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '0.25rem', marginBottom: '0.5rem' }}>
        {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', padding: '0.25rem 0' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '0.25rem' }}>
        {data.map((day, i) => {
          const s = levelStyle[day.level];
          return (
            <div key={i} title={`${day.month} ${day.day} · ₹${day.price}`}
              style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: `1px solid ${day.isPast ? '#e2e8f0' : s.border}`, background: day.isPast ? '#f8fafc' : s.bg, opacity: day.isPast ? 0.4 : 1, cursor: day.isPast ? 'not-allowed' : 'pointer', transition: 'transform 0.15s', fontSize: '0.75rem', gap: '0.1rem' }}
              onMouseEnter={e => { if (!day.isPast) (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}>
              <span style={{ fontWeight: 800, color: day.isPast ? '#94a3b8' : s.color, lineHeight: 1 }}>{day.day}</span>
              {!day.isPast && <span style={{ fontSize: '0.5rem', color: s.color, fontWeight: 600 }}>₹{(day.price / 100).toFixed(0)}h</span>}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.875rem' }}>
        {[['cheap', '#dcfce7', '#166534', 'Cheap'], ['moderate', '#fef9c3', '#854d0e', 'Moderate'], ['expensive', '#fee2e2', '#991b1b', 'Expensive']].map(([, bg, color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#64748b' }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: bg as string, border: `1px solid ${color}` }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PriceTrendsPage() {
  const [fromStation, setFromStation] = useState('New Delhi');
  const [toStation, setToStation] = useState('Mumbai Central');

  const trendData = useMemo(() => {
    // Generate varied prices based on the route
    const seed = (fromStation.length + toStation.length) % 10;
    const factor = 1 + (seed * 0.05);
    return {
      ...PRICE_TREND_DATA,
      datasets: PRICE_TREND_DATA.datasets.map(ds => ({
        ...ds,
        prices: ds.prices.map(p => Math.round(p * factor))
      }))
    };
  }, [fromStation, toStation]);

  const mainPrices = trendData.datasets[0].prices;
  const currentPrice = mainPrices[0];
  const minPrice = Math.min(...mainPrices);
  const maxPrice = Math.max(...mainPrices);
  const avgPrice = Math.round(mainPrices.reduce((a, b) => a + b, 0) / mainPrices.length);
  const trend = mainPrices[14] > currentPrice ? 'rising' : 'falling';

  return (
    <>
      <Navbar />
      <main style={{ background: '#f8fafc', minHeight: '80vh', padding: '2rem 0 3rem' }}>
        <div className="container">
          {/* Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.375rem' }}>Price Trends & Analysis</h1>
            <p style={{ color: '#64748b' }}>AI-powered fare predictions to help you book at the best time</p>
          </div>

          {/* Route selector */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1 }}>
              <select value={fromStation} onChange={e => setFromStation(e.target.value)} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.6rem 1rem', fontSize: '0.875rem', color: '#0f172a', background: '#f8fafc', cursor: 'pointer', outline: 'none' }}>
                {STATIONS.map(s => <option key={s.code} value={s.name}>{s.name}</option>)}
              </select>
              <span style={{ color: '#94a3b8', fontWeight: 700 }}>→</span>
              <select value={toStation} onChange={e => setToStation(e.target.value)} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.6rem 1rem', fontSize: '0.875rem', color: '#0f172a', background: '#f8fafc', cursor: 'pointer', outline: 'none' }}>
                {STATIONS.map(s => <option key={s.code} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: trend === 'rising' ? '#dc2626' : '#22c55e', fontWeight: 700 }}>
              {trend === 'rising' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              Prices are {trend} in the next 2 weeks
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Current Price', value: `₹${currentPrice.toLocaleString()}`, sub: '2nd AC', color: '#2563eb', bg: '#eff6ff' },
              { label: 'Lowest in 30d', value: `₹${minPrice.toLocaleString()}`, sub: 'Book now!', color: '#22c55e', bg: '#f0fdf4' },
              { label: 'Highest in 30d', value: `₹${maxPrice.toLocaleString()}`, sub: 'Peak price', color: '#dc2626', bg: '#fef2f2' },
              { label: 'Average Price', value: `₹${avgPrice.toLocaleString()}`, sub: 'Per ticket', color: '#7c3aed', bg: '#f5f3ff' },
            ].map(card => (
              <div key={card.label} style={{ background: card.bg, border: `1px solid ${card.color}30`, borderRadius: 14, padding: '1.1rem 1.25rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: card.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>{card.label}</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', lineHeight: 1, marginBottom: '0.2rem' }}>{card.value}</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{card.sub}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Chart */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>30-Day Price Forecast</h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{fromStation} → {toStation}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {trendData.datasets.map((ds, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#64748b' }}>
                        <div style={{ width: 24, height: 3, borderRadius: 2, background: ['linear-gradient(90deg,#2563eb,#7c3aed)', 'linear-gradient(90deg,#0891b2,#06b6d4)', 'linear-gradient(90deg,#16a34a,#22c55e)'][i] }} />
                        {ds.label}
                      </div>
                    ))}
                  </div>
                </div>
                <PriceChart data={trendData} />
              </div>

              {/* Insights */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                  <Info size={18} color="#2563eb" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>AI Booking Insights</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  {INSIGHTS.map(ins => (
                    <div key={ins.title} style={{ background: ins.bg, border: `1px solid ${ins.border}`, borderRadius: 12, padding: '1rem' }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{ins.icon}</div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: ins.color, marginBottom: '0.375rem' }}>{ins.title}</h4>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>{ins.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem', position: 'sticky', top: 80 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                <Calendar size={18} color="#2563eb" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Price Calendar</h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1rem' }}>Tap a date to see available trains at that price level</p>
              <PriceCalendar />
              <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius: 12 }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>💡 AI Recommendation</p>
                <p style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, lineHeight: 1.5 }}>
                  Book <span style={{ color: '#60a5fa' }}>Monday or Tuesday</span> departures for the lowest fares on this route. Current prices are at their <span style={{ color: '#86efac' }}>seasonal low</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

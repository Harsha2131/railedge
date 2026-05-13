'use client';

import { useParams, useSearchParams, useRouter, notFound } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { AI_SUGGESTIONS, Train as TrainType } from '@/lib/mockData';
import { useAuth } from '@/lib/authContext';
import { User, ChevronRight, Sparkles, CheckCircle, AlertTriangle, Train } from 'lucide-react';

const BERTHS = ['No Preference', 'Lower', 'Upper', 'Middle', 'Side Lower', 'Side Upper', 'Window'];
const GENDERS = [{ v: 'M', l: 'Male' }, { v: 'F', l: 'Female' }, { v: 'O', l: 'Other' }];

function BookingContent() {
  const { trainId } = useParams<{ trainId: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [train, setTrain] = useState<TrainType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [passengers, setPassengers] = useState<{name:string, age:string, gender:'M'|'F'|'O', berthPreference:string}[]>([]);
  const [aiSeat, setAiSeat] = useState(AI_SUGGESTIONS[0]);
  const [confirmed, setConfirmed] = useState(false);
  const [pnr, setPnr] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi'|'card'|'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('SBI');

  useEffect(() => {
    const fetchTrain = async () => {
      try {
        const res = await fetch('/api/trains');
        const data: TrainType[] = await res.json();
        const found = data.find(t => t.id === trainId);
        setTrain(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrain();
  }, [trainId]);

  useEffect(() => {
    if (train) {
      const passengerCount = Number(params.get('passengers') || 1);
      setPassengers(
        Array.from({ length: passengerCount }, (_, i) => ({
          name: i === 0 && user ? user.name : '',
          age: '',
          gender: 'M' as const,
          berthPreference: 'No Preference',
        }))
      );
    }
  }, [train, user, params]);

  if (isLoading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if (!train) return notFound();

  const classCode = params.get('class') || train.classes[0]?.code;
  const date = params.get('date') || new Date().toISOString().split('T')[0];
  const passengerCount = Number(params.get('passengers') || 1);
  const trainClass = train.classes.find(c => c.code === classCode) || train.classes[0];

  const total = trainClass.basePrice * passengerCount;
  const convenience = Math.round(total * 0.018);
  const grandTotal = total + convenience;

  const updatePassenger = (i: number, field: string, val: string) => {
    setPassengers(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  };

  const handlePayment = async () => {
    if (!user) { router.push('/auth/login'); return; }
    const methodLabel = paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'card' ? 'Card' : 'Net Banking';
    setStep(4);
    try {
      const payload = {
        userId: user.id,
        trainName: train.name,
        trainNumber: train.number,
        source: train.source,
        sourceCode: train.sourceCode,
        destination: train.destination,
        destinationCode: train.destinationCode,
        departure: train.departure,
        arrival: train.arrival,
        date,
        class: trainClass.name,
        passengers: passengers.map(p => ({
          name: p.name,
          age: Number(p.age),
          gender: p.gender,
          berthPreference: p.berthPreference,
          seatNumber: aiSeat.seat,
        })),
        totalAmount: grandTotal,
        duration: train.duration,
        coachNumber: aiSeat.seat.split('-')[1]?.trim() || 'C1',
        seatNumbers: passengers.map((_, i) => `${parseInt(aiSeat.seat.split('-')[0] || '1') + i}`),
        paymentMethod: methodLabel,
        status: trainClass.available <= 0 ? 'WAITING' : 'CONFIRMED'
      };
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const saved = await res.json();
      setPnr(saved.pnr);
      setTimeout(() => setConfirmed(true), 1500);
    } catch (err) {
      console.error(err);
      setPnr('PNR' + Math.floor(Math.random() * 9000000 + 1000000));
      setTimeout(() => setConfirmed(true), 1800);
    }
  };

  if (step === 3) {
    const paymentValid = paymentMethod === 'upi' ? upiId.includes('@') : paymentMethod === 'card' ? cardNum.length === 16 && cardExpiry && cardCvv.length === 3 : true;
    return (
      <>
        <Navbar />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} .pay-tab.active{background:linear-gradient(135deg,#2563eb,#7c3aed)!important;color:#fff!important;border-color:transparent!important;} .pay-field:focus{border-color:#2563eb!important;outline:none;box-shadow:0 0 0 3px rgba(37,99,235,0.1);}`}</style>
        <main style={{ background: '#f8fafc', padding: '2rem 0 3rem', minHeight: '80vh' }}>
          <div className="container" style={{ maxWidth: 700 }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <span style={{ fontSize: '1.75rem' }}>💳</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.375rem' }}>Secure Payment</h2>
              <p style={{ color: '#64748b' }}>Total: <strong style={{ color: '#2563eb', fontSize: '1.1rem' }}>₹{grandTotal.toLocaleString()}</strong> · {train.name} · {passengers.length} Passenger{passengers.length > 1 ? 's' : ''}</p>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
                {([['upi','📱 UPI'],['card','💳 Card'],['netbanking','🏦 Net Banking']] as const).map(([key, label]) => (
                  <button key={key} onClick={() => setPaymentMethod(key)}
                    style={{ flex: 1, padding: '1rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', background: paymentMethod === key ? '#eff6ff' : '#f8fafc', color: paymentMethod === key ? '#2563eb' : '#64748b', borderBottom: paymentMethod === key ? '2px solid #2563eb' : '2px solid transparent', transition: 'all 0.2s' }}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ padding: '2rem' }}>
                {paymentMethod === 'upi' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                      <div style={{ width: 220, height: 220, background: '#f8fafc', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', border: '2px solid #e2e8f0' }}>
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=railedge-payment" alt="QR Code" style={{ width: 180, height: 180 }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.25rem' }}>Scan QR Code to Pay</p>
                      <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Open GPay, PhonePe, or Paytm on your phone to scan</p>
                    </div>
                    
                    <div style={{ width: '100%', height: 1, background: '#f1f5f9' }} />
                    
                    <div style={{ width: '100%', maxWidth: 340 }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Or use UPI ID</label>
                      <input className="pay-field" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi"
                        style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0.7rem 1rem', fontSize: '0.95rem', color: '#0f172a', transition: 'all 0.2s' }} />
                    </div>
                  </div>
                )}
                {paymentMethod === 'card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400, margin: '0 auto' }}>
                    <div style={{ background: 'linear-gradient(135deg,#1e3a5f,#312e81)', borderRadius: 16, padding: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>
                      <p style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '1rem' }}>CREDIT / DEBIT CARD</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '1rem' }}>{cardNum ? cardNum.match(/.{1,4}/g)?.join(' ') : '•••• •••• •••• ••••'}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span>{cardExpiry || 'MM/YY'}</span><span style={{ opacity: 0.6 }}>VALID THRU</span>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Card Number</label>
                      <input className="pay-field" value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g,'').slice(0,16))} placeholder="1234567812345678" maxLength={16}
                        style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0.7rem 1rem', fontSize: '0.95rem', color: '#0f172a', transition: 'all 0.2s' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Expiry (MM/YY)</label>
                        <input className="pay-field" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="MM/YY" maxLength={5}
                          style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0.7rem 1rem', fontSize: '0.95rem', color: '#0f172a', transition: 'all 0.2s' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>CVV</label>
                        <input className="pay-field" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g,'').slice(0,3))} placeholder="•••" maxLength={3} type="password"
                          style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0.7rem 1rem', fontSize: '0.95rem', color: '#0f172a', transition: 'all 0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                {paymentMethod === 'netbanking' && (
                  <div style={{ maxWidth: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {['SBI','HDFC','ICICI','Axis','Kotak','PNB'].map(bank => (
                        <button key={bank} onClick={() => setSelectedBank(bank)}
                          style={{ padding: '0.875rem', border: `2px solid ${selectedBank === bank ? '#2563eb' : '#e2e8f0'}`, borderRadius: 12, background: selectedBank === bank ? '#eff6ff' : '#f8fafc', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', color: selectedBank === bank ? '#2563eb' : '#334155', transition: 'all 0.15s' }}>
                          {bank}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>Other banks also supported</p>
                  </div>
                )}

                <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setStep(2)} style={{ flex: 1, background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>← Back</button>
                  <button onClick={handlePayment} disabled={!paymentValid}
                    style={{ flex: 2, background: paymentValid ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : '#e2e8f0', color: paymentValid ? '#fff' : '#94a3b8', border: 'none', borderRadius: 12, padding: '0.875rem', fontWeight: 700, cursor: paymentValid ? 'pointer' : 'not-allowed', fontSize: '0.95rem', transition: 'all 0.2s' }}>
                    Pay ₹{grandTotal.toLocaleString()} Securely 🔒
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <span>🔒</span> 256-bit SSL encrypted · PCI DSS compliant
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (step === 4) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#f8fafc' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '3rem 2rem', maxWidth: 480, width: '100%', textAlign: 'center' }}>
            {!confirmed ? (
              <>
                <div style={{ width: 60, height: 60, border: '4px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1.5rem' }} />
                <h2 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Processing Payment…</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Securing your seats on {train.name}</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </>
            ) : (
              <>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '3px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <CheckCircle size={44} color="#22c55e" />
                </div>
                <h2 style={{ color: '#0f172a', marginBottom: '0.375rem', fontSize: '1.5rem', fontWeight: 800 }}>Booking Confirmed! 🎉</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Your ticket has been booked successfully</p>
                <div style={{ background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)', border: '2px dashed #c4b5fd', borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', marginBottom: '0.25rem' }}>PNR Number</p>
                  <p style={{ fontSize: '1.9rem', fontWeight: 900, color: '#2563eb', letterSpacing: '0.1em' }}>{pnr}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                  {[
                    ['Train', train.name],
                    ['Date', new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })],
                    ['Class', `${trainClass.name} (${trainClass.code})`],
                    ['Seat', aiSeat.seat],
                    ['Passengers', `${passengerCount}`],
                    ['Amount Paid', `₹${grandTotal.toLocaleString()}`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.625rem 0.875rem' }}>
                      <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{k}</p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{v}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => router.push('/my-tickets')} style={{ flex: 1, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', border: 'none', borderRadius: 12, padding: '0.875rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>View My Tickets</button>
                  <button onClick={() => router.push('/')} style={{ flex: 1, background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.875rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Home</button>
                </div>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .step-field:focus{border-color:#2563eb!important;box-shadow:0 0 0 3px rgba(37,99,235,0.1)!important;outline:none;}`}</style>
      <main style={{ background: '#f8fafc', padding: '1.75rem 0 3rem' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', background: '#fff', borderRadius: 14, padding: '1rem 1.5rem', border: '1px solid #e2e8f0' }}>
            {[{ n: 1, l: 'Passenger Details' }, { n: 2, l: 'Review & Pay' }, { n: 3, l: 'Payment' }].map((s, i, arr) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= s.n ? (step > s.n ? '#22c55e' : 'linear-gradient(135deg,#2563eb,#7c3aed)') : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: step >= s.n ? '#fff' : '#94a3b8', flexShrink: 0 }}>
                    {step > s.n ? '✓' : s.n}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: step >= s.n ? '#0f172a' : '#94a3b8' }}>{s.l}</span>
                </div>
                {i < arr.length - 1 && <div style={{ flex: 1, height: 2, background: step > s.n ? '#22c55e' : '#e2e8f0', margin: '0 1rem', borderRadius: 1 }} />}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
            <div>
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {passengers.map((p, i) => (
                    <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={15} color="#fff" />
                        </div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Passenger {i + 1}</h4>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                        <div style={{ gridColumn: '1/-1' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>Full Name *</label>
                          <input className="step-field" value={p.name} onChange={e => updatePassenger(i, 'name', e.target.value)} placeholder="Enter full name"
                            style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.9rem', color: '#0f172a', transition: 'all 0.2s', background: '#fff' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>Age *</label>
                          <input className="step-field" type="number" min="1" max="120" value={p.age} onChange={e => updatePassenger(i, 'age', e.target.value)} placeholder="Age"
                            style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.9rem', color: '#0f172a', transition: 'all 0.2s', background: '#fff' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>Gender *</label>
                          <select className="step-field" value={p.gender} onChange={e => updatePassenger(i, 'gender', e.target.value)}
                            style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.9rem', color: '#0f172a', transition: 'all 0.2s', background: '#fff', appearance: 'none' }}>
                            {GENDERS.map(g => <option key={g.v} value={g.v}>{g.l}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn: '1/-1' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>Berth Preference</label>
                          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                            {BERTHS.map(b => (
                              <button key={b} onClick={() => updatePassenger(i, 'berthPreference', b)}
                                style={{ padding: '0.3rem 0.7rem', border: `1px solid ${p.berthPreference === b ? '#2563eb' : '#e2e8f0'}`, borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, background: p.berthPreference === b ? '#eff6ff' : '#f8fafc', color: p.berthPreference === b ? '#2563eb' : '#64748b', cursor: 'pointer', transition: 'all 0.15s' }}>
                                {b}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', borderRadius: 16, padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={18} color="#fff" />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>AI Seat Suggestions</h4>
                        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>Personalized picks based on your journey</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {AI_SUGGESTIONS.map((s, i) => (
                        <button key={i} onClick={() => setAiSeat(s)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', borderRadius: 12, border: `2px solid ${aiSeat === s ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`, background: aiSeat === s ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', width: '100%' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.25rem' }}>{s.icon}</span>
                            <div>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{s.label}</span>
                                {s.isBest && <span style={{ fontSize: '0.62rem', fontWeight: 700, background: '#22c55e', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: 100 }}>BEST</span>}
                              </div>
                              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.2rem' }}>{s.berth} · {s.seat}</p>
                              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{s.reason}</p>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '1rem', fontWeight: 900, color: aiSeat === s ? '#60a5fa' : 'rgba(255,255,255,0.6)' }}>{s.score}</div>
                            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)' }}>score</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => setStep(2)}
                    disabled={passengers.some(p => !p.name || !p.age)}
                    style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', border: 'none', borderRadius: 12, padding: '0.9rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: passengers.some(p => !p.name || !p.age) ? 0.6 : 1, transition: 'all 0.2s' }}>
                    Continue to Review <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem' }}>
                    <h4 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Train size={18} color="#2563eb" /> Journey Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem' }}>
                      {[
                        ['Train', `${train.name} (${train.number})`],
                        ['Date', new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })],
                        ['Class', `${trainClass.name} (${trainClass.code})`],
                        ['Departure', train.departure],
                        ['Arrival', train.arrival],
                        ['Duration', train.duration],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{k}</p>
                          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem' }}>
                    <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Passenger Summary</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {passengers.map((p, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: i < passengers.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                          <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{p.name || `Passenger ${i + 1}`}</p>
                            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.age} yrs · {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'} · {p.berthPreference}</p>
                          </div>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>₹{trainClass.basePrice.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem' }}>
                    <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>AI Selected Seat</h4>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '0.875rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.5rem' }}>{aiSeat.icon}</span>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#166534' }}>{aiSeat.berth} · {aiSeat.seat}</p>
                        <p style={{ fontSize: '0.78rem', color: '#22c55e' }}>{aiSeat.reason}</p>
                      </div>
                    </div>
                  </div>

                  {!user && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '0.875rem', display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                      <AlertTriangle size={18} color="#d97706" />
                      <p style={{ fontSize: '0.85rem', color: '#92400e' }}>You need to <a href="/auth/login" style={{ color: '#2563eb', fontWeight: 700 }}>log in</a> to complete your booking.</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => setStep(1)} style={{ flex: 1, background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.9rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>← Back</button>
                    <button onClick={() => { if (!user) { router.push('/auth/login'); return; } setStep(3); }} style={{ flex: 2, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', border: 'none', borderRadius: 12, padding: '0.9rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
                      Proceed to Payment →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem', position: 'sticky', top: 80 }}>
              <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Price Breakdown</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: '#64748b' }}>Base fare × {passengerCount}</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{total.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: '#64748b' }}>Convenience fee</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{convenience.toLocaleString()}</span>
                </div>
                <div style={{ height: 1, background: '#e2e8f0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Total</span>
                  <span style={{ fontWeight: 900, color: '#2563eb', fontSize: '1.15rem' }}>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <CheckCircle size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: '0.78rem', color: '#166534', lineHeight: 1.5 }}>Free cancellation up to 4 hours before departure. Full refund guaranteed.</p>
              </div>
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#eff6ff', borderRadius: 10 }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1d4ed8', marginBottom: '0.25rem' }}>📄 PDF Ticket</p>
                <p style={{ fontSize: '0.72rem', color: '#3b82f6' }}>E-ticket will be sent to your registered email after booking</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}>
      <BookingContent />
    </Suspense>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Train, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColor = ['transparent', '#ef4444', '#f59e0b', '#22c55e'][passwordStrength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][passwordStrength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signup(name, email, password);
    setLoading(false);
    if (result.success) router.push('/');
    else setError(result.error || 'Signup failed');
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '15%', right: '8%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '8%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)' }} />
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .su-inp:focus{border-color:#3b82f6!important;box-shadow:0 0 0 3px rgba(59,130,246,0.2)!important;}`}</style>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}>
              <Train size={22} color="#fff" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>RailEdge</span>
          </Link>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '2.25rem 2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.375rem' }}>Create Account</h1>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>Start booking smarter with RailEdge</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {['AI seat suggestions', 'PDF e-tickets', 'Price predictions', 'Instant booking'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)' }}>
                <CheckCircle size={12} color="#22c55e" />{f}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { id: 'signup-name', label: 'Full Name', type: 'text', value: name, setValue: setName, icon: <User size={15} />, placeholder: 'Rahul Sharma' },
              { id: 'signup-email', label: 'Email Address', type: 'email', value: email, setValue: setEmail, icon: <Mail size={15} />, placeholder: 'you@example.com' },
            ].map(field => (
              <div key={field.id}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: '0.375rem' }}>{field.label}</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none', display: 'flex' }}>{field.icon}</span>
                  <input id={field.id} type={field.type} className="su-inp" placeholder={field.placeholder} value={field.value} onChange={e => field.setValue(e.target.value)} required
                    style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '0.75rem 0.875rem 0.75rem 2.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s' }} />
                </div>
              </div>
            ))}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: '0.375rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
                <input id="signup-password" type={showPassword ? 'text' : 'password'} className="su-inp" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '0.75rem 2.75rem 0.75rem 2.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s' }} />
                <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0, display: 'flex' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {password.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
                    {[1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= passwordStrength ? strengthColor : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />)}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: strengthColor }}>{strengthLabel} password</span>
                </div>
              )}
            </div>

            {error && <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, padding: '0.625rem 0.875rem', fontSize: '0.85rem', color: '#fca5a5' }}>{error}</div>}

            <button id="signup-submit-btn" type="submit" disabled={loading}
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', border: 'none', borderRadius: 12, padding: '0.875rem', fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}>
              {loading
                ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                : <><span>Create Account</span><ArrowRight size={17} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', marginTop: '1.5rem' }}>
            Already have an account?{' '}<Link href="/auth/login" style={{ color: '#60a5fa', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

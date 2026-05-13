'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Train, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleDemo = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);
    const result = await login(demoEmail, demoPass);
    setLoading(false);
    if (result.success) router.push('/');
  };

  return (
    <div className="auth-page" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', animation: 'pulse 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', animation: 'pulse 8s ease-in-out infinite 2s' }} />
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.1); opacity: 1; } }
        @keyframes trainRide { 0% { transform: translateX(-20px); } 100% { transform: translateX(20px); } }
        .demo-btn:hover { background: rgba(37,99,235,0.3) !important; transform: translateY(-1px); }
        .auth-input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.2) !important; }
        .login-submit:hover:not(:disabled) { background: #1d4ed8 !important; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(37,99,235,0.4) !important; }
        .login-submit:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}>
                <Train size={22} color="#fff" />
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>RailEdge</span>
            </Link>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '2.25rem 2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.375rem' }}>Welcome back</h1>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)' }}>Sign in to your RailEdge account</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Sparkles size={11} /> Quick Demo Login
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  { label: 'User Account', email: 'harsha@example.com', pass: 'pass123', color: '#2563eb' },
                  { label: 'Admin Account', email: 'admin@railedge.in', pass: 'admin123', color: '#7c3aed' },
                ].map(d => (
                  <button key={d.label} className="demo-btn" onClick={() => handleDemo(d.email, d.pass)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.6rem 0.75rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: d.color, marginBottom: '0.2rem' }}>{d.label}</div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>{d.email}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>or sign in manually</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: '0.375rem' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
                  <input
                    id="login-email"
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '0.75rem 0.875rem 0.75rem 2.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: '0.375rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '0.75rem 2.75rem 0.75rem 2.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s' }}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, padding: '0.625rem 0.875rem', fontSize: '0.85rem', color: '#fca5a5' }}>
                  {error}
                </div>
              )}

              <button id="login-submit-btn" type="submit" className="login-submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', border: 'none', borderRadius: 12, padding: '0.875rem', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s', marginTop: '0.25rem' }}>
                {loading ? (
                  <span style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <><span>Sign In</span><ArrowRight size={17} /></>
                )}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', marginTop: '1.5rem' }}>
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" style={{ color: '#60a5fa', fontWeight: 600 }}>Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

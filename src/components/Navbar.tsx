'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Train, LogOut, User } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    ...(user?.role !== 'ADMIN' ? [
      { href: '/search', label: 'Search Trains' },
      { href: '/my-tickets', label: 'My Tickets' }
    ] : []),
    { href: '/price-trends', label: 'Price Trends' },
    ...(user?.role === 'ADMIN' ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <Train size={18} color="#fff" />
          </div>
          RailEdge
        </Link>

        <div className="navbar-nav">
          {user && navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname?.startsWith(link.href) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                id="user-menu-btn"
                onClick={() => setShowUserMenu(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'none', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', padding: '0.375rem 0.75rem',
                  cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                <div className="user-avatar" style={{ width: 26, height: 26, fontSize: '0.7rem' }}>
                  {user.initials}
                </div>
                {user.name.split(' ')[0]}
              </button>

              {showUserMenu && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: '#fff', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: '0.5rem',
                  minWidth: 180, boxShadow: 'var(--shadow-md)', zIndex: 200,
                }}>
                  <div style={{ padding: '0.5rem 0.75rem 0.625rem', borderBottom: '1px solid var(--border)', marginBottom: '0.375rem' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                  </div>
                  <Link href="/profile" onClick={() => setShowUserMenu(false)} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem', color: 'var(--text-secondary)',
                  }}>
                    <User size={14} /> My Profile
                  </Link>
                  <button onClick={handleLogout} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem', color: 'var(--danger)',
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  }}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-sm" style={{ color: 'var(--primary)', background: '#fff', border: '1px solid var(--primary)' }}>Log In</Link>
              <Link href="/auth/signup" className="btn btn-primary btn-sm" style={{ background: 'var(--accent)', border: 'none' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

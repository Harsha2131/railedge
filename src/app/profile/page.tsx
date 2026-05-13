'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { Booking } from '@/lib/mockData';
import { User, Mail, Phone, MapPin, Shield, Bell, CreditCard, LogOut, Edit3, Check } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  
  const TABS = [
    { key: 'profile', label: 'Profile', icon: <User size={16} /> },
    { key: 'security', label: 'Security', icon: <Shield size={16} /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { key: 'payments', label: 'Payments', icon: <CreditCard size={16} />, hide: user?.role === 'ADMIN' },
  ].filter(t => !t.hide);

  const router = useRouter();
  const [tab, setTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', city: user?.city || '', gender: user?.gender || 'Male' });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, phone: user.phone || '', city: user.city || '', gender: user.gender || 'Male' });
    }
  }, [user]);

  const [notifications, setNotifications] = useState(user?.notifications || { bookingAlerts: true, priceDrops: true, offers: false, sms: true });
  const [paymentMethods, setPaymentMethods] = useState(user?.paymentMethods || [
    { type: 'UPI', detail: 'harsha@paytm', icon: '📱', active: true },
    { type: 'Credit Card', detail: '**** **** **** 4521', icon: '💳', active: false },
    { type: 'Net Banking', detail: 'SBI — Savings Account', icon: '🏦', active: false },
  ]);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<{ index: number; type: string; detail: string; icon: string } | null>(null);
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [passwordStatus, setPasswordStatus] = useState({ message: '', error: false });

  const updateSetting = async (key: string, value: any) => {
    try {
      const res = await fetch(`/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (res.ok) {
        updateUser({ [key]: value });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle2FA = () => {
    const newValue = !user?.twoFactorEnabled;
    updateSetting('twoFactorEnabled', newValue);
  };

  const handleUpdateNotifications = (key: string) => {
    const newNotifications = { ...notifications, [key]: !(notifications as any)[key] };
    setNotifications(newNotifications);
    updateSetting('notifications', newNotifications);
  };

  const handleRemovePayment = (index: number) => {
    const newMethods = paymentMethods.filter((_, i) => i !== index);
    setPaymentMethods(newMethods);
    updateSetting('paymentMethods', newMethods);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;
    
    const newMethods = [...paymentMethods];
    newMethods[editingPayment.index] = { 
      ...newMethods[editingPayment.index], 
      detail: editingPayment.detail 
    };
    
    setPaymentMethods(newMethods);
    await updateSetting('paymentMethods', newMethods);
    setShowPaymentModal(false);
    setEditingPayment(null);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setPasswordStatus({ message: 'New passwords do not match', error: true });
      return;
    }
    
    setPasswordStatus({ message: 'Updating...', error: false });
    const res = await fetch(`/api/users/${user?.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwords.new }),
    });

    if (res.ok) {
      setPasswordStatus({ message: 'Password updated successfully!', error: false });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswords({ old: '', new: '', confirm: '' });
        setPasswordStatus({ message: '', error: false });
      }, 2000);
    } else {
      setPasswordStatus({ message: 'Failed to update password', error: true });
    }
  };

  useEffect(() => {
    if (user) {
      fetch(`/api/bookings?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setBookings(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, [user]);

  if (!user) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '3rem' }}>👤</div>
          <h2 style={{ color: '#0f172a' }}>Sign in to view your profile</h2>
          <button onClick={() => router.push('/auth/login')} style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', border: 'none', borderRadius: 12, padding: '0.75rem 2rem', fontWeight: 700, cursor: 'pointer' }}>Sign In</button>
        </div>
      </>
    );
  }

  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
  const totalSpent = bookings.filter(b => b.status === 'CONFIRMED').reduce((a, b) => a + b.totalAmount, 0);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, city: form.city, gender: form.gender }),
      });
      
      if (res.ok) {
        updateUser({ name: form.name, email: form.email, phone: form.phone, city: form.city, gender: form.gender });
        setSaved(true);
        setEditMode(false);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ background: '#f8fafc', minHeight: '80vh', padding: '2rem 0 3rem' }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 900, color: '#fff', flexShrink: 0, boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}>
              {user.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{user.name}</h1>
                {user.role === 'ADMIN' && <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#7c3aed', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: 100 }}>ADMIN</span>}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.75rem' }}>{user.email}</p>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'Bookings', value: confirmedBookings, hide: user.role === 'ADMIN' },
                  { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, hide: user.role === 'ADMIN' },
                  { label: 'Reward Points', value: '1,240', hide: user.role === 'ADMIN' },
                  { label: 'Member Since', value: '2024' },
                ].filter(s => !s.hide).map(s => (
                  <div key={s.label}>
                    <p style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{s.value}</p>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => { logout(); router.push('/'); }}
              style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5', borderRadius: 12, padding: '0.625rem 1.125rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LogOut size={15} /> Sign Out
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '0.75rem', position: 'sticky', top: 80 }}>
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.875rem', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.2rem', transition: 'all 0.15s', background: tab === t.key ? 'linear-gradient(135deg,#eff6ff,#f5f3ff)' : 'transparent', color: tab === t.key ? '#2563eb' : '#64748b' }}>
                  <span style={{ color: tab === t.key ? '#2563eb' : '#94a3b8' }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.75rem' }}>
              {tab === 'profile' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Personal Information</h3>
                    {!editMode ? (
                      <button onClick={() => setEditMode(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 10, padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                        <Edit3 size={14} /> Edit Profile
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setEditMode(false)} style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                        <button onClick={handleSave} disabled={isSaving} style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', border: 'none', borderRadius: 10, padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.375rem', opacity: isSaving ? 0.7 : 1 }}>
                          {isSaving ? 'Saving...' : <><Check size={14} /> Save Changes</>}
                        </button>
                      </div>
                    )}
                  </div>

                  {saved && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#166534', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={16} /> Profile updated successfully!
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    {[
                      { label: 'Full Name', key: 'name', icon: <User size={15} />, type: 'text' },
                      { label: 'Email Address', key: 'email', icon: <Mail size={15} />, type: 'email' },
                      { label: 'Phone Number', key: 'phone', icon: <Phone size={15} />, type: 'tel' },
                      { label: 'City', key: 'city', icon: <MapPin size={15} />, type: 'text' },
                    ].map(field => (
                      <div key={field.key}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.4rem' }}>
                          <span style={{ color: '#2563eb' }}>{field.icon}</span>{field.label}
                        </label>
                        {editMode ? (
                          <input type={field.type} value={form[field.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                            style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.9rem', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}
                            onFocus={e => (e.target.style.borderColor = '#2563eb')} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
                        ) : (
                          <div style={{ padding: '0.65rem 0.875rem', background: '#f8fafc', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', border: '1px solid #f1f5f9' }}>
                            {form[field.key as keyof typeof form]}
                          </div>
                        )}
                      </div>
                    ))}
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem', display: 'block' }}>Gender</label>
                      {editMode ? (
                        <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                          style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.65rem 0.875rem', fontSize: '0.9rem', color: '#0f172a', outline: 'none', background: '#fff', appearance: 'none' }}>
                          {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
                        </select>
                      ) : (
                        <div style={{ padding: '0.65rem 0.875rem', background: '#f8fafc', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', border: '1px solid #f1f5f9' }}>{form.gender}</div>
                      )}
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem', display: 'block' }}>Account Type</label>
                      <div style={{ padding: '0.65rem 0.875rem', background: user.role === 'ADMIN' ? '#f5f3ff' : '#f8fafc', borderRadius: 10, fontSize: '0.9rem', fontWeight: 700, color: user.role === 'ADMIN' ? '#7c3aed' : '#0f172a', border: `1px solid ${user.role === 'ADMIN' ? '#ddd6fe' : '#f1f5f9'}` }}>
                        {user.role === 'ADMIN' ? '🛡️ Administrator' : '👤 Standard User'}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {tab === 'security' && (
                <>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Security Settings</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.125rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0f172a', marginBottom: '0.2rem' }}>Change Password</p>
                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Last changed recently</p>
                      </div>
                      <button onClick={() => setShowPasswordModal(true)} style={{ background: '#2563eb15', color: '#2563eb', border: '1px solid #2563eb40', borderRadius: 10, padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Update</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.125rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0f172a', marginBottom: '0.2rem' }}>Two-Factor Authentication</p>
                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{user?.twoFactorEnabled ? '2FA is active' : '2FA is currently disabled'}</p>
                      </div>
                      <button onClick={handleToggle2FA} style={{ background: user?.twoFactorEnabled ? '#22c55e15' : '#e2e8f0', color: user?.twoFactorEnabled ? '#22c55e' : '#64748b', border: 'none', borderRadius: 10, padding: '0.5rem 1rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
                        {user?.twoFactorEnabled ? 'Enabled' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {tab === 'notifications' && (
                <>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Notification Preferences</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {[
                      { key: 'bookingAlerts', label: 'Booking Confirmations', desc: 'Get notified when a booking is confirmed or cancelled', hide: user.role === 'ADMIN' },
                      { key: 'priceDrops', label: 'Price Drop Alerts', desc: 'Alert when fares drop on your saved routes', hide: user.role === 'ADMIN' },
                      { key: 'offers', label: 'Offers & Promotions', desc: 'Special deals and limited-time offers' },
                      { key: 'sms', label: 'SMS Notifications', desc: 'Receive security alerts and OTPs via SMS' },
                    ].filter(item => !item.hide).map(item => (
                      <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.125rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0f172a', marginBottom: '0.2rem' }}>{item.label}</p>
                          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.desc}</p>
                        </div>
                        <button onClick={() => handleUpdateNotifications(item.key)}
                          style={{ width: 48, height: 26, borderRadius: 100, border: 'none', cursor: 'pointer', background: (notifications as any)[item.key] ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : '#e2e8f0', transition: 'all 0.25s', position: 'relative', flexShrink: 0 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: (notifications as any)[item.key] ? 24 : 3, transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {tab === 'payments' && (
                <>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Payment Methods</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {paymentMethods.map((pm, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.125rem', background: pm.active ? '#eff6ff' : '#f8fafc', borderRadius: 12, border: `1px solid ${pm.active ? '#bfdbfe' : '#e2e8f0'}` }}>
                        <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '1.5rem' }}>{pm.icon}</span>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0f172a', marginBottom: '0.15rem' }}>{pm.type}</p>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{pm.detail}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {pm.active && <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#2563eb', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: 100, marginRight: '0.5rem' }}>DEFAULT</span>}
                          <button 
                            onClick={() => {
                              setEditingPayment({ index: i, type: pm.type, detail: pm.detail, icon: pm.icon });
                              setShowPaymentModal(true);
                            }}
                            style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                            Edit
                          </button>
                          <button onClick={() => handleRemovePayment(i)} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {showPaymentModal && editingPayment && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: 20, width: '100%', maxWidth: 400 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{editingPayment.icon}</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Edit {editingPayment.type}</h3>
            </div>
            <form onSubmit={handleSavePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.375rem' }}>Account Details</label>
                <input 
                  type="text" 
                  required 
                  value={editingPayment.detail} 
                  onChange={e => setEditingPayment(p => p ? ({ ...p, detail: e.target.value }) : null)} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0', outline: 'none' }} 
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => { setShowPaymentModal(false); setEditingPayment(null); }} style={{ flex: 1, padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: 20, width: '100%', maxWidth: 400 }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 800 }}>Change Password</h3>
            {passwordStatus.message && (
              <div style={{ background: passwordStatus.error ? '#fef2f2' : '#f0fdf4', color: passwordStatus.error ? '#dc2626' : '#16a34a', padding: '0.75rem', borderRadius: 10, marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                {passwordStatus.message}
              </div>
            )}
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.375rem' }}>Old Password</label>
                <input type="password" required value={passwords.old} onChange={e => setPasswords(p => ({ ...p, old: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.375rem' }}>New Password</label>
                <input type="password" required value={passwords.new} onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.375rem' }}>Confirm New Password</label>
                <input type="password" required value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowPasswordModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

import { createClient } from '@supabase/supabase-js';
import { Train, Booking } from './mockData';

export interface PaymentMethod {
  type: string;
  detail: string;
  icon: string;
  active: boolean;
}

export interface NotificationSettings {
  bookingAlerts: boolean;
  priceDrops: boolean;
  offers: boolean;
  sms: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'USER' | 'ADMIN';
  initials?: string;
  phone?: string;
  city?: string;
  gender?: string;
  twoFactorEnabled?: boolean;
  paymentMethods?: PaymentMethod[];
  notifications?: NotificationSettings;
}

// Supabase client — uses HTTP (works in all Vercel serverless environments)
// Uses service role key for full access (bypasses RLS), falls back to anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
);

export { supabase };

// ─── Trains ────────────────────────────────────────────────────────────────

export async function getTrains(): Promise<Train[]> {
  const { data, error } = await supabase.from('trains').select('*');
  if (error) throw new Error(error.message);
  return (data || []).map(r => ({
    id: r.id,
    number: r.number,
    name: r.name,
    type: r.type,
    source: r.source,
    sourceCode: r.source_code,
    destination: r.destination,
    destinationCode: r.destination_code,
    departure: r.departure,
    arrival: r.arrival,
    duration: r.duration,
    rating: Number(r.rating),
    onTimePercent: Number(r.on_time_percent),
    distance: Number(r.distance),
    classes: typeof r.classes === 'string' ? JSON.parse(r.classes) : r.classes,
    days: r.days,
  }));
}

// ─── Users ─────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw new Error(error.message);
  return (data || []).map(r => ({
    id: r.id,
    name: r.name,
    email: r.email,
    password: r.password,
    role: r.role as 'USER' | 'ADMIN',
    phone: r.phone,
    city: r.city,
    gender: r.gender,
    paymentMethods: r.payment_methods,
    notifications: r.notifications,
  }));
}

export async function createUser(user: User): Promise<User> {
  const { error } = await supabase.from('users').insert({
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    role: user.role,
  });
  if (error) throw new Error(error.message);
  return user;
}

export async function deleteUser(id: string): Promise<boolean> {
  const { error, count } = await supabase
    .from('users')
    .delete({ count: 'exact' })
    .eq('id', id);
  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

// ─── Bookings ──────────────────────────────────────────────────────────────

export async function getBookings(userId?: string): Promise<Booking[]> {
  let query = supabase.from('bookings').select('*').order('booked_at', { ascending: false });
  if (userId) query = query.eq('user_id', userId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data || []).map(r => ({
    id: r.id,
    userId: r.user_id,
    pnr: r.pnr,
    trainName: r.train_name,
    trainNumber: r.train_number,
    source: r.source,
    sourceCode: r.source_code,
    destination: r.destination,
    destinationCode: r.destination_code,
    departure: r.departure,
    arrival: r.arrival,
    date: r.date,
    class: r.class,
    passengers: typeof r.passengers === 'string' ? JSON.parse(r.passengers) : r.passengers,
    totalAmount: Number(r.total_amount),
    status: r.status as 'CONFIRMED' | 'CANCELLED' | 'WAITING',
    bookedAt: r.booked_at,
    cancelledAt: r.cancelled_at,
    paymentMethod: r.payment_method,
    duration: r.duration,
    seatNumbers: r.seat_numbers,
    coachNumber: r.coach_number,
  }));
}

export async function createBooking(booking: Booking): Promise<Booking> {
  const id = 'bk' + Date.now();
  const pnr = booking.pnr || ('PNR' + Math.floor(Math.random() * 9000000 + 1000000));
  const bookedAt = new Date().toISOString();

  const { error } = await supabase.from('bookings').insert({
    id,
    user_id: booking.userId,
    pnr,
    train_name: booking.trainName,
    train_number: booking.trainNumber,
    source: booking.source,
    source_code: booking.sourceCode,
    destination: booking.destination,
    destination_code: booking.destinationCode,
    departure: booking.departure,
    arrival: booking.arrival,
    duration: booking.duration,
    date: booking.date,
    class: booking.class,
    passengers: booking.passengers,
    total_amount: booking.totalAmount,
    status: booking.status || 'CONFIRMED',
    booked_at: bookedAt,
    payment_method: booking.paymentMethod,
    seat_numbers: booking.seatNumbers || [],
    coach_number: booking.coachNumber,
  });

  if (error) throw new Error(error.message);
  return { ...booking, id, pnr, bookedAt, status: booking.status || 'CONFIRMED' };
}

export async function cancelBooking(id: string): Promise<boolean> {
  const { error, count } = await supabase
    .from('bookings')
    .update({ status: 'CANCELLED', cancelled_at: new Date().toISOString() }, { count: 'exact' })
    .eq('id', id);
  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

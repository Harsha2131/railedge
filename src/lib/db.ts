import postgres from 'postgres';
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

// Use POSTGRES_URL_NON_POOLING (direct connection) — more reliable for serverless + DDL
// Falls back to POSTGRES_URL if non-pooling is unavailable
const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL!;

const sql = postgres(connectionString, {
  ssl: { rejectUnauthorized: false }, // Required for Supabase SSL
  max: 1,           // Serverless-safe: one connection per function instance
  connect_timeout: 10,
});

export { sql };

// PostgreSQL Helpers

export async function getTrains(): Promise<Train[]> {
  const rows = await sql`SELECT * FROM trains;`;
  return rows.map(r => ({
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
    days: r.days
  }));
}

export async function getUsers(): Promise<User[]> {
  const rows = await sql`SELECT * FROM users;`;
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    email: r.email,
    password: r.password,
    role: r.role as 'USER' | 'ADMIN',
    phone: r.phone,
    city: r.city,
    gender: r.gender,
    paymentMethods: r.payment_methods,
    notifications: r.notifications
  }));
}

export async function getBookings(userId?: string): Promise<Booking[]> {
  let rows;
  if (userId) {
    rows = await sql`SELECT * FROM bookings WHERE user_id = ${userId} ORDER BY booked_at DESC;`;
  } else {
    rows = await sql`SELECT * FROM bookings ORDER BY booked_at DESC;`;
  }

  return rows.map(r => ({
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
    coachNumber: r.coach_number
  }));
}

export async function createBooking(booking: Booking): Promise<Booking> {
  const id = 'bk' + Date.now();
  const pnr = booking.pnr || ('PNR' + Math.floor(Math.random() * 9000000 + 1000000));
  const bookedAt = new Date().toISOString();

  await sql`
    INSERT INTO bookings (
      id, user_id, pnr, train_name, train_number, source, source_code,
      destination, destination_code, departure, arrival, duration, date, class,
      passengers, total_amount, status, booked_at, payment_method,
      seat_numbers, coach_number
    ) VALUES (
      ${id}, ${booking.userId}, ${pnr}, ${booking.trainName}, ${booking.trainNumber},
      ${booking.source}, ${booking.sourceCode}, ${booking.destination},
      ${booking.destinationCode}, ${booking.departure}, ${booking.arrival},
      ${booking.duration}, ${booking.date}, ${booking.class},
      ${JSON.stringify(booking.passengers)}, ${booking.totalAmount},
      ${booking.status || 'CONFIRMED'}, ${bookedAt}, ${booking.paymentMethod},
      ${`{${booking.seatNumbers?.join(',') || ''}}`}, ${booking.coachNumber}
    );
  `;

  return { ...booking, id, pnr, bookedAt, status: booking.status || 'CONFIRMED' };
}

export async function cancelBooking(id: string): Promise<boolean> {
  const cancelledAt = new Date().toISOString();
  const result = await sql`
    UPDATE bookings
    SET status = 'CANCELLED', cancelled_at = ${cancelledAt}
    WHERE id = ${id};
  `;
  return (result.count ?? 0) > 0;
}

export async function createUser(user: User): Promise<User> {
  await sql`
    INSERT INTO users (id, name, email, password, role)
    VALUES (${user.id}, ${user.name}, ${user.email}, ${user.password}, ${user.role})
  `;
  return user;
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await sql`DELETE FROM users WHERE id = ${id};`;
  return (result.count ?? 0) > 0;
}

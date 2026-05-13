import { sql } from '@vercel/postgres';
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

// PostgreSQL Helpers

export async function getTrains(): Promise<Train[]> {
  const { rows } = await sql`SELECT * FROM trains;`;
  return rows.map(r => ({
    id: r.id,
    number: r.number,
    name: r.name,
    source: r.source,
    sourceCode: r.source_code,
    destination: r.destination,
    destinationCode: r.destination_code,
    departure: r.departure,
    arrival: r.arrival,
    duration: r.duration,
    classes: typeof r.classes === 'string' ? JSON.parse(r.classes) : r.classes,
    daysActive: r.days_active
  }));
}

export async function getUsers(): Promise<User[]> {
  const { rows } = await sql`SELECT * FROM users;`;
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
  let result;
  if (userId) {
    result = await sql`SELECT * FROM bookings WHERE user_id = ${userId} ORDER BY booked_at DESC;`;
  } else {
    result = await sql`SELECT * FROM bookings ORDER BY booked_at DESC;`;
  }
  
  return result.rows.map(r => ({
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
    paymentMethod: r.payment_method
  }));
}

export async function createBooking(booking: Booking): Promise<Booking> {
  const id = 'bk' + Date.now();
  const pnr = booking.pnr || ('PNR' + Math.floor(Math.random() * 9000000 + 1000000));
  const bookedAt = new Date().toISOString();
  
  await sql`
    INSERT INTO bookings (
      id, user_id, pnr, train_name, train_number, source, source_code, 
      destination, destination_code, departure, arrival, date, class, 
      passengers, total_amount, status, booked_at, payment_method
    ) VALUES (
      ${id}, ${booking.userId}, ${pnr}, ${booking.trainName}, ${booking.trainNumber}, 
      ${booking.source}, ${booking.sourceCode}, ${booking.destination}, 
      ${booking.destinationCode}, ${booking.departure}, ${booking.arrival}, 
      ${booking.date}, ${booking.class}, ${JSON.stringify(booking.passengers)}, 
      ${booking.totalAmount}, ${booking.status || 'CONFIRMED'}, ${bookedAt}, 
      ${booking.paymentMethod}
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
  return result.rowCount > 0;
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
  return result.rowCount > 0;
}

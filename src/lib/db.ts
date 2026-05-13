import fs from 'fs/promises';
import path from 'path';
import { MOCK_TRAINS, MOCK_BOOKINGS, Train, Booking } from './mockData';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

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

export interface Database {
  users: User[];
  trains: Train[];
  bookings: Booking[];
}

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Harsha Kumar', email: 'harsha@example.com', password: 'pass123', role: 'USER' },
  { id: 'u2', name: 'Admin User', email: 'admin@railedge.in', password: 'admin123', role: 'ADMIN' },
  { id: 'u3', name: 'Rahul Sharma', email: 'rahul@example.com', password: 'pass123', role: 'USER' },
];

export async function initDB() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  try {
    await fs.access(DB_FILE);
  } catch {
    const initialData: Database = {
      users: INITIAL_USERS,
      trains: MOCK_TRAINS,
      bookings: MOCK_BOOKINGS,
    };
    await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

export async function readDB(): Promise<Database> {
  await initDB();
  const data = await fs.readFile(DB_FILE, 'utf-8');
  return JSON.parse(data) as Database;
}

export async function writeDB(data: Database): Promise<void> {
  await initDB();
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

export interface Train {
  id: string;
  name: string;
  number: string;
  type: 'RAJDHANI' | 'SHATABDI' | 'SUPERFAST' | 'EXPRESS';
  source: string;
  sourceCode: string;
  destination: string;
  destinationCode: string;
  departure: string;
  arrival: string;
  duration: string;
  days: string[];
  classes: TrainClass[];
  rating: number;
  onTimePercent: number;
  distance: number;
}

export interface TrainClass {
  name: string;
  code: string;
  basePrice: number;
  available: number;
  total: number;
  status: 'AVAILABLE' | 'RAC' | 'WAITING';
}

export interface Booking {
  id: string;
  userId?: string;
  pnr: string;
  trainName: string;
  trainNumber: string;
  source: string;
  sourceCode: string;
  destination: string;
  destinationCode: string;
  departure: string;
  arrival: string;
  date: string;
  class: string;
  passengers: Passenger[];
  totalAmount: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'WAITING';
  bookedAt: string;
  cancelledAt?: string;
  duration: string;
  seatNumbers: string[];
  coachNumber: string;
  paymentMethod?: string;
}

export interface Passenger {
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  berthPreference: string;
  seatNumber?: string;
}

export interface Station {
  name: string;
  code: string;
  city: string;
  state: string;
}

export const STATIONS: Station[] = [
  { name: 'New Delhi', code: 'NDLS', city: 'New Delhi', state: 'Delhi' },
  { name: 'Hazrat Nizamuddin', code: 'NZM', city: 'New Delhi', state: 'Delhi' },
  { name: 'Mumbai Central', code: 'MMCT', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'Mumbai CST', code: 'CSTM', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'Chennai Central', code: 'MAS', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Chennai Egmore', code: 'MS', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Kolkata Howrah', code: 'HWH', city: 'Kolkata', state: 'West Bengal' },
  { name: 'Kolkata Sealdah', code: 'SDAH', city: 'Kolkata', state: 'West Bengal' },
  { name: 'Bangalore City', code: 'SBC', city: 'Bangalore', state: 'Karnataka' },
  { name: 'Hyderabad Deccan', code: 'HYB', city: 'Hyderabad', state: 'Telangana' },
  { name: 'Secunderabad', code: 'SC', city: 'Hyderabad', state: 'Telangana' },
  { name: 'Pune Junction', code: 'PUNE', city: 'Pune', state: 'Maharashtra' },
  { name: 'Ahmedabad Junction', code: 'ADI', city: 'Ahmedabad', state: 'Gujarat' },
  { name: 'Jaipur Junction', code: 'JP', city: 'Jaipur', state: 'Rajasthan' },
  { name: 'Jodhpur Junction', code: 'JU', city: 'Jodhpur', state: 'Rajasthan' },
  { name: 'Udaipur City', code: 'UDZ', city: 'Udaipur', state: 'Rajasthan' },
  { name: 'Lucknow Charbagh', code: 'LKO', city: 'Lucknow', state: 'UP' },
  { name: 'Kanpur Central', code: 'CNB', city: 'Kanpur', state: 'UP' },
  { name: 'Allahabad Junction', code: 'ALD', city: 'Prayagraj', state: 'UP' },
  { name: 'Agra Cantt', code: 'AGC', city: 'Agra', state: 'UP' },
  { name: 'Varanasi Junction', code: 'BSB', city: 'Varanasi', state: 'UP' },
  { name: 'Mathura Junction', code: 'MTJ', city: 'Mathura', state: 'UP' },
  { name: 'Patna Junction', code: 'PNBE', city: 'Patna', state: 'Bihar' },
  { name: 'Gaya Junction', code: 'GAYA', city: 'Gaya', state: 'Bihar' },
  { name: 'Bhopal Junction', code: 'BPL', city: 'Bhopal', state: 'MP' },
  { name: 'Indore Junction', code: 'INDB', city: 'Indore', state: 'MP' },
  { name: 'Gwalior Junction', code: 'GWL', city: 'Gwalior', state: 'MP' },
  { name: 'Nagpur Junction', code: 'NGP', city: 'Nagpur', state: 'Maharashtra' },
  { name: 'Aurangabad', code: 'AWB', city: 'Aurangabad', state: 'Maharashtra' },
  { name: 'Visakhapatnam', code: 'VSKP', city: 'Visakhapatnam', state: 'AP' },
  { name: 'Vijayawada Junction', code: 'BZA', city: 'Vijayawada', state: 'AP' },
  { name: 'Amritsar Junction', code: 'ASR', city: 'Amritsar', state: 'Punjab' },
  { name: 'Ludhiana Junction', code: 'LDH', city: 'Ludhiana', state: 'Punjab' },
  { name: 'Chandigarh', code: 'CDG', city: 'Chandigarh', state: 'Chandigarh' },
  { name: 'Surat', code: 'ST', city: 'Surat', state: 'Gujarat' },
  { name: 'Vadodara Junction', code: 'BRC', city: 'Vadodara', state: 'Gujarat' },
  { name: 'Rajkot Junction', code: 'RJT', city: 'Rajkot', state: 'Gujarat' },
  { name: 'Kochi Ernakulam', code: 'ERS', city: 'Kochi', state: 'Kerala' },
  { name: 'Trivandrum Central', code: 'TVC', city: 'Thiruvananthapuram', state: 'Kerala' },
  { name: 'Coimbatore Junction', code: 'CBE', city: 'Coimbatore', state: 'Tamil Nadu' },
  { name: 'Madurai Junction', code: 'MDU', city: 'Madurai', state: 'Tamil Nadu' },
  { name: 'Mysuru Junction', code: 'MYS', city: 'Mysuru', state: 'Karnataka' },
  { name: 'Mangaluru Central', code: 'MAQ', city: 'Mangaluru', state: 'Karnataka' },
  { name: 'Guwahati', code: 'GHY', city: 'Guwahati', state: 'Assam' },
  { name: 'Bhubaneswar', code: 'BBS', city: 'Bhubaneswar', state: 'Odisha' },
  { name: 'Raipur Junction', code: 'R', city: 'Raipur', state: 'Chhattisgarh' },
  { name: 'Ranchi Junction', code: 'RNC', city: 'Ranchi', state: 'Jharkhand' },
  { name: 'Dehradun', code: 'DDN', city: 'Dehradun', state: 'Uttarakhand' },
  { name: 'Haridwar Junction', code: 'HW', city: 'Haridwar', state: 'Uttarakhand' },
  { name: 'Shimla', code: 'SML', city: 'Shimla', state: 'Himachal Pradesh' },
];

export const MOCK_TRAINS: Train[] = [
  {
    id: '1',
    name: 'Rajdhani Express',
    number: '12301',
    type: 'RAJDHANI',
    source: 'New Delhi',
    sourceCode: 'NDLS',
    destination: 'Mumbai Central',
    destinationCode: 'MMCT',
    departure: '16:25',
    arrival: '08:00',
    duration: '15h 35m',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    distance: 1384,
    rating: 4.6,
    onTimePercent: 87,
    classes: [
      { name: '1st AC', code: '1A', basePrice: 4560, available: 6, total: 24, status: 'AVAILABLE' },
      { name: '2nd AC', code: '2A', basePrice: 2720, available: 18, total: 48, status: 'AVAILABLE' },
      { name: '3rd AC', code: '3A', basePrice: 1845, available: 34, total: 64, status: 'AVAILABLE' },
      { name: 'Sleeper', code: 'SL', basePrice: 650, available: 0, total: 72, status: 'WAITING' },
    ],
  },
  {
    id: '2',
    name: 'Duronto Express',
    number: '12263',
    type: 'SUPERFAST',
    source: 'New Delhi',
    sourceCode: 'NDLS',
    destination: 'Mumbai Central',
    destinationCode: 'MMCT',
    departure: '23:30',
    arrival: '16:45',
    duration: '17h 15m',
    days: ['Mon', 'Wed', 'Fri', 'Sun'],
    distance: 1384,
    rating: 4.3,
    onTimePercent: 78,
    classes: [
      { name: '2nd AC', code: '2A', basePrice: 2450, available: 8, total: 48, status: 'AVAILABLE' },
      { name: '3rd AC', code: '3A', basePrice: 1650, available: 22, total: 64, status: 'AVAILABLE' },
      { name: 'Sleeper', code: 'SL', basePrice: 545, available: 3, total: 72, status: 'RAC' },
    ],
  },
  {
    id: '3',
    name: 'August Kranti Rajdhani',
    number: '12953',
    type: 'RAJDHANI',
    source: 'New Delhi',
    sourceCode: 'NDLS',
    destination: 'Mumbai Central',
    destinationCode: 'MMCT',
    departure: '17:40',
    arrival: '10:55',
    duration: '17h 15m',
    days: ['Tue', 'Thu', 'Sat'],
    distance: 1384,
    rating: 4.4,
    onTimePercent: 82,
    classes: [
      { name: '1st AC', code: '1A', basePrice: 4890, available: 12, total: 24, status: 'AVAILABLE' },
      { name: '2nd AC', code: '2A', basePrice: 2920, available: 24, total: 48, status: 'AVAILABLE' },
      { name: '3rd AC', code: '3A', basePrice: 1980, available: 45, total: 64, status: 'AVAILABLE' },
    ],
  },
  {
    id: '4',
    name: 'Garib Rath Express',
    number: '12909',
    type: 'EXPRESS',
    source: 'New Delhi',
    sourceCode: 'NDLS',
    destination: 'Mumbai Central',
    destinationCode: 'MMCT',
    departure: '12:55',
    arrival: '08:35',
    duration: '19h 40m',
    days: ['Mon', 'Fri'],
    distance: 1384,
    rating: 3.9,
    onTimePercent: 71,
    classes: [
      { name: '3rd AC', code: '3A', basePrice: 1120, available: 60, total: 120, status: 'AVAILABLE' },
      { name: 'Sleeper', code: 'SL', basePrice: 380, available: 0, total: 200, status: 'WAITING' },
    ],
  },
  {
    id: '5',
    name: 'Shatabdi Express',
    number: '12001',
    type: 'SHATABDI',
    source: 'New Delhi',
    sourceCode: 'NDLS',
    destination: 'Bhopal Junction',
    destinationCode: 'BPL',
    departure: '06:00',
    arrival: '13:50',
    duration: '7h 50m',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    distance: 704,
    rating: 4.7,
    onTimePercent: 91,
    classes: [
      { name: 'Chair Car', code: 'CC', basePrice: 1180, available: 40, total: 78, status: 'AVAILABLE' },
      { name: 'Exec Chair Car', code: 'EC', basePrice: 2280, available: 15, total: 56, status: 'AVAILABLE' },
    ],
  },
  {
    id: '6',
    name: 'Kerala Express',
    number: '12625',
    type: 'EXPRESS',
    source: 'New Delhi',
    sourceCode: 'NDLS',
    destination: 'Trivandrum Central',
    destinationCode: 'TVC',
    departure: '11:35',
    arrival: '16:30',
    duration: '52h 55m',
    days: ['Mon', 'Wed', 'Fri'],
    distance: 3054,
    rating: 4.1,
    onTimePercent: 68,
    classes: [
      { name: '2nd AC', code: '2A', basePrice: 3200, available: 12, total: 48, status: 'AVAILABLE' },
      { name: '3rd AC', code: '3A', basePrice: 2100, available: 28, total: 64, status: 'AVAILABLE' },
      { name: 'Sleeper', code: 'SL', basePrice: 720, available: 45, total: 120, status: 'AVAILABLE' },
    ],
  },
  {
    id: '7',
    name: 'Golden Temple Mail',
    number: '12903',
    type: 'SUPERFAST',
    source: 'Mumbai Central',
    sourceCode: 'MMCT',
    destination: 'Amritsar Junction',
    destinationCode: 'ASR',
    departure: '21:35',
    arrival: '05:15',
    duration: '31h 40m',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    distance: 1930,
    rating: 4.2,
    onTimePercent: 75,
    classes: [
      { name: '1st AC', code: '1A', basePrice: 5200, available: 4, total: 18, status: 'AVAILABLE' },
      { name: '2nd AC', code: '2A', basePrice: 2980, available: 14, total: 48, status: 'AVAILABLE' },
      { name: '3rd AC', code: '3A', basePrice: 1980, available: 30, total: 64, status: 'AVAILABLE' },
      { name: 'Sleeper', code: 'SL', basePrice: 680, available: 0, total: 200, status: 'WAITING' },
    ],
  },
  {
    id: '8',
    name: 'Coromandel Express',
    number: '12841',
    type: 'SUPERFAST',
    source: 'Kolkata Howrah',
    sourceCode: 'HWH',
    destination: 'Chennai Central',
    destinationCode: 'MAS',
    departure: '14:35',
    arrival: '16:10',
    duration: '25h 35m',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    distance: 1662,
    rating: 4.4,
    onTimePercent: 80,
    classes: [
      { name: '2nd AC', code: '2A', basePrice: 2560, available: 20, total: 48, status: 'AVAILABLE' },
      { name: '3rd AC', code: '3A', basePrice: 1720, available: 38, total: 64, status: 'AVAILABLE' },
      { name: 'Sleeper', code: 'SL', basePrice: 580, available: 5, total: 120, status: 'RAC' },
    ],
  },
  {
    id: '9',
    name: 'Bangalore Rajdhani',
    number: '22691',
    type: 'RAJDHANI',
    source: 'New Delhi',
    sourceCode: 'NDLS',
    destination: 'Bangalore City',
    destinationCode: 'SBC',
    departure: '20:00',
    arrival: '05:00',
    duration: '33h 00m',
    days: ['Tue', 'Thu', 'Sun'],
    distance: 2150,
    rating: 4.5,
    onTimePercent: 83,
    classes: [
      { name: '1st AC', code: '1A', basePrice: 6100, available: 8, total: 18, status: 'AVAILABLE' },
      { name: '2nd AC', code: '2A', basePrice: 3480, available: 22, total: 48, status: 'AVAILABLE' },
      { name: '3rd AC', code: '3A', basePrice: 2380, available: 40, total: 64, status: 'AVAILABLE' },
    ],
  },
  {
    id: '10',
    name: 'Howrah Rajdhani',
    number: '12301',
    type: 'RAJDHANI',
    source: 'New Delhi',
    sourceCode: 'NDLS',
    destination: 'Kolkata Howrah',
    destinationCode: 'HWH',
    departure: '16:55',
    arrival: '09:55',
    duration: '17h 00m',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    distance: 1447,
    rating: 4.6,
    onTimePercent: 86,
    classes: [
      { name: '1st AC', code: '1A', basePrice: 4980, available: 6, total: 18, status: 'AVAILABLE' },
      { name: '2nd AC', code: '2A', basePrice: 2980, available: 18, total: 48, status: 'AVAILABLE' },
      { name: '3rd AC', code: '3A', basePrice: 2150, available: 32, total: 64, status: 'AVAILABLE' },
    ],
  },
  {
    id: '11',
    name: 'Deccan Queen',
    number: '12123',
    type: 'SHATABDI',
    source: 'Mumbai CST',
    sourceCode: 'CSTM',
    destination: 'Pune Junction',
    destinationCode: 'PUNE',
    departure: '07:15',
    arrival: '10:25',
    duration: '3h 10m',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    distance: 192,
    rating: 4.8,
    onTimePercent: 93,
    classes: [
      { name: 'Chair Car', code: 'CC', basePrice: 420, available: 60, total: 100, status: 'AVAILABLE' },
      { name: 'Exec Chair Car', code: 'EC', basePrice: 850, available: 20, total: 40, status: 'AVAILABLE' },
    ],
  },
  {
    id: '12',
    name: 'Chennai Rajdhani',
    number: '12433',
    type: 'RAJDHANI',
    source: 'New Delhi',
    sourceCode: 'NDLS',
    destination: 'Chennai Central',
    destinationCode: 'MAS',
    departure: '15:55',
    arrival: '15:25',
    duration: '23h 30m',
    days: ['Tue', 'Wed', 'Fri', 'Sun'],
    distance: 2188,
    rating: 4.4,
    onTimePercent: 79,
    classes: [
      { name: '1st AC', code: '1A', basePrice: 5800, available: 10, total: 18, status: 'AVAILABLE' },
      { name: '2nd AC', code: '2A', basePrice: 3350, available: 24, total: 48, status: 'AVAILABLE' },
      { name: '3rd AC', code: '3A', basePrice: 2280, available: 44, total: 64, status: 'AVAILABLE' },
    ],
  },
  {
    id: '13',
    name: 'Bangalore Shatabdi',
    number: '12007',
    type: 'SHATABDI',
    source: 'Mysuru Junction',
    sourceCode: 'MYS',
    destination: 'Chennai Central',
    destinationCode: 'MAS',
    departure: '06:10',
    arrival: '12:30',
    duration: '6h 20m',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    distance: 497,
    rating: 4.6,
    onTimePercent: 88,
    classes: [
      { name: 'Chair Car', code: 'CC', basePrice: 780, available: 50, total: 78, status: 'AVAILABLE' },
      { name: 'Exec Chair Car', code: 'EC', basePrice: 1580, available: 18, total: 56, status: 'AVAILABLE' },
    ],
  },
  {
    id: '14',
    name: 'Patna Rajdhani',
    number: '12309',
    type: 'RAJDHANI',
    source: 'New Delhi',
    sourceCode: 'NDLS',
    destination: 'Patna Junction',
    destinationCode: 'PNBE',
    departure: '18:25',
    arrival: '05:00',
    duration: '10h 35m',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    distance: 1001,
    rating: 4.3,
    onTimePercent: 77,
    classes: [
      { name: '2nd AC', code: '2A', basePrice: 2180, available: 16, total: 48, status: 'AVAILABLE' },
      { name: '3rd AC', code: '3A', basePrice: 1580, available: 36, total: 64, status: 'AVAILABLE' },
      { name: 'Sleeper', code: 'SL', basePrice: 520, available: 12, total: 120, status: 'AVAILABLE' },
    ],
  },
  {
    id: '15',
    name: 'Ahmedabad Shatabdi',
    number: '12009',
    type: 'SHATABDI',
    source: 'Mumbai Central',
    sourceCode: 'MMCT',
    destination: 'Ahmedabad Junction',
    destinationCode: 'ADI',
    departure: '06:25',
    arrival: '12:30',
    duration: '6h 05m',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    distance: 493,
    rating: 4.5,
    onTimePercent: 85,
    classes: [
      { name: 'Chair Car', code: 'CC', basePrice: 760, available: 42, total: 78, status: 'AVAILABLE' },
      { name: 'Exec Chair Car', code: 'EC', basePrice: 1480, available: 16, total: 56, status: 'AVAILABLE' },
    ],
  },
];

export const MOCK_BOOKINGS: Booking[] = [];

export const PRICE_TREND_DATA = {
  labels: Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  }),
  datasets: [
    {
      label: '2nd AC (₹)',
      prices: [2720, 2720, 2850, 2720, 2990, 3100, 3240, 2720, 2720, 2900, 3050, 3200, 3400, 3600, 3800, 2720, 2780, 2850, 2920, 3100, 3350, 3600, 3900, 4100, 4300, 2720, 2800, 2900, 3100, 3400],
    },
    {
      label: '3rd AC (₹)',
      prices: [1845, 1845, 1920, 1845, 2020, 2100, 2200, 1845, 1845, 1950, 2050, 2180, 2300, 2450, 2600, 1845, 1880, 1940, 1980, 2100, 2280, 2450, 2650, 2800, 2950, 1845, 1900, 1960, 2100, 2300],
    },
    {
      label: 'Sleeper (₹)',
      prices: [650, 650, 720, 650, 780, 820, 870, 650, 650, 720, 790, 850, 920, 990, 1060, 650, 680, 710, 750, 820, 900, 990, 1080, 1150, 1220, 650, 680, 720, 800, 920],
    },
  ],
};

export function generateCalendarData() {
  const today = new Date();
  const days = [];
  for (let i = 0; i < 35; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i - 7);
    const isPast = d < today;
    const isToday = d.toDateString() === today.toDateString();
    const rand = Math.random();
    let level: 'cheap' | 'moderate' | 'expensive' = 'moderate';
    if (rand < 0.35) level = 'cheap';
    else if (rand < 0.65) level = 'moderate';
    else level = 'expensive';
    const basePrice = level === 'cheap' ? 1845 : level === 'moderate' ? 2200 : 3400;
    days.push({
      date: d,
      day: d.getDate(),
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
      level,
      price: basePrice,
      isPast,
      isToday,
    });
  }
  return days;
}

export const AI_SUGGESTIONS = [
  {
    label: 'Best Pick',
    berth: 'Lower Berth (SL)',
    seat: '23 - Coach B4',
    reason: 'Perfect for your journey duration. Easy access, near charging point.',
    score: 97,
    icon: '⭐',
    isBest: true,
  },
  {
    label: 'Alternative',
    berth: 'Side Lower (SL)',
    seat: '63 - Coach B3',
    reason: 'More privacy, quieter section of coach.',
    score: 89,
    icon: '✨',
    isBest: false,
  },
  {
    label: 'Budget Pick',
    berth: 'Upper Berth (UB)',
    seat: '14 - Coach B5',
    reason: 'Great for sleeping, minimal disturbance throughout journey.',
    score: 82,
    icon: '💡',
    isBest: false,
  },
];

const ndls = STATIONS.find(s => s.code === 'NDLS')!;
STATIONS.forEach((st, idx) => {
  if (st.code === 'NDLS') return;
  const dist = 300 + (idx * 45);
  
  MOCK_TRAINS.push({
    id: `hub-out-${st.code}`,
    name: `${st.city} Express`,
    number: `12${String(idx).padStart(3, '0')}`,
    type: 'EXPRESS',
    source: ndls.name,
    sourceCode: ndls.code,
    destination: st.name,
    destinationCode: st.code,
    departure: '08:00',
    arrival: '18:30',
    duration: '10h 30m',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    distance: dist,
    rating: 4.0,
    onTimePercent: 85,
    classes: [
      { name: '2nd AC', code: '2A', basePrice: 1200 + (idx * 10), available: 10, total: 40, status: 'AVAILABLE' },
      { name: '3rd AC', code: '3A', basePrice: 800 + (idx * 5), available: 20, total: 60, status: 'AVAILABLE' },
      { name: 'Sleeper', code: 'SL', basePrice: 350 + (idx * 3), available: 50, total: 120, status: 'AVAILABLE' },
    ],
  });

  MOCK_TRAINS.push({
    id: `hub-in-${st.code}`,
    name: `New Delhi Express`,
    number: `12${String(idx).padStart(3, '0')}R`,
    type: 'EXPRESS',
    source: st.name,
    sourceCode: st.code,
    destination: ndls.name,
    destinationCode: ndls.code,
    departure: '20:00',
    arrival: '06:30',
    duration: '10h 30m',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    distance: dist,
    rating: 4.1,
    onTimePercent: 82,
    classes: [
      { name: '2nd AC', code: '2A', basePrice: 1200 + (idx * 10), available: 5, total: 40, status: 'AVAILABLE' },
      { name: '3rd AC', code: '3A', basePrice: 800 + (idx * 5), available: 15, total: 60, status: 'AVAILABLE' },
      { name: 'Sleeper', code: 'SL', basePrice: 350 + (idx * 3), available: 30, total: 120, status: 'AVAILABLE' },
    ],
  });
});

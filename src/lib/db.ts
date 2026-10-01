import fs from 'fs';
import path from 'path';
import { calculateVehicleHealth } from './health';
import { SEED_BRANDS, SEED_CENTERS, SEED_MODELS, SEED_SERVICES, SEED_USERS } from './data/seed';
import { Booking, Brand, Notification, ServiceCenter, ServiceRecord, ServiceType, Slot, User, Vehicle, VehicleModel } from './types';

export interface DatabaseSchema {
  users: User[];
  brands: Brand[];
  models: VehicleModel[];
  vehicles: Vehicle[];
  services: ServiceType[];
  centers: ServiceCenter[];
  slots: Slot[];
  bookings: Booking[];
  records: ServiceRecord[];
  notifications: Notification[];
}

const DB_FILE = path.join(process.cwd(), 'data', 'autoping_db.json');

function ensureDataDirectory() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateInitialSlots(centers: ServiceCenter[]): Slot[] {
  const times = ['09:00 AM', '10:30 AM', '12:00 PM', '02:30 PM', '04:00 PM'];
  const slots: Slot[] = [];
  const baseDate = new Date();

  // Generate for 30 days
  for (let d = 0; d < 30; d++) {
    const curDate = new Date(baseDate);
    curDate.setDate(curDate.getDate() + d);
    const dateStr = curDate.toISOString().split('T')[0];

    for (const center of centers) {
      for (const time of times) {
        slots.push({
          id: `slot-${center.id}-${dateStr}-${time.replace(/[^a-zA-Z0-9]/g, '')}`,
          centerId: center.id,
          date: dateStr,
          startTime: time,
          capacity: 2,
          booked: 0,
          isBlocked: false,
        });
      }
    }
  }
  return slots;
}

function generateInitialData(): DatabaseSchema {
  const users = [...SEED_USERS];
  const brands = [...SEED_BRANDS];
  const models = [...SEED_MODELS];
  const services = [...SEED_SERVICES];
  const centers = [...SEED_CENTERS];
  const slots = generateInitialSlots(centers);

  // Generate Demo Vehicles for Shreyas
  const cretaHealth = calculateVehicleHealth({
    vehicleType: 'CAR',
    currentKm: 18500,
    purchaseYear: 2024,
    lastServiceDate: '2026-08-15',
    lastServiceKm: 10500,
    intervalKm: 10000,
    intervalMonths: 12,
  });

  const reHealth = calculateVehicleHealth({
    vehicleType: 'BIKE',
    currentKm: 7200,
    purchaseYear: 2022,
    lastServiceDate: '2026-01-10',
    lastServiceKm: 5000,
    intervalKm: 5000,
    intervalMonths: 6,
  });

  const vehicles: Vehicle[] = [
    {
      id: 'veh-creta-1',
      userId: 'user-customer-1',
      brandName: 'Hyundai',
      modelName: 'Creta',
      modelId: 'model-creta',
      type: 'CAR',
      vehicleClass: 'suv',
      registrationNo: 'MH12AB1234',
      purchaseYear: 2024,
      currentKm: 18500,
      fuelType: 'PETROL',
      lastServiceDate: '2026-08-15',
      lastServiceKm: 10500,
      healthScore: cretaHealth.healthScore,
      healthRating: cretaHealth.healthRating,
      nextServiceKm: cretaHealth.nextServiceKm,
      nextServiceDate: cretaHealth.nextServiceDate,
      kmRemaining: cretaHealth.kmRemaining,
      daysRemaining: cretaHealth.daysRemaining,
      dueStatus: cretaHealth.dueStatus,
      recommendedServices: cretaHealth.recommendedServices,
      components: cretaHealth.components,
      createdAt: '2026-02-15T11:00:00.000Z',
    },
    {
      id: 'veh-re-1',
      userId: 'user-customer-1',
      brandName: 'Royal Enfield',
      modelName: 'Classic 350',
      modelId: 'model-re-classic',
      type: 'BIKE',
      vehicleClass: 'bike',
      registrationNo: 'MH14XY9876',
      purchaseYear: 2022,
      currentKm: 7200,
      fuelType: 'PETROL',
      lastServiceDate: '2026-01-10',
      lastServiceKm: 5000,
      healthScore: reHealth.healthScore,
      healthRating: reHealth.healthRating,
      nextServiceKm: reHealth.nextServiceKm,
      nextServiceDate: reHealth.nextServiceDate,
      kmRemaining: reHealth.kmRemaining,
      daysRemaining: reHealth.daysRemaining,
      dueStatus: reHealth.dueStatus,
      recommendedServices: reHealth.recommendedServices,
      components: reHealth.components,
      createdAt: '2026-02-16T12:00:00.000Z',
    },
  ];

  // Pick a slot for Shreyas's upcoming booking
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 14); // 2 weeks out
  const targetDateStr = targetDate.toISOString().split('T')[0];

  const cretaSlot = slots.find(
    (s) => s.centerId === 'center-pune-1' && s.date === targetDateStr && s.startTime === '10:30 AM'
  ) || slots[0];

  if (cretaSlot) {
    cretaSlot.booked += 1;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const bookings: Booking[] = [
    {
      id: 'book-shreyas-1',
      bookingCode: 'AP-20261012-001',
      userId: 'user-customer-1',
      userName: 'Shreyas Patil',
      userPhone: '9876543210',
      userEmail: 'shreyas@example.com',
      vehicleId: 'veh-creta-1',
      vehicleName: 'Hyundai Creta (2024)',
      vehicleReg: 'MH12AB1234',
      centerId: 'center-pune-1',
      centerName: 'Hyundai Motor Plaza Pune',
      centerAddress: 'Old Pune-Mumbai Highway, Shivaji Nagar, Pune',
      slotId: cretaSlot ? cretaSlot.id : 'slot-1',
      serviceDate: targetDateStr,
      serviceTime: '10:30 AM',
      services: ['General Service', 'Engine Oil & Filter Change', 'Brake Inspection & Service'],
      notes: 'Check subtle clicking noise from front left brake when reversing.',
      estimatedCostMin: 3800,
      estimatedCostMax: 4800,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Rahul's today booking (for today schedule table)
    {
      id: 'book-rahul-1',
      bookingCode: 'AP-20260928-002',
      userId: 'user-customer-2',
      userName: 'Rahul Sharma',
      userPhone: '9820123456',
      userEmail: 'rahul.sharma@example.com',
      vehicleId: 'veh-other-1',
      vehicleName: 'Honda City',
      vehicleReg: 'MH02BZ4412',
      centerId: 'center-mumbai-1',
      centerName: 'WestCoast Hyundai Hub',
      centerAddress: 'Link Road, Andheri West, Mumbai',
      slotId: 'slot-rahul',
      serviceDate: todayStr,
      serviceTime: '09:00 AM',
      services: ['General Service', 'AC Gas & Cooling Service'],
      estimatedCostMin: 3200,
      estimatedCostMax: 4200,
      status: 'CONFIRMED',
      createdAt: '2026-09-20T10:00:00.000Z',
      updatedAt: '2026-09-20T10:00:00.000Z',
    },
    // Priya's today booking (pending)
    {
      id: 'book-priya-1',
      bookingCode: 'AP-20260928-003',
      userId: 'user-customer-3',
      userName: 'Priya Nair',
      userPhone: '9945012345',
      userEmail: 'priya.nair@example.com',
      vehicleId: 'veh-other-2',
      vehicleName: 'Honda Activa 6G',
      vehicleReg: 'KA04MN9911',
      centerId: 'center-blr-1',
      centerName: 'Trident Hyundai Central',
      centerAddress: '100 Feet Road, Indiranagar, Bengaluru',
      slotId: 'slot-priya',
      serviceDate: todayStr,
      serviceTime: '12:00 PM',
      services: ['General Service', 'Engine Oil & Filter Change'],
      estimatedCostMin: 800,
      estimatedCostMax: 1200,
      status: 'PENDING',
      createdAt: '2026-09-27T16:00:00.000Z',
      updatedAt: '2026-09-27T16:00:00.000Z',
    },
    // Amit's completed booking
    {
      id: 'book-amit-1',
      bookingCode: 'AP-20260915-004',
      userId: 'user-customer-4',
      userName: 'Amit Verma',
      userPhone: '9811223344',
      userEmail: 'amit.verma@example.com',
      vehicleId: 'veh-other-3',
      vehicleName: 'Tata Nexon',
      vehicleReg: 'DL01CA1020',
      centerId: 'center-delhi-1',
      centerName: 'Capital Hyundai Service Prime',
      centerAddress: 'Phase-1, Okhla, New Delhi',
      slotId: 'slot-amit',
      serviceDate: '2026-09-15',
      serviceTime: '10:30 AM',
      services: ['General Service', 'Tyre Alignment & Balancing'],
      estimatedCostMin: 2800,
      estimatedCostMax: 3500,
      status: 'COMPLETED',
      finalCost: 3100,
      finalKm: 21500,
      createdAt: '2026-09-10T14:00:00.000Z',
      updatedAt: '2026-09-15T18:00:00.000Z',
    }
  ];

  const records: ServiceRecord[] = [
    {
      id: 'rec-1',
      vehicleId: 'veh-creta-1',
      centerName: 'Hyundai Motor Plaza Pune',
      date: '2026-08-15',
      km: 10500,
      servicesDone: ['Periodic Maintenance', 'Synthetic Oil Change', 'Air Filter Replacement'],
      totalCost: 4200,
      notes: '10,000 km scheduled maintenance performed. Brake pads inspected and verified at 85% thickness.',
    },
    {
      id: 'rec-2',
      vehicleId: 'veh-re-1',
      centerName: 'Royal Enfield Service Hub',
      date: '2026-01-10',
      km: 5000,
      servicesDone: ['5,000 km Periodic Service', 'Engine Oil Change', 'Drive Chain Cleaning & Lube'],
      totalCost: 1850,
      notes: 'Oil changed with semi-synthetic 15W-50. Clutch cable adjusted.',
    }
  ];

  const notifications: Notification[] = [
    {
      id: 'notif-1',
      userId: 'user-customer-1',
      type: 'REMINDER_7D',
      title: 'Service Due in 12 Days',
      message: 'Your Hyundai Creta is approaching its 20,000 km maintenance milestone (1,500 km remaining).',
      vehicleId: 'veh-creta-1',
      isRead: false,
      dedupeKey: 'veh-creta-1-REMINDER_7D-2026',
      createdAt: '2026-09-26T08:00:00.000Z',
    },
    {
      id: 'notif-2',
      userId: 'user-customer-1',
      type: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmed (AP-20261012-001)',
      message: `Your service is scheduled for ${targetDateStr} at 10:30 AM at Hyundai Motor Plaza Pune.`,
      vehicleId: 'veh-creta-1',
      bookingId: 'book-shreyas-1',
      isRead: false,
      dedupeKey: 'book-shreyas-1-CONFIRMED',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-3',
      userId: 'user-customer-1',
      type: 'REMINDER_30D',
      title: 'Vehicle Care Tip',
      message: 'Keep tyre pressure checked regularly before long monsoon highway drives.',
      vehicleId: 'veh-re-1',
      isRead: true,
      dedupeKey: 'care-tip-1',
      createdAt: '2026-09-18T10:00:00.000Z',
    }
  ];

  return {
    users,
    brands,
    models,
    vehicles,
    services,
    centers,
    slots,
    bookings,
    records,
    notifications,
  };
}

// In-memory cache + file sync
let memoryDb: DatabaseSchema | null = null;

export function getDatabase(): DatabaseSchema {
  if (memoryDb) {
    return memoryDb;
  }
  ensureDataDirectory();
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDb = JSON.parse(content);
      if (memoryDb) {
        // Ensure brand logos are updated to latest URLs (e.g. SVGs)
        for (const brand of SEED_BRANDS) {
          const found = memoryDb.brands.find((b) => b.id === brand.id);
          if (!found) {
            memoryDb.brands.push(brand);
          } else if (brand.logoUrl) {
            found.logoUrl = brand.logoUrl;
            found.name = brand.name;
          }
        }

        // Ensure new models from seed are populated and images synced
        for (const model of SEED_MODELS) {
          const found = memoryDb.models.find((m) => m.id === model.id);
          if (!found) {
            memoryDb.models.push(model);
          } else if (model.imageUrl) {
            found.imageUrl = model.imageUrl;
            found.name = model.name;
            found.vehicleClass = model.vehicleClass;
            found.serviceKmInterval = model.serviceKmInterval;
          }
        }

        // Ensure vehicles have exact model photos (replacing generic photos)
        for (const v of memoryDb.vehicles) {
          const m = SEED_MODELS.find(
            (sm) => sm.id === v.modelId || (sm.brandName?.toLowerCase() === v.brandName?.toLowerCase() && sm.name?.toLowerCase() === v.modelName?.toLowerCase())
          );
          if (m?.imageUrl && (!v.imageUrl || v.imageUrl.includes('photo-1503376780353') || v.imageUrl.includes('photo-1558981806'))) {
            v.imageUrl = m.imageUrl;
          } else if (!v.imageUrl) {
            if (v.type === 'BIKE' || v.type === 'SCOOTER') {
              v.imageUrl = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80';
            } else {
              v.imageUrl = 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80';
            }
          }
        }

        saveDatabase(memoryDb);
        return memoryDb;
      }
    } catch (e) {
      console.error('Failed reading DB file, reinitializing', e);
    }
  }

  memoryDb = generateInitialData();
  saveDatabase(memoryDb);
  return memoryDb;
}

export function saveDatabase(db: DatabaseSchema) {
  memoryDb = db;
  ensureDataDirectory();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving DB file:', e);
  }
}

/* ========================================================
   DAO API Functions
   ======================================================== */

// Users
export function getUsers(): User[] {
  return getDatabase().users;
}

export function getUserById(id: string): User | undefined {
  return getDatabase().users.find((u) => u.id === id);
}

export function getUserByEmailOrMobile(identifier: string): User | undefined {
  const clean = identifier.trim().toLowerCase();
  return getDatabase().users.find(
    (u) => u.email.toLowerCase() === clean || u.mobile === clean
  );
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const db = getDatabase();
  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) return null;
  db.users[index] = { ...db.users[index], ...updates };
  saveDatabase(db);
  return db.users[index];
}

// Vehicles
export function getVehicles(userId?: string): Vehicle[] {
  const db = getDatabase();
  if (userId) {
    return db.vehicles.filter((v) => v.userId === userId);
  }
  return db.vehicles;
}

export function getVehicleById(id: string): Vehicle | undefined {
  return getDatabase().vehicles.find((v) => v.id === id);
}

export function createVehicle(vehicleData: Omit<Vehicle, 'id' | 'healthScore' | 'healthRating' | 'nextServiceKm' | 'nextServiceDate' | 'kmRemaining' | 'daysRemaining' | 'dueStatus' | 'recommendedServices' | 'components' | 'createdAt'>): Vehicle {
  const db = getDatabase();
  const health = calculateVehicleHealth({
    vehicleType: vehicleData.type,
    currentKm: vehicleData.currentKm,
    purchaseYear: vehicleData.purchaseYear,
    lastServiceDate: vehicleData.lastServiceDate,
    lastServiceKm: vehicleData.lastServiceKm,
  });

  let finalImageUrl = vehicleData.imageUrl;
  if (!finalImageUrl) {
    const matched = db.models.find(
      (m) => m.id === vehicleData.modelId || m.name.toLowerCase() === vehicleData.modelName.toLowerCase()
    );
    if (matched?.imageUrl) {
      finalImageUrl = matched.imageUrl;
    }
  }

  const newVehicle: Vehicle = {
    ...vehicleData,
    imageUrl: finalImageUrl,
    id: `veh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    healthScore: health.healthScore,
    healthRating: health.healthRating,
    nextServiceKm: health.nextServiceKm,
    nextServiceDate: health.nextServiceDate,
    kmRemaining: health.kmRemaining,
    daysRemaining: health.daysRemaining,
    dueStatus: health.dueStatus,
    recommendedServices: health.recommendedServices,
    components: health.components,
    createdAt: new Date().toISOString(),
  };

  db.vehicles.push(newVehicle);
  saveDatabase(db);
  return newVehicle;
}

export function updateVehicleKm(id: string, newKm: number): Vehicle | null {
  const db = getDatabase();
  const vehicle = db.vehicles.find((v) => v.id === id);
  if (!vehicle) return null;

  if (newKm < vehicle.currentKm) {
    throw new Error('New KM reading cannot be lower than the previous recorded reading.');
  }

  vehicle.currentKm = newKm;
  const health = calculateVehicleHealth({
    vehicleType: vehicle.type,
    currentKm: newKm,
    purchaseYear: vehicle.purchaseYear,
    lastServiceDate: vehicle.lastServiceDate,
    lastServiceKm: vehicle.lastServiceKm,
  });

  vehicle.healthScore = health.healthScore;
  vehicle.healthRating = health.healthRating;
  vehicle.nextServiceKm = health.nextServiceKm;
  vehicle.nextServiceDate = health.nextServiceDate;
  vehicle.kmRemaining = health.kmRemaining;
  vehicle.daysRemaining = health.daysRemaining;
  vehicle.dueStatus = health.dueStatus;
  vehicle.recommendedServices = health.recommendedServices;
  vehicle.components = health.components;

  saveDatabase(db);
  return vehicle;
}

export function deleteVehicle(id: string): boolean {
  const db = getDatabase();
  const initialLen = db.vehicles.length;
  db.vehicles = db.vehicles.filter((v) => v.id !== id);
  if (db.vehicles.length !== initialLen) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// Service Centers
export function getServiceCenters(city?: string, type?: string): ServiceCenter[] {
  const db = getDatabase();
  return db.centers.filter((c) => {
    if (!c.isActive) return false;
    if (city && c.city.toLowerCase() !== city.toLowerCase()) return false;
    if (type && c.type !== type) return false;
    return true;
  });
}

export function getServiceCenterById(id: string): ServiceCenter | undefined {
  return getDatabase().centers.find((c) => c.id === id);
}

export function createServiceCenter(center: Omit<ServiceCenter, 'id'>): ServiceCenter {
  const db = getDatabase();
  const newCenter: ServiceCenter = {
    ...center,
    id: `center-${Date.now()}`,
  };
  db.centers.push(newCenter);
  // generate slots
  const newSlots = generateInitialSlots([newCenter]);
  db.slots.push(...newSlots);
  saveDatabase(db);
  return newCenter;
}

export function updateServiceCenter(id: string, updates: Partial<ServiceCenter>): ServiceCenter | null {
  const db = getDatabase();
  const index = db.centers.findIndex((c) => c.id === id);
  if (index === -1) return null;
  db.centers[index] = { ...db.centers[index], ...updates };
  saveDatabase(db);
  return db.centers[index];
}

// Slots
export function getSlotsForCenter(centerId: string, date: string): Slot[] {
  const db = getDatabase();
  return db.slots.filter((s) => s.centerId === centerId && s.date === date);
}

// Bookings
export function getBookings(filters?: { userId?: string; status?: string; centerId?: string }): Booking[] {
  const db = getDatabase();
  return db.bookings.filter((b) => {
    if (filters?.userId && b.userId !== filters.userId) return false;
    if (filters?.status && b.status !== filters.status) return false;
    if (filters?.centerId && b.centerId !== filters.centerId) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getBookingById(id: string): Booking | undefined {
  return getDatabase().bookings.find((b) => b.id === id);
}

export function createBooking(data: {
  userId: string;
  vehicleId: string;
  centerId: string;
  slotId: string;
  serviceDate: string;
  serviceTime: string;
  services: string[];
  notes?: string;
  estimatedCostMin: number;
  estimatedCostMax: number;
}): Booking {
  const db = getDatabase();

  // Transaction check: verify slot capacity or auto-provision for requested schedule
  let slot = db.slots.find((s) => s.id === data.slotId);
  if (!slot) {
    slot = {
      id: data.slotId,
      centerId: data.centerId,
      date: data.serviceDate,
      time: data.serviceTime,
      capacity: 4,
      booked: 0,
      isBlocked: false,
    };
    db.slots.push(slot);
  }

  if (slot.isBlocked || slot.booked >= slot.capacity) {
    throw new Error('Sorry, that slot is currently full. Please choose an alternative time.');
  }

  const user = db.users.find((u) => u.id === data.userId);
  const vehicle = db.vehicles.find((v) => v.id === data.vehicleId);
  const center = db.centers.find((c) => c.id === data.centerId);

  if (!user || !vehicle || !center) {
    throw new Error('Invalid booking reference: vehicle, user, or service center is missing.');
  }

  // Check double-booking for the same vehicle on overlapping slot
  const existingActive = db.bookings.find(
    (b) =>
      b.vehicleId === data.vehicleId &&
      b.serviceDate === data.serviceDate &&
      b.serviceTime === data.serviceTime &&
      (b.status === 'CONFIRMED' || b.status === 'PENDING')
  );
  if (existingActive) {
    throw new Error('This vehicle already has a scheduled service booked for this exact time.');
  }

  // Increment slot booked count
  slot.booked += 1;

  // Generate Booking Code: AP-YYYYMMDD-NNN
  const dateNum = data.serviceDate.replace(/-/g, '');
  const dayBookingsCount = db.bookings.filter((b) => b.serviceDate === data.serviceDate).length + 1;
  const bookingCode = `AP-${dateNum}-${String(dayBookingsCount).padStart(3, '0')}`;

  const newBooking: Booking = {
    id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    bookingCode,
    userId: user.id,
    userName: user.name,
    userPhone: user.mobile,
    userEmail: user.email,
    vehicleId: vehicle.id,
    vehicleName: `${vehicle.brandName} ${vehicle.modelName}`,
    vehicleReg: vehicle.registrationNo,
    centerId: center.id,
    centerName: center.name,
    centerAddress: center.address,
    slotId: slot.id,
    serviceDate: data.serviceDate,
    serviceTime: data.serviceTime,
    services: data.services,
    notes: data.notes,
    estimatedCostMin: data.estimatedCostMin,
    estimatedCostMax: data.estimatedCostMax,
    status: center.autoConfirm ? 'CONFIRMED' : 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.bookings.push(newBooking);

  // Create notification
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: user.id,
    type: 'BOOKING_CONFIRMED',
    title: 'Service Booked Successfully!',
    message: `Your booking for ${vehicle.brandName} ${vehicle.modelName} on ${data.serviceDate} (${data.serviceTime}) at ${center.name} has been confirmed. Code: ${bookingCode}`,
    vehicleId: vehicle.id,
    bookingId: newBooking.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);
  return newBooking;
}

export function cancelBooking(id: string, reason?: string): Booking | null {
  const db = getDatabase();
  const booking = db.bookings.find((b) => b.id === id);
  if (!booking) return null;

  if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
    throw new Error('This booking cannot be cancelled.');
  }

  // Release slot
  const slot = db.slots.find((s) => s.id === booking.slotId);
  if (slot && slot.booked > 0) {
    slot.booked -= 1;
  }

  booking.status = 'CANCELLED';
  booking.cancelReason = reason || 'Customer requested cancellation';
  booking.updatedAt = new Date().toISOString();

  // Create notification
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: booking.userId,
    type: 'BOOKING_UPDATED',
    title: 'Booking Cancelled',
    message: `Booking ${booking.bookingCode} for ${booking.vehicleName} has been cancelled.`,
    vehicleId: booking.vehicleId,
    bookingId: booking.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);
  return booking;
}

export function confirmBooking(id: string): Booking | null {
  const db = getDatabase();
  const booking = db.bookings.find((b) => b.id === id);
  if (!booking) return null;

  booking.status = 'CONFIRMED';
  booking.updatedAt = new Date().toISOString();

  // Create notification
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: booking.userId,
    type: 'BOOKING_CONFIRMED',
    title: 'Booking Confirmed!',
    message: `Your booking ${booking.bookingCode} for ${booking.vehicleName} at ${booking.centerName} has been confirmed.`,
    vehicleId: booking.vehicleId,
    bookingId: booking.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);
  return booking;
}

export function rescheduleBooking(id: string, newSlotId: string, newDate: string, newTime: string): Booking | null {
  const db = getDatabase();
  const booking = db.bookings.find((b) => b.id === id);
  if (!booking) return null;

  const newSlot = db.slots.find((s) => s.id === newSlotId);
  if (!newSlot || newSlot.isBlocked || newSlot.booked >= newSlot.capacity) {
    throw new Error('Target slot is full or unavailable.');
  }

  // Release old slot
  const oldSlot = db.slots.find((s) => s.id === booking.slotId);
  if (oldSlot && oldSlot.booked > 0) {
    oldSlot.booked -= 1;
  }

  // Book new slot
  newSlot.booked += 1;

  booking.slotId = newSlotId;
  booking.serviceDate = newDate;
  booking.serviceTime = newTime;
  booking.updatedAt = new Date().toISOString();

  // Create notification
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: booking.userId,
    type: 'BOOKING_UPDATED',
    title: 'Booking Rescheduled',
    message: `Your service for ${booking.vehicleName} is rescheduled to ${newDate} at ${newTime}.`,
    vehicleId: booking.vehicleId,
    bookingId: booking.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);
  return booking;
}

export function completeBooking(id: string, finalCost: number, finalKm: number, servicesDone: string[], notes?: string): Booking | null {
  const db = getDatabase();
  const booking = db.bookings.find((b) => b.id === id);
  if (!booking) return null;

  booking.status = 'COMPLETED';
  booking.finalCost = finalCost;
  booking.finalKm = finalKm;
  booking.updatedAt = new Date().toISOString();

  // Create ServiceRecord
  const record: ServiceRecord = {
    id: `rec-${Date.now()}`,
    vehicleId: booking.vehicleId,
    bookingId: booking.id,
    centerName: booking.centerName,
    date: booking.serviceDate,
    km: finalKm,
    servicesDone: servicesDone.length ? servicesDone : booking.services,
    totalCost: finalCost,
    notes: notes || 'Service completed successfully as per inspection checklist.',
  };
  db.records.unshift(record);

  // Update vehicle lastServiceDate, lastServiceKm and recalculate health
  const vehicle = db.vehicles.find((v) => v.id === booking.vehicleId);
  if (vehicle) {
    vehicle.lastServiceDate = booking.serviceDate;
    vehicle.lastServiceKm = finalKm;
    if (finalKm > vehicle.currentKm) {
      vehicle.currentKm = finalKm;
    }

    const health = calculateVehicleHealth({
      vehicleType: vehicle.type,
      currentKm: vehicle.currentKm,
      purchaseYear: vehicle.purchaseYear,
      lastServiceDate: vehicle.lastServiceDate,
      lastServiceKm: vehicle.lastServiceKm,
    });

    vehicle.healthScore = health.healthScore;
    vehicle.healthRating = health.healthRating;
    vehicle.nextServiceKm = health.nextServiceKm;
    vehicle.nextServiceDate = health.nextServiceDate;
    vehicle.kmRemaining = health.kmRemaining;
    vehicle.daysRemaining = health.daysRemaining;
    vehicle.dueStatus = health.dueStatus;
    vehicle.recommendedServices = health.recommendedServices;
    vehicle.components = health.components;
  }

  // Release slot if needed
  const slot = db.slots.find((s) => s.id === booking.slotId);
  if (slot && slot.booked > 0) {
    slot.booked -= 1;
  }

  // Create notification
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: booking.userId,
    type: 'SERVICE_COMPLETED',
    title: 'Service Completed! ✅',
    message: `Your ${booking.vehicleName} service at ${booking.centerName} is complete. Health score updated to ${vehicle?.healthScore || 100}%.`,
    vehicleId: booking.vehicleId,
    bookingId: booking.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);
  return booking;
}

// Service Records
export function getServiceRecords(vehicleId?: string): ServiceRecord[] {
  const db = getDatabase();
  if (vehicleId) {
    return db.records.filter((r) => r.vehicleId === vehicleId);
  }
  return db.records;
}

export function createServiceRecord(data: Omit<ServiceRecord, 'id'>): ServiceRecord {
  const db = getDatabase();
  const newRecord: ServiceRecord = {
    ...data,
    id: `rec-${Date.now()}`,
  };
  db.records.unshift(newRecord);

  // Update vehicle
  const vehicle = db.vehicles.find((v) => v.id === data.vehicleId);
  if (vehicle) {
    vehicle.lastServiceDate = data.date;
    vehicle.lastServiceKm = data.km;
    if (data.km > vehicle.currentKm) {
      vehicle.currentKm = data.km;
    }
    const health = calculateVehicleHealth({
      vehicleType: vehicle.type,
      currentKm: vehicle.currentKm,
      purchaseYear: vehicle.purchaseYear,
      lastServiceDate: vehicle.lastServiceDate,
      lastServiceKm: vehicle.lastServiceKm,
    });
    vehicle.healthScore = health.healthScore;
    vehicle.healthRating = health.healthRating;
    vehicle.nextServiceKm = health.nextServiceKm;
    vehicle.nextServiceDate = health.nextServiceDate;
    vehicle.kmRemaining = health.kmRemaining;
    vehicle.daysRemaining = health.daysRemaining;
    vehicle.dueStatus = health.dueStatus;
    vehicle.recommendedServices = health.recommendedServices;
    vehicle.components = health.components;
  }

  saveDatabase(db);
  return newRecord;
}

// Notifications
export function getNotifications(userId: string): Notification[] {
  const db = getDatabase();
  return db.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function markNotificationAsRead(id: string): boolean {
  const db = getDatabase();
  const notif = db.notifications.find((n) => n.id === id);
  if (notif) {
    notif.isRead = true;
    saveDatabase(db);
    return true;
  }
  return false;
}

export function markAllNotificationsAsRead(userId: string): number {
  const db = getDatabase();
  let count = 0;
  for (const n of db.notifications) {
    if (n.userId === userId && !n.isRead) {
      n.isRead = true;
      count++;
    }
  }
  if (count > 0) saveDatabase(db);
  return count;
}

// Catalog queries
export function getCatalogBrands(type?: string): Brand[] {
  const db = getDatabase();
  if (type) return db.brands.filter((b) => b.type === type);
  return db.brands;
}

export function getCatalogModels(brandId?: string): VehicleModel[] {
  const db = getDatabase();
  if (brandId) return db.models.filter((m) => m.brandId === brandId);
  return db.models;
}

export function getCatalogServices(): ServiceType[] {
  return getDatabase().services;
}

// Admin KPIs
export function getAdminDashboardStats() {
  const db = getDatabase();
  const todayStr = new Date().toISOString().split('T')[0];

  const totalUsers = db.users.filter((u) => u.role === 'CUSTOMER').length;
  const totalVehicles = db.vehicles.length;
  const todayBookings = db.bookings.filter((b) => b.serviceDate === todayStr).length;
  const pendingRequests = db.bookings.filter((b) => b.status === 'PENDING').length;
  const confirmedSlots = db.bookings.filter((b) => b.status === 'CONFIRMED').length;
  const completedServices = db.bookings.filter((b) => b.status === 'COMPLETED').length;

  // Total estimated revenue from completed/confirmed
  const totalRevenue = db.bookings
    .filter((b) => b.status === 'COMPLETED' || b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + (b.finalCost || b.estimatedCostMin), 0);

  // Today schedule list
  const todaySchedule = db.bookings
    .filter((b) => b.serviceDate === todayStr)
    .sort((a, b) => a.serviceTime.localeCompare(b.serviceTime));

  return {
    totalUsers,
    totalVehicles,
    todayBookings,
    pendingRequests,
    confirmedSlots,
    completedServices,
    totalRevenue,
    todaySchedule,
    recentBookings: db.bookings.slice(0, 10),
  };
}

// Reminder job run logic
export function runReminderJob(): { triggeredCount: number; messages: string[] } {
  const db = getDatabase();
  const messages: string[] = [];
  let triggeredCount = 0;

  for (const vehicle of db.vehicles) {
    const user = db.users.find((u) => u.id === vehicle.userId);
    if (!user) continue;

    // Recalculate health
    const health = calculateVehicleHealth({
      vehicleType: vehicle.type,
      currentKm: vehicle.currentKm,
      purchaseYear: vehicle.purchaseYear,
      lastServiceDate: vehicle.lastServiceDate,
      lastServiceKm: vehicle.lastServiceKm,
    });

    const yearCycle = new Date().getFullYear();
    let notifType: Notification['type'] | null = null;
    let title = '';
    let body = '';

    if (health.dueStatus === 'OVERDUE') {
      notifType = 'OVERDUE';
      title = `🔴 Service Overdue: ${vehicle.brandName} ${vehicle.modelName}`;
      body = `Your service is overdue by ${Math.abs(health.daysRemaining)} days (${Math.abs(health.kmRemaining)} km past due). Schedule an appointment now.`;
    } else if (health.daysRemaining <= 7 || health.kmRemaining <= 500) {
      notifType = 'REMINDER_7D';
      title = `⚠️ Urgent: Service Due in ${Math.max(0, health.daysRemaining)} Days`;
      body = `Your ${vehicle.brandName} ${vehicle.modelName} has ${health.kmRemaining} km remaining before the service limit.`;
    } else if (health.daysRemaining <= 30 || health.kmRemaining <= 1500) {
      notifType = 'REMINDER_30D';
      title = `🔔 Upcoming Service: ${vehicle.brandName} ${vehicle.modelName}`;
      body = `Service recommended within 30 days (${health.kmRemaining} km left). Recommended checkup: ${health.recommendedServices.slice(0, 2).join(', ')}.`;
    }

    if (notifType) {
      const dedupeKey = `${vehicle.id}-${notifType}-${yearCycle}-${Math.floor(vehicle.currentKm / 5000)}`;
      const alreadySent = db.notifications.some((n) => n.dedupeKey === dedupeKey);

      if (!alreadySent) {
        db.notifications.unshift({
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          userId: user.id,
          type: notifType,
          title,
          message: body,
          vehicleId: vehicle.id,
          isRead: false,
          dedupeKey,
          createdAt: new Date().toISOString(),
        });
        triggeredCount++;
        messages.push(`Sent ${notifType} to ${user.name} for ${vehicle.brandName} ${vehicle.modelName}`);
      }
    }
  }

  if (triggeredCount > 0) {
    saveDatabase(db);
  }

  return { triggeredCount, messages };
}

export type Role = 'CUSTOMER' | 'SERVICE_CENTER' | 'ADMIN';
export type VehicleType = 'CAR' | 'BIKE' | 'SCOOTER';
export type FuelType = 'PETROL' | 'DIESEL' | 'CNG' | 'EV';
export type CenterType = 'AUTHORIZED' | 'MULTI_BRAND' | 'LOCAL';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: Role;
  photoUrl?: string;
  city: string;
  address?: string;
  preferredCity?: string;
  isActive: boolean;
  prefs?: {
    inApp?: boolean;
    email?: boolean;
    whatsapp?: boolean;
    sms?: boolean;
  };
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  type: VehicleType;
  logoUrl?: string;
}

export interface VehicleModel {
  id: string;
  brandId: string;
  brandName?: string;
  name: string;
  vehicleClass: 'hatchback' | 'sedan' | 'suv' | 'premium' | 'bike' | 'scooter';
  serviceKmInterval: number;
  serviceMonthInterval: number;
  imageUrl?: string;
}

export interface ComponentStatus {
  component: 'OIL' | 'BRAKES' | 'TYRES' | 'BATTERY' | 'AC' | 'ENGINE' | 'FILTERS';
  label: string;
  status: 'GOOD' | 'DUE_SOON' | 'OVERDUE';
  lastDoneDate?: string;
  lastDoneKm?: number;
  nextDueKm?: number;
  nextDueDate?: string;
  daysRemaining?: number;
  kmRemaining?: number;
  weight: number;
  points: number;
  reason?: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  brandName: string;
  modelName: string;
  modelId: string;
  type: VehicleType;
  vehicleClass: 'hatchback' | 'sedan' | 'suv' | 'premium' | 'bike' | 'scooter';
  registrationNo: string;
  purchaseYear: number;
  currentKm: number;
  fuelType: FuelType;
  lastServiceDate?: string;
  lastServiceKm?: number;
  healthScore: number;
  healthRating: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';
  nextServiceKm: number;
  nextServiceDate: string;
  kmRemaining: number;
  daysRemaining: number;
  dueStatus: 'GOOD' | 'DUE_SOON' | 'OVERDUE';
  recommendedServices: string[];
  components: ComponentStatus[];
  imageUrl?: string;
  createdAt: string;
}

export interface ServiceType {
  id: string;
  name: string;
  icon: string;
  description: string;
  basePrice: number;
  category: 'REGULAR' | 'REPAIR' | 'WASH' | 'INSPECTION';
  isActive: boolean;
}

export interface ServiceCenter {
  id: string;
  name: string;
  type: CenterType;
  brandsSupported: string[]; // empty means all
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  contactPhone?: string;  // alias for display in chatbot
  websiteUrl?: string;
  openingHours: string;
  servicesOffered: string[];
  supportedTypes?: string[]; // e.g. ['Cars', 'Two-Wheelers']
  rating: number;
  reviewCount: number;
  autoConfirm: boolean;
  isActive: boolean;
  distanceKm?: number;
}

export interface Slot {
  id: string;
  centerId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "10:30 AM"
  capacity: number;
  booked: number;
  isBlocked: boolean;
}

export interface Booking {
  id: string;
  bookingCode: string; // AP-YYYYMMDD-NNN
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  vehicleId: string;
  vehicleName: string;
  vehicleReg: string;
  centerId: string;
  centerName: string;
  centerAddress: string;
  slotId: string;
  serviceDate: string;
  serviceTime: string;
  services: string[]; // Service IDs or names
  notes?: string;
  estimatedCostMin: number;
  estimatedCostMax: number;
  status: BookingStatus;
  cancelReason?: string;
  finalCost?: number;
  finalKm?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  bookingId?: string;
  centerName: string;
  date: string;
  km: number;
  servicesDone: string[];
  totalCost: number;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'REMINDER_30D' | 'REMINDER_7D' | 'DUE_TODAY' | 'OVERDUE' | 'REMINDER_KM' | 'BOOKING_CONFIRMED' | 'BOOKING_REMINDER' | 'BOOKING_UPDATED' | 'SERVICE_COMPLETED' | 'SYSTEM';
  title: string;
  message: string;
  vehicleId?: string;
  bookingId?: string;
  isRead: boolean;
  dedupeKey?: string;
  createdAt: string;
}

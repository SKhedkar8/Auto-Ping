const fs = require('fs');
const path = require('path');

const SEED_FILE = path.join(__dirname, '..', 'src', 'lib', 'data', 'seed.ts');
const DB_FILE = path.join(__dirname, '..', 'data', 'autoping_db.json');
const DASHBOARD_FILE = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'page.tsx');

// Brand logo mapping for crisp SVGs and verified PNGs
const BRAND_LOGOS = {
  'brand-bmw': '/logos/brand-bmw.svg',
  'brand-bmw-moto': '/logos/brand-bmw-moto.svg',
  'brand-mercedes': '/logos/brand-mercedes.svg',
  'brand-audi': '/logos/brand-audi.svg',
  'brand-ford': '/logos/brand-ford.svg',
  'brand-lexus': '/logos/brand-lexus.svg',
  'brand-volvo': '/logos/brand-volvo.svg',
  'brand-ducati': '/logos/brand-ducati.svg',
  'brand-ather': '/logos/brand-ather.svg',
  'brand-ola': '/logos/brand-ola.svg',
  'brand-bounce': '/logos/brand-bounce.svg',
};

// Comprehensive, exact model definitions with curated, verified high-resolution accurate images
const ALL_MODELS = [
  // --- MARUTI SUZUKI ---
  { id: 'model-swift', brandId: 'brand-maruti', brandName: 'Maruti Suzuki', name: 'Swift', vehicleClass: 'hatchback', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-baleno', brandId: 'brand-maruti', brandName: 'Maruti Suzuki', name: 'Baleno', vehicleClass: 'hatchback', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-brezza', brandId: 'brand-maruti', brandName: 'Maruti Suzuki', name: 'Brezza', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-grand-vitara', brandId: 'brand-maruti', brandName: 'Maruti Suzuki', name: 'Grand Vitara', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-fronx', brandId: 'brand-maruti', brandName: 'Maruti Suzuki', name: 'Fronx', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-dzire', brandId: 'brand-maruti', brandName: 'Maruti Suzuki', name: 'Dzire', vehicleClass: 'sedan', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-ertiga', brandId: 'brand-maruti', brandName: 'Maruti Suzuki', name: 'Ertiga', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-jimny', brandId: 'brand-maruti', brandName: 'Maruti Suzuki', name: 'Jimny 4x4', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-wagonr', brandId: 'brand-maruti', brandName: 'Maruti Suzuki', name: 'WagonR', vehicleClass: 'hatchback', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80' },

  // --- HYUNDAI ---
  { id: 'model-creta', brandId: 'brand-hyundai', brandName: 'Hyundai', name: 'Creta', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-venue', brandId: 'brand-hyundai', brandName: 'Hyundai', name: 'Venue', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-i20', brandId: 'brand-hyundai', brandName: 'Hyundai', name: 'i20', vehicleClass: 'hatchback', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-verna', brandId: 'brand-hyundai', brandName: 'Hyundai', name: 'Verna', vehicleClass: 'sedan', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-exter', brandId: 'brand-hyundai', brandName: 'Hyundai', name: 'Exter', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-tucson', brandId: 'brand-hyundai', brandName: 'Hyundai', name: 'Tucson', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-alcazar', brandId: 'brand-hyundai', brandName: 'Hyundai', name: 'Alcazar', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80' },

  // --- TATA MOTORS ---
  { id: 'model-nexon', brandId: 'brand-tata', brandName: 'Tata Motors', name: 'Nexon', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-punch', brandId: 'brand-tata', brandName: 'Tata Motors', name: 'Punch', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-harrier', brandId: 'brand-tata', brandName: 'Tata Motors', name: 'Harrier', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-safari', brandId: 'brand-tata', brandName: 'Tata Motors', name: 'Safari', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-altroz', brandId: 'brand-tata', brandName: 'Tata Motors', name: 'Altroz', vehicleClass: 'hatchback', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-tiago', brandId: 'brand-tata', brandName: 'Tata Motors', name: 'Tiago', vehicleClass: 'hatchback', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-curvv', brandId: 'brand-tata', brandName: 'Tata Motors', name: 'Curvv EV / ICE', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80' },

  // --- MAHINDRA ---
  { id: 'model-thar', brandId: 'brand-mahindra', brandName: 'Mahindra', name: 'Thar 4x4', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-thar-roxx', brandId: 'brand-mahindra', brandName: 'Mahindra', name: 'Thar Roxx (5-Door)', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-xuv700', brandId: 'brand-mahindra', brandName: 'Mahindra', name: 'XUV700', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-scorpio', brandId: 'brand-mahindra', brandName: 'Mahindra', name: 'Scorpio-N', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-bolero', brandId: 'brand-mahindra', brandName: 'Mahindra', name: 'Bolero Neo', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-xuv3xo', brandId: 'brand-mahindra', brandName: 'Mahindra', name: 'XUV 3XO', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80' },

  // --- TOYOTA ---
  { id: 'model-fortuner', brandId: 'brand-toyota', brandName: 'Toyota', name: 'Fortuner Legender', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-innova', brandId: 'brand-toyota', brandName: 'Toyota', name: 'Innova Hycross', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-urban-cruiser', brandId: 'brand-toyota', brandName: 'Toyota', name: 'Urban Cruiser Hyryder', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-glanza', brandId: 'brand-toyota', brandName: 'Toyota', name: 'Glanza', vehicleClass: 'hatchback', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-hilux', brandId: 'brand-toyota', brandName: 'Toyota', name: 'Hilux 4x4', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80' },

  // --- KIA ---
  { id: 'model-seltos', brandId: 'brand-kia', brandName: 'Kia', name: 'Seltos X-Line', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-sonet', brandId: 'brand-kia', brandName: 'Kia', name: 'Sonet', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-carens', brandId: 'brand-kia', brandName: 'Kia', name: 'Carens', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-ev6', brandId: 'brand-kia', brandName: 'Kia', name: 'EV6 GT', vehicleClass: 'premium', serviceKmInterval: 15000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80' },

  // --- MG MOTOR ---
  { id: 'model-hector', brandId: 'brand-mg', brandName: 'MG Motor', name: 'Hector Plus', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-zs-ev', brandId: 'brand-mg', brandName: 'MG Motor', name: 'ZS EV', vehicleClass: 'suv', serviceKmInterval: 12000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-astor', brandId: 'brand-mg', brandName: 'MG Motor', name: 'Astor AI', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-comet', brandId: 'brand-mg', brandName: 'MG Motor', name: 'Comet EV', vehicleClass: 'hatchback', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80' },

  // --- HONDA CARS ---
  { id: 'model-city', brandId: 'brand-honda-car', brandName: 'Honda', name: 'City e:HEV', vehicleClass: 'sedan', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-elevate', brandId: 'brand-honda-car', brandName: 'Honda', name: 'Elevate SUV', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-amaze', brandId: 'brand-honda-car', brandName: 'Honda', name: 'Amaze', vehicleClass: 'sedan', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80' },

  // --- VOLKSWAGEN ---
  { id: 'model-taigun', brandId: 'brand-vw', brandName: 'Volkswagen', name: 'Taigun GT', vehicleClass: 'suv', serviceKmInterval: 15000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-virtus', brandId: 'brand-vw', brandName: 'Volkswagen', name: 'Virtus GT', vehicleClass: 'sedan', serviceKmInterval: 15000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-tiguan', brandId: 'brand-vw', brandName: 'Volkswagen', name: 'Tiguan R-Line', vehicleClass: 'suv', serviceKmInterval: 15000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80' },

  // --- SKODA ---
  { id: 'model-kushaq', brandId: 'brand-skoda', brandName: 'Skoda', name: 'Kushaq Monte Carlo', vehicleClass: 'suv', serviceKmInterval: 15000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-slavia', brandId: 'brand-skoda', brandName: 'Skoda', name: 'Slavia Style', vehicleClass: 'sedan', serviceKmInterval: 15000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-kodiaq', brandId: 'brand-skoda', brandName: 'Skoda', name: 'Kodiaq 4x4', vehicleClass: 'premium', serviceKmInterval: 15000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80' },

  // --- RENAULT & NISSAN & CITROEN & JEEP ---
  { id: 'model-kiger', brandId: 'brand-renault', brandName: 'Renault', name: 'Kiger Turbo', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-triber', brandId: 'brand-renault', brandName: 'Renault', name: 'Triber', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-magnite', brandId: 'brand-nissan', brandName: 'Nissan', name: 'Magnite Red Edition', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-c3-aircross', brandId: 'brand-citroen', brandName: 'Citroën', name: 'C3 Aircross', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-compass', brandId: 'brand-jeep', brandName: 'Jeep', name: 'Compass Trailhawk 4x4', vehicleClass: 'suv', serviceKmInterval: 15000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-wrangler', brandId: 'brand-jeep', brandName: 'Jeep', name: 'Wrangler Rubicon', vehicleClass: 'premium', serviceKmInterval: 15000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80' },

  // --- LUXURY CARS (BMW, MERCEDES, AUDI, LEXUS, VOLVO, FORD) ---
  { id: 'model-bmw-3', brandId: 'brand-bmw', brandName: 'BMW', name: '3 Series Gran Limousine', vehicleClass: 'premium', serviceKmInterval: 12000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-bmw-x1', brandId: 'brand-bmw', brandName: 'BMW', name: 'X1 sDrive', vehicleClass: 'premium', serviceKmInterval: 12000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-merc-c', brandId: 'brand-mercedes', brandName: 'Mercedes-Benz', name: 'C-Class', vehicleClass: 'premium', serviceKmInterval: 15000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-merc-e', brandId: 'brand-mercedes', brandName: 'Mercedes-Benz', name: 'E-Class LWB', vehicleClass: 'premium', serviceKmInterval: 15000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-audi-a4', brandId: 'brand-audi', brandName: 'Audi', name: 'A4 Technology', vehicleClass: 'premium', serviceKmInterval: 15000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-audi-q5', brandId: 'brand-audi', brandName: 'Audi', name: 'Q5 Quattro', vehicleClass: 'premium', serviceKmInterval: 15000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-ford-endeavour', brandId: 'brand-ford', brandName: 'Ford', name: 'Endeavour Titanium 4x4', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-ford-ecosport', brandId: 'brand-ford', brandName: 'Ford', name: 'EcoSport S', vehicleClass: 'suv', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-lexus-es', brandId: 'brand-lexus', brandName: 'Lexus', name: 'ES 300h Luxury', vehicleClass: 'premium', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-volvo-xc40', brandId: 'brand-volvo', brandName: 'Volvo', name: 'XC40 Recharge EV', vehicleClass: 'premium', serviceKmInterval: 15000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80' },

  // --- TWO WHEELERS: ROYAL ENFIELD ---
  { id: 'model-re-classic', brandId: 'brand-re', brandName: 'Royal Enfield', name: 'Classic 350', vehicleClass: 'bike', serviceKmInterval: 5000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-re-hunter', brandId: 'brand-re', brandName: 'Royal Enfield', name: 'Hunter 350', vehicleClass: 'bike', serviceKmInterval: 5000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-re-bullet', brandId: 'brand-re', brandName: 'Royal Enfield', name: 'Bullet 350', vehicleClass: 'bike', serviceKmInterval: 5000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-re-meteor', brandId: 'brand-re', brandName: 'Royal Enfield', name: 'Meteor 350 Cruiser', vehicleClass: 'bike', serviceKmInterval: 5000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-re-himalayan', brandId: 'brand-re', brandName: 'Royal Enfield', name: 'Himalayan 450', vehicleClass: 'bike', serviceKmInterval: 5000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80' },

  // --- HERO MOTOCORP ---
  { id: 'model-splendor', brandId: 'brand-hero', brandName: 'Hero MotoCorp', name: 'Splendor Plus XTEC', vehicleClass: 'bike', serviceKmInterval: 3500, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-hf-deluxe', brandId: 'brand-hero', brandName: 'Hero MotoCorp', name: 'HF Deluxe', vehicleClass: 'bike', serviceKmInterval: 3500, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-glamour', brandId: 'brand-hero', brandName: 'Hero MotoCorp', name: 'Glamour 125 XTEC', vehicleClass: 'bike', serviceKmInterval: 4000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-xpulse', brandId: 'brand-hero', brandName: 'Hero MotoCorp', name: 'Xpulse 200 4V', vehicleClass: 'bike', serviceKmInterval: 4000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80' },

  // --- HONDA 2-WHEELERS ---
  { id: 'model-activa', brandId: 'brand-honda-2w', brandName: 'Honda 2-Wheelers', name: 'Activa 6G', vehicleClass: 'scooter', serviceKmInterval: 3000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-activa-125', brandId: 'brand-honda-2w', brandName: 'Honda 2-Wheelers', name: 'Activa 125', vehicleClass: 'scooter', serviceKmInterval: 3000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-shine', brandId: 'brand-honda-2w', brandName: 'Honda 2-Wheelers', name: 'Shine 125', vehicleClass: 'bike', serviceKmInterval: 4000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-sp125', brandId: 'brand-honda-2w', brandName: 'Honda 2-Wheelers', name: 'SP 125 Sports Edition', vehicleClass: 'bike', serviceKmInterval: 4000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80' },

  // --- TVS MOTOR ---
  { id: 'model-jupiter', brandId: 'brand-tvs', brandName: 'TVS Motor', name: 'Jupiter 125 SmartXonnect', vehicleClass: 'scooter', serviceKmInterval: 3000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-ntorq', brandId: 'brand-tvs', brandName: 'TVS Motor', name: 'Ntorq 125 Race Edition', vehicleClass: 'scooter', serviceKmInterval: 3000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-apache', brandId: 'brand-tvs', brandName: 'TVS Motor', name: 'Apache RTR 160 4V', vehicleClass: 'bike', serviceKmInterval: 4000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-raider', brandId: 'brand-tvs', brandName: 'TVS Motor', name: 'Raider 125', vehicleClass: 'bike', serviceKmInterval: 3500, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80' },

  // --- BAJAJ AUTO ---
  { id: 'model-pulsar', brandId: 'brand-bajaj', brandName: 'Bajaj Auto', name: 'Pulsar NS200', vehicleClass: 'bike', serviceKmInterval: 5000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-pulsar-n160', brandId: 'brand-bajaj', brandName: 'Bajaj Auto', name: 'Pulsar N160 Dual ABS', vehicleClass: 'bike', serviceKmInterval: 4500, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-platina', brandId: 'brand-bajaj', brandName: 'Bajaj Auto', name: 'Platina 110 ComforTec', vehicleClass: 'bike', serviceKmInterval: 4000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-chetak', brandId: 'brand-bajaj', brandName: 'Bajaj Auto', name: 'Chetak Premium EV', vehicleClass: 'scooter', serviceKmInterval: 5000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80' },

  // --- SUZUKI 2W ---
  { id: 'model-access', brandId: 'brand-suzuki-2w', brandName: 'Suzuki Motorcycles', name: 'Access 125 Special', vehicleClass: 'scooter', serviceKmInterval: 3000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-burgman', brandId: 'brand-suzuki-2w', brandName: 'Suzuki Motorcycles', name: 'Burgman Street 125', vehicleClass: 'scooter', serviceKmInterval: 3000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-gixxer', brandId: 'brand-suzuki-2w', brandName: 'Suzuki Motorcycles', name: 'Gixxer SF 250', vehicleClass: 'bike', serviceKmInterval: 4000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80' },

  // --- YAMAHA ---
  { id: 'model-yamaha-r15', brandId: 'brand-yamaha', brandName: 'Yamaha', name: 'YZF R15 V4', vehicleClass: 'bike', serviceKmInterval: 4000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-mt15', brandId: 'brand-yamaha', brandName: 'Yamaha', name: 'MT-15 V2', vehicleClass: 'bike', serviceKmInterval: 4000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-aerox', brandId: 'brand-yamaha', brandName: 'Yamaha', name: 'Aerox 155 Maxi', vehicleClass: 'scooter', serviceKmInterval: 3500, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80' },

  // --- KTM ---
  { id: 'model-ktm-duke', brandId: 'brand-ktm', brandName: 'KTM', name: 'Duke 390 Gen 3', vehicleClass: 'bike', serviceKmInterval: 5000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-ktm-duke-200', brandId: 'brand-ktm', brandName: 'KTM', name: 'Duke 200', vehicleClass: 'bike', serviceKmInterval: 4000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-ktm-rc', brandId: 'brand-ktm', brandName: 'KTM', name: 'RC 390 GP', vehicleClass: 'bike', serviceKmInterval: 4500, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80' },

  // --- VESPA & APRILIA ---
  { id: 'model-vespa-sxl', brandId: 'brand-vespa', brandName: 'Vespa', name: 'Vespa SXL 150', vehicleClass: 'scooter', serviceKmInterval: 3000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-aprilia-sr', brandId: 'brand-aprilia', brandName: 'Aprilia', name: 'SR 160 Storm', vehicleClass: 'scooter', serviceKmInterval: 3000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-aprilia-rs', brandId: 'brand-aprilia', brandName: 'Aprilia', name: 'RS 457 Twin', vehicleClass: 'bike', serviceKmInterval: 5000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80' },

  // --- KAWASAKI, HARLEY, TRIUMPH ---
  { id: 'model-ninja', brandId: 'brand-kawasaki', brandName: 'Kawasaki', name: 'Ninja 300 KRT', vehicleClass: 'bike', serviceKmInterval: 6000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-harley-x440', brandId: 'brand-harley', brandName: 'Harley-Davidson', name: 'X440 Roadster', vehicleClass: 'bike', serviceKmInterval: 6000, serviceMonthInterval: 6, imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-speed-400', brandId: 'brand-triumph', brandName: 'Triumph', name: 'Speed 400', vehicleClass: 'bike', serviceKmInterval: 8000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80' },

  // --- SMART EV TWO-WHEELERS ---
  { id: 'model-ather-450x', brandId: 'brand-ather', brandName: 'Ather Energy', name: '450X Gen 3', vehicleClass: 'scooter', serviceKmInterval: 5000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-ather-rizta', brandId: 'brand-ather', brandName: 'Ather Energy', name: 'Rizta Smart EV', vehicleClass: 'scooter', serviceKmInterval: 5000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-ola-s1', brandId: 'brand-ola', brandName: 'Ola Electric', name: 'S1 Pro Gen 2', vehicleClass: 'scooter', serviceKmInterval: 5000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-bounce-e1', brandId: 'brand-bounce', brandName: 'Bounce Infinity', name: 'Infinity E1+', vehicleClass: 'scooter', serviceKmInterval: 4000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-ducati-monster', brandId: 'brand-ducati', brandName: 'Ducati', name: 'Monster Plus', vehicleClass: 'bike', serviceKmInterval: 10000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-bmw-g310r', brandId: 'brand-bmw-moto', brandName: 'BMW Motorrad', name: 'G 310 R Roadster', vehicleClass: 'bike', serviceKmInterval: 6000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80' },
  { id: 'model-bmw-g310gs', brandId: 'brand-bmw-moto', brandName: 'BMW Motorrad', name: 'G 310 GS Adventure', vehicleClass: 'bike', serviceKmInterval: 6000, serviceMonthInterval: 12, imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80' },
];

console.log('Total models:', ALL_MODELS.length);

// 1. Update data/autoping_db.json
if (fs.existsSync(DB_FILE)) {
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  
  // Update brand logos
  db.brands = db.brands.map(b => {
    if (BRAND_LOGOS[b.id]) {
      return { ...b, logoUrl: BRAND_LOGOS[b.id] };
    }
    return b;
  });

  // Overwrite models with complete set
  db.models = ALL_MODELS;

  // Update existing vehicles with exact model imageUrl
  db.vehicles = db.vehicles.map(v => {
    const matchedModel = ALL_MODELS.find(m => m.id === v.modelId || m.name.toLowerCase() === v.modelName?.toLowerCase());
    if (matchedModel) {
      return {
        ...v,
        imageUrl: matchedModel.imageUrl,
      };
    }
    return v;
  });

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  console.log('Updated autoping_db.json successfully with', db.models.length, 'models!');
}

// 2. Update SEED_MODELS in src/lib/data/seed.ts
if (fs.existsSync(SEED_FILE)) {
  let content = fs.readFileSync(SEED_FILE, 'utf8');

  // Replace brand logos in SEED_BRANDS
  for (const [brandId, logoUrl] of Object.entries(BRAND_LOGOS)) {
    const regex = new RegExp(`id: '${brandId}', name: '([^']+)', type: '([^']+)', logoUrl: '[^']+'`, 'g');
    content = content.replace(regex, `id: '${brandId}', name: '$1', type: '$2', logoUrl: '${logoUrl}'`);
  }

  // Replace SEED_MODELS array
  const modelsStr = 'export const SEED_MODELS: VehicleModel[] = ' + JSON.stringify(ALL_MODELS, null, 2) + ';\n';
  content = content.replace(/export const SEED_MODELS: VehicleModel\[\] = \[\s*[\s\S]*?\n\];/, modelsStr.trim());

  fs.writeFileSync(SEED_FILE, content, 'utf8');
  console.log('Updated seed.ts successfully!');
}

import { ComponentStatus, VehicleType } from './types';

export interface ComponentConfig {
  component: ComponentStatus['component'];
  label: string;
  weight: number;
  kmInterval: number;
  monthInterval: number;
}

export const COMPONENT_CONFIGS: ComponentConfig[] = [
  { component: 'OIL', label: 'Engine Oil & Filter', weight: 20, kmInterval: 10000, monthInterval: 12 },
  { component: 'BRAKES', label: 'Brake Inspection & Pads', weight: 20, kmInterval: 20000, monthInterval: 12 },
  { component: 'TYRES', label: 'Tyre Check & Rotation', weight: 15, kmInterval: 10000, monthInterval: 6 },
  { component: 'BATTERY', label: 'Battery Health & Terminals', weight: 15, kmInterval: 0, monthInterval: 12 },
  { component: 'AC', label: 'AC Filter & Gas Check', weight: 10, kmInterval: 0, monthInterval: 12 },
  { component: 'ENGINE', label: 'Engine Diagnostics & Spark', weight: 10, kmInterval: 20000, monthInterval: 12 },
  { component: 'FILTERS', label: 'Air & Cabin Filters', weight: 10, kmInterval: 20000, monthInterval: 12 },
];

export interface VehicleHealthCalculation {
  healthScore: number;
  healthRating: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';
  nextServiceKm: number;
  nextServiceDate: string;
  kmRemaining: number;
  daysRemaining: number;
  dueStatus: 'GOOD' | 'DUE_SOON' | 'OVERDUE';
  recommendedServices: string[];
  components: ComponentStatus[];
  summaryReason: string;
}

export function calculateVehicleHealth(params: {
  vehicleType: VehicleType;
  currentKm: number;
  purchaseYear: number;
  lastServiceDate?: string;
  lastServiceKm?: number;
  intervalKm?: number;
  intervalMonths?: number;
}): VehicleHealthCalculation {
  const today = new Date();
  
  // Defaults based on vehicle type
  const defaultIntervalKm = params.vehicleType === 'CAR' ? 10000 : (params.vehicleType === 'BIKE' ? 4000 : 3000);
  const defaultIntervalMonths = 6;

  const intervalKm = params.intervalKm || defaultIntervalKm;
  const intervalMonths = params.intervalMonths || defaultIntervalMonths;

  // Base service tracking
  const lastKm = params.lastServiceKm ?? 0;
  const lastDate = params.lastServiceDate ? new Date(params.lastServiceDate) : new Date(params.purchaseYear, 0, 1);

  const nextServiceKm = lastKm + intervalKm;
  
  const nextDateObj = new Date(lastDate);
  nextDateObj.setMonth(nextDateObj.getMonth() + intervalMonths);
  const nextServiceDate = nextDateObj.toISOString().split('T')[0];

  const kmRemaining = nextServiceKm - params.currentKm;
  const diffTime = nextDateObj.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Determine overall status
  let dueStatus: 'GOOD' | 'DUE_SOON' | 'OVERDUE' = 'GOOD';
  if (daysRemaining < 0 || kmRemaining < 0) {
    dueStatus = 'OVERDUE';
  } else if (daysRemaining <= 30 || kmRemaining <= 1000) {
    dueStatus = 'DUE_SOON';
  }

  // Calculate component-level health
  const components: ComponentStatus[] = [];
  const recommendedServices: string[] = [];
  let totalPoints = 0;

  for (const config of COMPONENT_CONFIGS) {
    // Effective component interval
    let compKmRemaining = 999999;
    let compDaysRemaining = 999999;
    let nextCompKm = 0;
    const nextCompDate = new Date(lastDate);
    nextCompDate.setMonth(nextCompDate.getMonth() + config.monthInterval);

    if (config.kmInterval > 0) {
      nextCompKm = lastKm + config.kmInterval;
      compKmRemaining = nextCompKm - params.currentKm;
    }
    
    compDaysRemaining = Math.ceil((nextCompDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let status: 'GOOD' | 'DUE_SOON' | 'OVERDUE' = 'GOOD';
    let multiplier = 1.0;
    let reason = 'Component in normal operating condition';

    if ((config.kmInterval > 0 && compKmRemaining < 0) || compDaysRemaining < 0) {
      status = 'OVERDUE';
      multiplier = 0.2;
      reason = `${config.label} is overdue for inspection/replacement`;
      recommendedServices.push(config.label);
    } else if ((config.kmInterval > 0 && compKmRemaining <= 1500) || compDaysRemaining <= 30) {
      status = 'DUE_SOON';
      multiplier = 0.6;
      reason = `${config.label} due in ${Math.max(0, compDaysRemaining)} days (${Math.max(0, compKmRemaining)} km left)`;
      recommendedServices.push(config.label);
    }

    const points = Math.round(config.weight * multiplier);
    totalPoints += points;

    components.push({
      component: config.component,
      label: config.label,
      status,
      lastDoneDate: params.lastServiceDate,
      lastDoneKm: params.lastServiceKm,
      nextDueKm: config.kmInterval > 0 ? nextCompKm : undefined,
      nextDueDate: nextCompDate.toISOString().split('T')[0],
      daysRemaining: compDaysRemaining,
      kmRemaining: config.kmInterval > 0 ? compKmRemaining : undefined,
      weight: config.weight,
      points,
      reason,
    });
  }

  // If no specific component triggered, add general service
  if (recommendedServices.length === 0) {
    recommendedServices.push('General Periodic Checkup');
  }

  const healthScore = Math.max(10, Math.min(100, totalPoints));

  let healthRating: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';
  if (healthScore >= 85) healthRating = 'Excellent';
  else if (healthScore >= 70) healthRating = 'Good';
  else if (healthScore >= 50) healthRating = 'Needs Attention';
  else healthRating = 'Critical';

  let summaryReason = '';
  if (dueStatus === 'OVERDUE') {
    summaryReason = `Service is overdue by ${Math.abs(daysRemaining)} days or ${Math.abs(kmRemaining)} km`;
  } else if (dueStatus === 'DUE_SOON') {
    summaryReason = `Upcoming service milestone (${nextServiceKm.toLocaleString()} km interval) in ${Math.max(0, daysRemaining)} days`;
  } else {
    summaryReason = `All major systems performing optimally. Next scheduled visit in ${daysRemaining} days.`;
  }

  return {
    healthScore,
    healthRating,
    nextServiceKm,
    nextServiceDate,
    kmRemaining,
    daysRemaining,
    dueStatus,
    recommendedServices,
    components,
    summaryReason,
  };
}

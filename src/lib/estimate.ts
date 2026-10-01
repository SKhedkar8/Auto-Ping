import { CenterType, Vehicle } from './types';

export const VEHICLE_CLASS_MULTIPLIERS: Record<Vehicle['vehicleClass'], number> = {
  hatchback: 1.0,
  sedan: 1.15,
  suv: 1.3,
  premium: 2.1,
  bike: 0.32,
  scooter: 0.25,
};

export const CENTER_TYPE_MULTIPLIERS: Record<CenterType, number> = {
  AUTHORIZED: 1.2,
  MULTI_BRAND: 1.0,
  LOCAL: 0.85,
};

export interface CostEstimateResult {
  baseTotal: number;
  multiplier: number;
  estimatedCost: number;
  minCost: number;
  maxCost: number;
  currency: string;
}

export function calculateCostEstimate(params: {
  serviceBasePrices: number[];
  vehicleClass: Vehicle['vehicleClass'];
  centerType: CenterType;
}): CostEstimateResult {
  const baseTotal = params.serviceBasePrices.reduce((sum, p) => sum + p, 0);
  const classMultiplier = VEHICLE_CLASS_MULTIPLIERS[params.vehicleClass] ?? 1.0;
  const centerMultiplier = CENTER_TYPE_MULTIPLIERS[params.centerType] ?? 1.0;
  const totalMultiplier = classMultiplier * centerMultiplier;

  const estimatedCost = Math.round(baseTotal * totalMultiplier);

  // -15% to +10% range, rounded to nearest 50
  const rawMin = estimatedCost * 0.85;
  const rawMax = estimatedCost * 1.10;

  const minCost = Math.max(250, Math.round(rawMin / 50) * 50);
  const maxCost = Math.max(minCost + 200, Math.round(rawMax / 50) * 50);

  return {
    baseTotal,
    multiplier: totalMultiplier,
    estimatedCost,
    minCost,
    maxCost,
    currency: '₹',
  };
}

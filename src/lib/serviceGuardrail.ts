/**
 * Automotive Service Guardrail & Token Limiter
 * 
 * Enforces strict validation on user text input in chat support:
 * - Rejects any off-topic, non-service related queries to avoid token wastage.
 * - Only permits vehicle maintenance, repair, diagnostics, and servicing requirements.
 */

const AUTOMOTIVE_SERVICE_KEYWORDS = [
  // Core maintenance
  'service', 'servicing', 'maintenance', 'tune-up', 'tune up', 'overhaul', 'inspection',
  'oil', 'engine oil', 'synthetic oil', 'oil change', 'filter', 'oil filter', 'air filter', 'cabin filter',
  'fuel filter', 'fluid', 'fluids', 'lubricant', 'lube', 'grease', 'greasing',

  // Engine & Mechanical
  'engine', 'motor', 'piston', 'cylinder', 'valve', 'spark plug', 'sparkplug', 'belt',
  'timing belt', 'fan belt', 'serpentine', 'radiator', 'coolant', 'antifreeze', 'overheating',
  'smoke', 'exhaust', 'muffler', 'catalytic', 'converter', 'knocking', 'knocking sound',
  'rattling', 'vibration', 'shaking', 'misfire', 'loss of power', 'rpm', 'accelerator',
  'throttle', 'choke', 'carburetor', 'injector', 'turbo', 'turbocharger',

  // Brakes & Safety
  'brake', 'brakes', 'braking', 'brake pad', 'brake pads', 'brake shoe', 'rotor', 'disc',
  'drum', 'caliper', 'abs', 'handbrake', 'parking brake', 'brake fluid', 'spongey brake',
  'squeal', 'squeaking', 'grinding', 'stopping distance',

  // Wheels, Tyres, Suspension
  'tyre', 'tyres', 'tire', 'tires', 'wheel', 'wheels', 'puncture', 'flat tyre', 'flat tire',
  'alignment', 'wheel alignment', 'balancing', 'wheel balancing', 'rotation', 'tread',
  'suspension', 'shock', 'shocks', 'shock absorber', 'strut', 'struts', 'spring', 'bush',
  'bushes', 'tie rod', 'ball joint', 'steering', 'power steering', 'wobble', 'pulling left',
  'pulling right',

  // Transmission & Clutch
  'clutch', 'clutch plate', 'clutch slipping', 'pressure plate', 'gear', 'gears',
  'gearbox', 'transmission', 'automatic transmission', 'manual transmission', 'cvt',
  'dsg', 'drive shaft', 'axle', 'differential', 'chain', 'sprocket', 'drive chain',

  // Electrical, Battery, Lights
  'battery', 'batteries', 'charge', 'charging', 'dead battery', 'jumpstart', 'jump start',
  'alternator', 'starter', 'starter motor', 'ignition', 'fuse', 'fuse box', 'wiring',
  'short circuit', 'headlight', 'headlamp', 'tail light', 'indicator', 'blinker',
  'bulb', 'fog lamp', 'horn', 'wiper', 'wipers', 'wiper blade', 'washer fluid',

  // Climate / AC
  'ac', 'a/c', 'air conditioning', 'cooling', 'heater', 'heating', 'blower', 'compressor',
  'condenser', 'gas leak', 'refrigerant', 'freon', 'chilled', 'bad smell',

  // Body, Exterior & Detailing
  'wash', 'car wash', 'bike wash', 'water wash', 'foam wash', 'detailing', 'polish',
  'polishing', 'ceramic coating', 'teflon', 'dent', 'dents', 'scratch', 'scratches',
  'paint', 'painting', 'touch up', 'bumper', 'fender', 'bonnet', 'hood', 'windshield',
  'windscreen', 'rearview mirror', 'door', 'lock', 'central locking',

  // Mileage & Checkups
  'mileage', 'odometer', 'kilometer', 'km', 'pickup', 'pick up', 'drop', 'towing',
  'breakdown', 'roadside', 'rsa', 'diagnostics', 'obd', 'check engine light', 'warning light',
  'health check', 'periodic', 'regular checkup', 'general check'
];

// Common off-topic patterns to explicitly reject
const OFF_TOPIC_PATTERNS = [
  /tell me a joke/i,
  /who (is|are) you/i,
  /what is your name/i,
  /weather/i,
  /recipe/i,
  /write (a |some )?(code|poem|story|essay|python|javascript)/i,
  /crypto|bitcoin|ethereum|stock market/i,
  /politics|president|prime minister|election/i,
  /movie|song|music|singer|celebrity/i,
  /how to make/i,
  /translate/i,
  /capital of/i,
  /math|solve|calculate 2\+/i
];

export interface GuardrailValidationResult {
  allowed: boolean;
  reason?: string;
  matchedKeywords?: string[];
}

/**
 * Validates whether user-entered text is strictly vehicle service related.
 * Rejects off-topic text to prevent token wastage.
 */
export function validateServiceInput(text: string): GuardrailValidationResult {
  const trimmed = text.trim();

  // Reject empty or super short noise
  if (!trimmed || trimmed.length < 3) {
    return {
      allowed: false,
      reason: 'Please enter a detailed vehicle service requirement (at least 3 characters).'
    };
  }

  // Check explicit off-topic patterns
  for (const pattern of OFF_TOPIC_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        reason: 'That is not allowed! Non-automotive queries are rejected to avoid token wastage. Please provide vehicle servicing details only.'
      };
    }
  }

  const lower = trimmed.toLowerCase();

  // Find matches with automotive keywords
  const matches = AUTOMOTIVE_SERVICE_KEYWORDS.filter((kw) => {
    // Word boundary or substring matching
    if (kw.length <= 3) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(lower);
    }
    return lower.includes(kw);
  });

  if (matches.length > 0) {
    return {
      allowed: true,
      matchedKeywords: matches
    };
  }

  // Fallback: If no service keywords match, reject to prevent wasting tokens
  return {
    allowed: false,
    reason: 'That is not allowed! Your requirement must be related to vehicle servicing (e.g. engine noise, brake pad check, AC cooling, oil replacement).'
  };
}

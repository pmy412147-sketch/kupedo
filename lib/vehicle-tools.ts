// VIN Decoder
export interface VINData {
  vin: string;
  make: string;
  model: string;
  year: number;
  bodyType: string;
  engine: string;
  transmission: string;
  drivetrain: string;
  fuelType: string;
  doors: number;
  seats: number;
  color?: string;
  countryOfOrigin: string;
  manufacturerPlant?: string;
}

export async function decodeVIN(vin: string): Promise<VINData | null> {
  // Validate VIN format
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) {
    throw new Error('Invalid VIN format');
  }

  // In real implementation, call external VIN decoder API
  // For now, return sample data
  return {
    vin: vin.toUpperCase(),
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    bodyType: 'Sedan',
    engine: '1.8L 4-cylinder',
    transmission: 'Automatic CVT',
    drivetrain: 'FWD',
    fuelType: 'Gasoline',
    doors: 4,
    seats: 5,
    color: 'Silver',
    countryOfOrigin: 'Japan',
    manufacturerPlant: 'Takaoka',
  };
}

// Vehicle History Report
export interface VehicleHistory {
  vin: string;
  reports: {
    accidents: Array<{
      date: string;
      type: string;
      severity: 'minor' | 'moderate' | 'severe';
      damage: string[];
      repaired: boolean;
    }>;
    owners: number;
    titleStatus: 'clean' | 'salvage' | 'rebuilt' | 'flood' | 'theft';
    odometer: Array<{
      date: string;
      reading: number;
      source: string;
    }>;
    maintenance: Array<{
      date: string;
      type: string;
      description: string;
      cost?: number;
      provider?: string;
    }>;
    recalls: Array<{
      date: string;
      campaign: string;
      description: string;
      status: 'open' | 'completed';
    }>;
  };
  score: number; // 0-100 vehicle condition score
  flags: string[];
}

export async function getVehicleHistory(vin: string): Promise<VehicleHistory> {
  // In real implementation, integrate with Carfax, AutoCheck, etc.
  return {
    vin: vin.toUpperCase(),
    reports: {
      accidents: [
        {
          date: '2022-05-15',
          type: 'Rear-end collision',
          severity: 'minor',
          damage: ['Rear bumper', 'Taillight'],
          repaired: true,
        },
      ],
      owners: 2,
      titleStatus: 'clean',
      odometer: [
        { date: '2020-01-10', reading: 0, source: 'Dealer' },
        { date: '2021-06-15', reading: 15000, source: 'Service' },
        { date: '2022-05-20', reading: 28000, source: 'Inspection' },
        { date: '2023-11-01', reading: 45000, source: 'Current' },
      ],
      maintenance: [
        {
          date: '2021-06-15',
          type: 'Regular Service',
          description: 'Oil change, tire rotation',
          cost: 120,
          provider: 'Toyota Service Center',
        },
        {
          date: '2022-06-10',
          type: 'Regular Service',
          description: 'Oil change, brake inspection',
          cost: 150,
          provider: 'Toyota Service Center',
        },
        {
          date: '2023-06-20',
          type: 'Major Service',
          description: 'Oil change, brake pads replacement, air filter',
          cost: 450,
          provider: 'Toyota Service Center',
        },
      ],
      recalls: [
        {
          date: '2021-03-10',
          campaign: 'NHTSA 21V123',
          description: 'Fuel pump may fail',
          status: 'completed',
        },
      ],
    },
    score: 87,
    flags: ['Minor accident reported', '1 owner before current'],
  };
}

// Vehicle Inspection Checklist
export interface InspectionItem {
  category: string;
  item: string;
  status: 'good' | 'fair' | 'poor' | 'needs_attention';
  notes?: string;
  photos?: string[];
}

export const vehicleInspectionChecklist: Array<{
  category: string;
  items: string[];
}> = [
  {
    category: 'Exterior',
    items: [
      'Body condition (dents, scratches)',
      'Paint quality',
      'Windshield condition',
      'All lights functioning',
      'Mirror condition',
      'Window operation',
      'Door alignment',
      'Trunk/hatch operation',
    ],
  },
  {
    category: 'Tires & Wheels',
    items: [
      'Tire tread depth',
      'Tire condition (cracks, bulges)',
      'Wheel condition',
      'Spare tire',
      'Tire pressure',
    ],
  },
  {
    category: 'Interior',
    items: [
      'Seats condition',
      'Dashboard condition',
      'All gauges working',
      'Climate control',
      'Audio system',
      'Power windows/locks',
      'Interior lights',
      'Odor issues',
    ],
  },
  {
    category: 'Engine',
    items: [
      'Engine starts smoothly',
      'Engine sounds normal',
      'No fluid leaks',
      'Oil level and condition',
      'Coolant level',
      'Battery condition',
      'Belt condition',
      'Air filter',
    ],
  },
  {
    category: 'Under Vehicle',
    items: [
      'No fluid leaks',
      'Exhaust system',
      'Suspension components',
      'Brake system',
      'Frame/undercarriage rust',
    ],
  },
  {
    category: 'Test Drive',
    items: [
      'Acceleration smooth',
      'Braking performance',
      'Steering response',
      'Transmission shifts',
      'No unusual noises',
      'Warning lights',
    ],
  },
];

// Financing Calculator
export interface FinancingOption {
  lender: string;
  apr: number;
  term: number; // months
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  downPayment: number;
  fees: number;
}

export function calculateFinancing(
  vehiclePrice: number,
  downPayment: number,
  tradeInValue: number = 0
): FinancingOption[] {
  const loanAmount = vehiclePrice - downPayment - tradeInValue;

  const lenders = [
    { name: 'Prima banka', apr: 5.9, fee: 200 },
    { name: 'Tatra banka', apr: 6.2, fee: 150 },
    { name: 'Slovenská sporiteľňa', apr: 6.5, fee: 180 },
    { name: 'VÚB', apr: 5.7, fee: 220 },
    { name: 'ČSOB', apr: 6.0, fee: 190 },
  ];

  const terms = [36, 48, 60, 72];

  const options: FinancingOption[] = [];

  for (const lender of lenders) {
    for (const term of terms) {
      const monthlyRate = lender.apr / 100 / 12;
      const monthlyPayment =
        (loanAmount + lender.fee) *
        (monthlyRate * Math.pow(1 + monthlyRate, term)) /
        (Math.pow(1 + monthlyRate, term) - 1);

      const totalPayment = monthlyPayment * term;
      const totalInterest = totalPayment - (loanAmount + lender.fee);

      options.push({
        lender: lender.name,
        apr: lender.apr,
        term,
        monthlyPayment,
        totalPayment,
        totalInterest,
        downPayment,
        fees: lender.fee,
      });
    }
  }

  // Sort by monthly payment
  return options.sort((a, b) => a.monthlyPayment - b.monthlyPayment);
}

// Trade-in Value Estimator
export interface TradeInEstimate {
  retail: number;
  tradeIn: number;
  privateParty: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  factors: Array<{
    factor: string;
    impact: number; // percentage
    description: string;
  }>;
}

export async function estimateTradeInValue(
  make: string,
  model: string,
  year: number,
  mileage: number,
  condition: 'excellent' | 'good' | 'fair' | 'poor'
): Promise<TradeInEstimate> {
  // In real implementation, call external valuation API (e.g., KBB, Edmunds)
  // Base value calculation
  const baseValue = 15000; // Would be fetched from market data

  // Condition adjustments
  const conditionMultipliers = {
    excellent: 1.1,
    good: 1.0,
    fair: 0.85,
    poor: 0.7,
  };

  // Mileage adjustment (assume average 12,000 km/year)
  const avgMileage = (new Date().getFullYear() - year) * 12000;
  const mileageDiff = mileage - avgMileage;
  const mileageAdjustment = (mileageDiff / 10000) * -0.05; // -5% per 10k km over average

  const retail = baseValue * conditionMultipliers[condition] * (1 + mileageAdjustment);
  const tradeIn = retail * 0.85; // Dealers typically offer 85% of retail
  const privateParty = retail * 0.95; // Private sale gets ~95% of retail

  const factors = [
    {
      factor: 'Vehicle Age',
      impact: -((new Date().getFullYear() - year) * 8),
      description: `${new Date().getFullYear() - year} years old`,
    },
    {
      factor: 'Mileage',
      impact: mileageAdjustment * 100,
      description: `${mileage.toLocaleString()} km (${mileageDiff > 0 ? 'above' : 'below'} average)`,
    },
    {
      factor: 'Condition',
      impact: (conditionMultipliers[condition] - 1) * 100,
      description: condition.charAt(0).toUpperCase() + condition.slice(1),
    },
  ];

  return {
    retail,
    tradeIn,
    privateParty,
    condition,
    factors,
  };
}

// Vehicle Comparison
export interface VehicleComparison {
  vehicles: Array<{
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    engine: string;
    power: number; // HP
    fuelType: string;
    transmission: string;
    fuelConsumption: number; // L/100km
    acceleration: number; // 0-100 km/h seconds
    features: string[];
  }>;
  winner: {
    bestPrice: string;
    lowestMileage: string;
    mostPowerful: string;
    mostEfficient: string;
    newest: string;
  };
}

export function compareVehicles(vehicleIds: string[]): VehicleComparison {
  // Sample data - in real app, fetch from database
  const vehicles = [
    {
      id: vehicleIds[0] || '1',
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      price: 18000,
      mileage: 45000,
      engine: '1.8L',
      power: 140,
      fuelType: 'Gasoline',
      transmission: 'Automatic',
      fuelConsumption: 6.5,
      acceleration: 10.2,
      features: ['Cruise Control', 'Bluetooth', 'Backup Camera'],
    },
    {
      id: vehicleIds[1] || '2',
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      price: 21000,
      mileage: 32000,
      engine: '2.0L',
      power: 158,
      fuelType: 'Gasoline',
      transmission: 'CVT',
      fuelConsumption: 6.2,
      acceleration: 9.4,
      features: ['Cruise Control', 'Apple CarPlay', 'Lane Keep Assist', 'Backup Camera'],
    },
  ];

  const winner = {
    bestPrice: vehicles.reduce((min, v) => (v.price < min.price ? v : min)).id,
    lowestMileage: vehicles.reduce((min, v) => (v.mileage < min.mileage ? v : min)).id,
    mostPowerful: vehicles.reduce((max, v) => (v.power > max.power ? v : max)).id,
    mostEfficient: vehicles.reduce((min, v) => (v.fuelConsumption < min.fuelConsumption ? v : min)).id,
    newest: vehicles.reduce((newest, v) => (v.year > newest.year ? v : newest)).id,
  };

  return { vehicles, winner };
}

// Mortgage Calculator
export interface MortgageCalculation {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  breakdown: {
    principal: number;
    interest: number;
    insurance?: number;
    taxes?: number;
  };
  amortizationSchedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export function calculateMortgage(
  propertyPrice: number,
  downPayment: number,
  interestRate: number,
  loanTerm: number, // years
  propertyTax: number = 0,
  insurance: number = 0
): MortgageCalculation {
  const loanAmount = propertyPrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  // Monthly mortgage payment (principal + interest)
  const monthlyPayment =
    loanAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  const monthlyTax = propertyTax / 12;
  const monthlyInsurance = insurance / 12;
  const totalMonthlyPayment = monthlyPayment + monthlyTax + monthlyInsurance;

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  // Amortization schedule
  const schedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }> = [];

  let balance = loanAmount;
  for (let month = 1; month <= numberOfPayments; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
    });
  }

  return {
    monthlyPayment: totalMonthlyPayment,
    totalPayment: totalPayment + propertyTax * loanTerm + insurance * loanTerm,
    totalInterest,
    breakdown: {
      principal: monthlyPayment - (balance / numberOfPayments),
      interest: totalInterest / numberOfPayments,
      insurance: monthlyInsurance,
      taxes: monthlyTax,
    },
    amortizationSchedule: schedule,
  };
}

// Neighborhood Information
export interface NeighborhoodInfo {
  schools: Array<{
    name: string;
    type: 'elementary' | 'middle' | 'high' | 'university';
    distance: number; // km
    rating?: number;
  }>;
  transport: Array<{
    type: 'bus' | 'tram' | 'metro' | 'train';
    name: string;
    distance: number;
    lines?: string[];
  }>;
  amenities: Array<{
    type: 'grocery' | 'pharmacy' | 'hospital' | 'park' | 'gym' | 'restaurant';
    name: string;
    distance: number;
  }>;
  walkScore: number; // 0-100
  transitScore: number; // 0-100
  bikeScore: number; // 0-100
}

export function getNeighborhoodInfo(address: string, postalCode: string): NeighborhoodInfo {
  // In real implementation, this would call external APIs
  // For now, return sample data
  return {
    schools: [
      { name: 'Základná škola Hviezdoslavova', type: 'elementary', distance: 0.5, rating: 4.2 },
      { name: 'Gymnázium Grösslingová', type: 'high', distance: 1.2, rating: 4.5 },
    ],
    transport: [
      { type: 'bus', name: 'Bus Stop Hodžovo námestie', distance: 0.2, lines: ['93', '29'] },
      { type: 'tram', name: 'Tram Stop Zochova', distance: 0.4, lines: ['4', '9'] },
    ],
    amenities: [
      { type: 'grocery', name: 'Tesco Express', distance: 0.3 },
      { type: 'pharmacy', name: 'Dr. Max', distance: 0.2 },
      { type: 'park', name: 'Horský park', distance: 0.8 },
      { type: 'hospital', name: 'Nemocnica sv. Cyrila', distance: 2.1 },
    ],
    walkScore: 85,
    transitScore: 92,
    bikeScore: 78,
  };
}

// Property Comparison
export interface PropertyComparison {
  properties: Array<{
    id: string;
    title: string;
    price: number;
    pricePerSqm: number;
    area: number;
    rooms: number;
    floor: number;
    condition: string;
    yearBuilt?: number;
    energyClass?: string;
    parking?: boolean;
    balcony?: boolean;
    elevator?: boolean;
  }>;
  winner: {
    bestPrice: string;
    bestPricePerSqm: string;
    largestArea: string;
    mostRooms: string;
    newestBuilding: string;
  };
}

export function compareProperties(propertyIds: string[]): PropertyComparison {
  // In real implementation, fetch from database
  // Sample data for demonstration
  const properties = [
    {
      id: propertyIds[0] || '1',
      title: '3-room apartment in Petržalka',
      price: 180000,
      pricePerSqm: 2500,
      area: 72,
      rooms: 3,
      floor: 5,
      condition: 'good',
      yearBuilt: 2005,
      energyClass: 'B',
      parking: true,
      balcony: true,
      elevator: true,
    },
    {
      id: propertyIds[1] || '2',
      title: '2-room apartment in Old Town',
      price: 220000,
      pricePerSqm: 3667,
      area: 60,
      rooms: 2,
      floor: 3,
      condition: 'excellent',
      yearBuilt: 2018,
      energyClass: 'A',
      parking: false,
      balcony: false,
      elevator: true,
    },
  ];

  const winner = {
    bestPrice: properties.reduce((min, p) => (p.price < min.price ? p : min)).id,
    bestPricePerSqm: properties.reduce((min, p) => (p.pricePerSqm < min.pricePerSqm ? p : min)).id,
    largestArea: properties.reduce((max, p) => (p.area > max.area ? p : max)).id,
    mostRooms: properties.reduce((max, p) => (p.rooms > max.rooms ? p : max)).id,
    newestBuilding: properties.reduce((newest, p) =>
      ((p.yearBuilt || 0) > (newest.yearBuilt || 0) ? p : newest)
    ).id,
  };

  return { properties, winner };
}

// Price per Square Meter Analysis
export interface PriceAnalysis {
  pricePerSqm: number;
  categoryAverage: number;
  cityAverage: number;
  deviation: number;
  trend: 'above' | 'at' | 'below';
  marketTrends: Array<{
    month: string;
    avgPrice: number;
    volume: number;
  }>;
  recommendations: string[];
}

export function analyzePricePerSqm(
  price: number,
  area: number,
  location: string,
  propertyType: string
): PriceAnalysis {
  const pricePerSqm = price / area;

  // Sample market data (in real app, fetch from database)
  const categoryAverage = 2800;
  const cityAverage = 2600;
  const deviation = ((pricePerSqm - categoryAverage) / categoryAverage) * 100;

  let trend: 'above' | 'at' | 'below' = 'at';
  if (deviation > 10) trend = 'above';
  else if (deviation < -10) trend = 'below';

  const recommendations: string[] = [];
  if (trend === 'above') {
    recommendations.push('Price is above market average. Consider price adjustment for faster sale.');
    recommendations.push(`Comparable properties sell for €${categoryAverage}/m²`);
  } else if (trend === 'below') {
    recommendations.push('Excellent value! Price is below market average.');
    recommendations.push('This property is likely to sell quickly.');
  } else {
    recommendations.push('Price is in line with market average.');
  }

  // Sample market trends (last 12 months)
  const marketTrends = [
    { month: 'Jan', avgPrice: 2500, volume: 450 },
    { month: 'Feb', avgPrice: 2520, volume: 420 },
    { month: 'Mar', avgPrice: 2550, volume: 520 },
    { month: 'Apr', avgPrice: 2580, volume: 580 },
    { month: 'May', avgPrice: 2620, volume: 650 },
    { month: 'Jun', avgPrice: 2650, volume: 680 },
    { month: 'Jul', avgPrice: 2680, volume: 520 },
    { month: 'Aug', avgPrice: 2700, volume: 450 },
    { month: 'Sep', avgPrice: 2750, volume: 620 },
    { month: 'Oct', avgPrice: 2780, volume: 680 },
    { month: 'Nov', avgPrice: 2800, volume: 720 },
    { month: 'Dec', avgPrice: 2800, volume: 580 },
  ];

  return {
    pricePerSqm,
    categoryAverage,
    cityAverage,
    deviation,
    trend,
    marketTrends,
    recommendations,
  };
}

// Floor Plan Analysis
export interface FloorPlanData {
  rooms: number;
  totalArea: number;
  livingArea: number;
  layout: 'open' | 'traditional' | 'loft';
  orientation: string[];
  features: string[];
}

export function analyzeFloorPlan(imageUrl: string): FloorPlanData {
  // In real implementation, use computer vision/AI
  // For now, return sample data
  return {
    rooms: 3,
    totalArea: 72,
    livingArea: 58,
    layout: 'traditional',
    orientation: ['North', 'South'],
    features: ['Balcony', 'Storage', 'Separate kitchen'],
  };
}

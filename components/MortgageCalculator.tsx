'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { calculateMortgage } from '@/lib/real-estate-tools';
import { Calculator, TrendingUp, PieChart } from 'lucide-react';

export function MortgageCalculator({ propertyPrice: initialPrice = 200000 }: { propertyPrice?: number }) {
  const [propertyPrice, setPropertyPrice] = useState(initialPrice);
  const [downPayment, setDownPayment] = useState(initialPrice * 0.2);
  const [interestRate, setInterestRate] = useState(3.5);
  const [loanTerm, setLoanTerm] = useState(25);
  const [propertyTax, setPropertyTax] = useState(500);
  const [insurance, setInsurance] = useState(600);

  const calculation = calculateMortgage(
    propertyPrice,
    downPayment,
    interestRate,
    loanTerm,
    propertyTax,
    insurance
  );

  const downPaymentPercent = (downPayment / propertyPrice) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Mortgage Calculator
        </CardTitle>
        <CardDescription>Calculate your monthly payments and total cost</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Property Price */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Property Price</Label>
            <span className="text-sm font-medium">€{propertyPrice.toLocaleString()}</span>
          </div>
          <Input
            type="number"
            value={propertyPrice}
            onChange={(e) => setPropertyPrice(Number(e.target.value))}
            min={10000}
            max={1000000}
            step={1000}
          />
        </div>

        {/* Down Payment */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Down Payment</Label>
            <span className="text-sm font-medium">
              €{downPayment.toLocaleString()} ({downPaymentPercent.toFixed(0)}%)
            </span>
          </div>
          <Slider
            value={[downPayment]}
            onValueChange={([value]) => setDownPayment(value)}
            min={propertyPrice * 0.1}
            max={propertyPrice * 0.5}
            step={1000}
          />
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Interest Rate</Label>
            <span className="text-sm font-medium">{interestRate.toFixed(2)}%</span>
          </div>
          <Slider
            value={[interestRate]}
            onValueChange={([value]) => setInterestRate(value)}
            min={1}
            max={10}
            step={0.1}
          />
        </div>

        {/* Loan Term */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Loan Term</Label>
            <span className="text-sm font-medium">{loanTerm} years</span>
          </div>
          <Slider
            value={[loanTerm]}
            onValueChange={([value]) => setLoanTerm(value)}
            min={5}
            max={30}
            step={5}
          />
        </div>

        {/* Results */}
        <div className="pt-4 border-t space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-950 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Monthly Payment
            </div>
            <div className="text-3xl font-bold text-emerald-600">
              €{calculation.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs text-gray-500 mb-1">Principal & Interest</div>
              <div className="font-semibold">
                €{(calculation.breakdown.principal + calculation.breakdown.interest).toFixed(0)}
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs text-gray-500 mb-1">Property Tax</div>
              <div className="font-semibold">€{(propertyTax / 12).toFixed(0)}</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs text-gray-500 mb-1">Insurance</div>
              <div className="font-semibold">€{(insurance / 12).toFixed(0)}</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs text-gray-500 mb-1">Total Interest</div>
              <div className="font-semibold">
                €{calculation.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="h-4 w-4" />
            <span>
              Total payment over {loanTerm} years:{' '}
              <strong>€{calculation.totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

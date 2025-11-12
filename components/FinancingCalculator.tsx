'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface FinancingCalculatorProps {
  vehiclePrice: number;
  adUrl?: string;
}

export function FinancingCalculator({ vehiclePrice, adUrl }: FinancingCalculatorProps) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanYears, setLoanYears] = useState(5);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);

  const downPaymentOptions = [10, 20, 30, 40, 50];
  const yearOptions = [3, 4, 5, 6];

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('sk-SK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const calculateAnnuity = (principal: number, annualRate: number, months: number) => {
    const monthlyRate = annualRate / 12;
    return principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
  };

  useEffect(() => {
    const approxInterestPA = 0.067;
    const loanAmount = vehiclePrice * (1 - downPaymentPercent / 100);
    const payment = calculateAnnuity(loanAmount, approxInterestPA, loanYears * 12);
    setMonthlyPayment(payment);
  }, [vehiclePrice, downPaymentPercent, loanYears]);

  const buildUrl = () => {
    const downPayment = downPaymentPercent;
    const period = loanYears;
    const loanAmount = Math.round(vehiclePrice * (1 - downPayment / 100));
    const refUrl = adUrl || window.location.href;

    const params = new URLSearchParams({
      utm_source: 'web',
      utm_medium: 'banner',
      utm_campaign: 'Jazdenky_ringier_kalkulacka',
      utm_id: 'Axel+-+kalkulacka',
      url: refUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      akontacia: String(downPayment),
      obdobie: String(period),
      vyskaUveru: String(loanAmount),
      cenaVozidla: String(vehiclePrice)
    });

    if (monthlyPayment) {
      params.set('splatka', monthlyPayment.toFixed(2));
    }

    return 'https://www.csobleasing.sk/jazdene-vozidla/?' + params.toString();
  };

  const getYearLabel = (year: number) => {
    if (year === 1) return 'rok';
    if (year >= 2 && year <= 4) return 'roky';
    return 'rokov';
  };

  return (
    <Card className="p-6 space-y-4 bg-white rounded-lg text-black">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-bold leading-normal">Financovanie</div>
          <div className="text-[13px] font-normal">Upravte si splátky podľa seba</div>
        </div>
        <div className="w-14 h-14 bg-[#003667] rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">ČSOB</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-normal leading-5">Výška akontácie</div>
          </div>
          <div className="flex w-full items-center rounded-lg bg-[#F0F6FA] p-0.5 gap-0.5">
            {downPaymentOptions.map((percent) => {
              const amount = vehiclePrice * percent / 100;
              const isActive = percent === downPaymentPercent;
              return (
                <button
                  key={percent}
                  onClick={() => setDownPaymentPercent(percent)}
                  className={`inline-flex h-11 w-full flex-col items-center justify-center rounded-lg text-base font-bold transition-colors ${
                    isActive
                      ? 'bg-[#03ADEE] text-white'
                      : 'text-[#003667] hover:bg-[#E0EDF5]'
                  }`}
                >
                  <span className="text-[15px] font-bold leading-4">{percent}%</span>
                  <span className={`text-[11px] font-medium leading-[15px] ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}>
                    {formatCurrency(amount)} €
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-normal leading-5">Dĺžka financovania</div>
          </div>
          <div className="flex w-full items-center rounded-lg bg-[#F0F6FA] p-0.5 gap-0.5">
            {yearOptions.map((year) => {
              const isActive = year === loanYears;
              return (
                <button
                  key={year}
                  onClick={() => setLoanYears(year)}
                  className={`inline-flex h-11 w-full flex-col items-center justify-center rounded-lg text-base font-bold transition-colors ${
                    isActive
                      ? 'bg-[#03ADEE] text-white'
                      : 'text-[#003667] hover:bg-[#E0EDF5]'
                  }`}
                >
                  <span className="text-[15px] font-bold leading-5">{year}</span>
                  <span className="text-[10px] font-medium leading-4">{getYearLabel(year)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center pt-1">
        <div className="text-center text-[12px]">Výška mesačnej splátky</div>
        <div className="text-center text-2xl font-bold leading-[26px] text-[#003667]">
          od <span>{monthlyPayment ? formatCurrency(monthlyPayment) : '—'}</span> €
        </div>
        <div className="mt-2 text-[11px] leading-none">
          Poplatok za spracovanie úveru: <span className="text-xs font-bold leading-none text-sky-900">0€</span>
        </div>

        <a
          href={buildUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 w-full h-10 bg-[#73CA1D] rounded-lg flex items-center justify-center text-white text-sm font-bold hover:bg-[#66B619] transition-colors"
        >
          Mám záujem
        </a>
      </div>

      <div className="space-y-1">
        <p className="text-center text-[10px] font-normal text-slate-500">
          Ponuka má informatívny a nezáväzný charakter, je určená pre právnické osoby a fyzické osoby – podnikateľov.
        </p>
      </div>
    </Card>
  );
}

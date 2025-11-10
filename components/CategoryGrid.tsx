'use client';

import Link from 'next/link';
import { categories } from '@/lib/categories';
import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Home, Car, PawPrint, Baby, Briefcase, Bike, Wrench,
  TreePine, Monitor, Smartphone, Camera, Tv, Dumbbell,
  Music, Ticket, BookOpen, Sofa, Shirt, Sparkles, Package
} from 'lucide-react';

const categoryIcons = {
  zvierata: PawPrint,
  deti: Baby,
  reality: Home,
  praca: Briefcase,
  auto: Car,
  motocykle: Bike,
  stroje: Wrench,
  'dom-zahrada': TreePine,
  pc: Monitor,
  mobily: Smartphone,
  foto: Camera,
  elektro: Tv,
  sport: Dumbbell,
  hudba: Music,
  vstupenky: Ticket,
  knihy: BookOpen,
  nabytok: Sofa,
  oblecenie: Shirt,
  sluzby: Sparkles,
  ostatne: Package
};

export function CategoryGrid() {
  return (
    <>
      <ScrollArea className="w-full md:hidden">
        <div className="flex gap-3 pb-4">
          {categories.map((category) => {
            const Icon = categoryIcons[category.id as keyof typeof categoryIcons];
            return (
              <Link key={category.id} href={`/kategoria/${category.slug}`}>
                <Card className="p-3 hover:shadow-lg transition-all hover:scale-105 cursor-pointer w-[120px] flex-shrink-0">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 rounded-full bg-[#2ECC71]/10 flex items-center justify-center">
                      {Icon && <Icon className="w-5 h-5 text-[#2ECC71]" />}
                    </div>
                    <h3 className="font-semibold text-xs text-center leading-tight">{category.name}</h3>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="hidden md:grid md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-10 gap-3">
        {categories.map((category) => {
          const Icon = categoryIcons[category.id as keyof typeof categoryIcons];
          return (
            <Link key={category.id} href={`/kategoria/${category.slug}`}>
              <Card className="p-2.5 hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 rounded-full bg-[#2ECC71]/10 flex items-center justify-center">
                    {Icon && <Icon className="w-4.5 h-4.5 text-[#2ECC71]" />}
                  </div>
                  <h3 className="font-semibold text-[11px] text-center leading-tight">{category.name}</h3>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}

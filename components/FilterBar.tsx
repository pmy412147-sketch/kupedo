'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { categories } from '@/lib/categories';
import { Search } from 'lucide-react';

interface FilterBarProps {
  onFilterChange: (filters: FilterValues) => void;
  currentCategory?: string;
}

export interface FilterValues {
  category: string;
  postalCode: string;
  radius: string;
  priceFrom: string;
  priceTo: string;
}

export function FilterBar({ onFilterChange, currentCategory }: FilterBarProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterValues>({
    category: currentCategory || '',
    postalCode: '',
    radius: '10',
    priceFrom: '',
    priceTo: '',
  });

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // If category changed and not 'all', redirect to that category page
    if (filters.category && filters.category !== 'all' && filters.category !== currentCategory) {
      router.push(`/kategoria/${filters.category}`);
    } else {
      onFilterChange(filters);
    }
  };

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div>
          <Label htmlFor="category" className="text-xs">Kategória</Label>
          <Select value={filters.category} onValueChange={(v) => handleFilterChange('category', v)}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Všetky" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všetky kategórie</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="postalCode" className="text-xs">PSČ</Label>
          <Input
            id="postalCode"
            placeholder="napr. 81101"
            value={filters.postalCode}
            onChange={(e) => handleFilterChange('postalCode', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="radius" className="text-xs">Okolie</Label>
          <Select value={filters.radius} onValueChange={(v) => handleFilterChange('radius', v)}>
            <SelectTrigger id="radius">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 km</SelectItem>
              <SelectItem value="25">25 km</SelectItem>
              <SelectItem value="50">50 km</SelectItem>
              <SelectItem value="100">100 km</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priceFrom" className="text-xs">Cena od</Label>
          <Input
            id="priceFrom"
            type="number"
            placeholder="0 €"
            value={filters.priceFrom}
            onChange={(e) => handleFilterChange('priceFrom', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="priceTo" className="text-xs">Cena do</Label>
          <Input
            id="priceTo"
            type="number"
            placeholder="∞ €"
            value={filters.priceTo}
            onChange={(e) => handleFilterChange('priceTo', e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <Button onClick={handleApplyFilters} className="w-full" style={{ backgroundColor: '#2ECC71' }}>
            <Search className="h-4 w-4 mr-2" />
            Hľadať
          </Button>
        </div>
      </div>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, TrendingUp, Zap, Crown, Award } from 'lucide-react';

interface PremiumFeature {
  name: string;
  price: number;
  duration: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
}

const boostOptions: PremiumFeature[] = [
  {
    name: 'Listing Boost',
    price: 2.99,
    duration: '24 hours',
    features: [
      'Move to top of search results',
      '3x more visibility',
      'Highlighted in yellow',
      'Mobile app priority',
    ],
    icon: <TrendingUp className="h-6 w-6" />,
  },
  {
    name: 'Premium Boost',
    price: 4.99,
    duration: '48 hours',
    features: [
      'Everything in Listing Boost',
      'Homepage sidebar placement',
      '5x more visibility',
      'Premium badge',
    ],
    icon: <Star className="h-6 w-6" />,
    popular: true,
  },
  {
    name: 'Urgent Sale',
    price: 7.99,
    duration: '7 days',
    features: [
      'Red "Urgent" tag',
      'Top position guarantee',
      'Email notifications to interested users',
      '10x more visibility',
    ],
    icon: <Zap className="h-6 w-6" />,
  },
];

const featuredOptions: PremiumFeature[] = [
  {
    name: 'Homepage Hero',
    price: 49.99,
    duration: '7 days',
    features: [
      'Main homepage banner',
      'Maximum exposure',
      'Desktop & mobile',
      'Guaranteed impressions: 100k+',
    ],
    icon: <Crown className="h-6 w-6" />,
    popular: true,
  },
  {
    name: 'Category Featured',
    price: 24.99,
    duration: '7 days',
    features: [
      'Top of category page',
      'Targeted audience',
      'Higher conversion',
      'Guaranteed impressions: 50k+',
    ],
    icon: <Award className="h-6 w-6" />,
  },
];

export function PremiumFeaturesModal({
  isOpen,
  onClose,
  adId,
}: {
  isOpen: boolean;
  onClose: () => void;
  adId: string;
}) {
  const [selectedType, setSelectedType] = useState<'boost' | 'featured'>('boost');

  const handlePurchase = (feature: PremiumFeature) => {
    // In real implementation, integrate payment
    console.log('Purchasing:', feature.name, 'for ad:', adId);
    alert(`Payment integration coming soon!\n\nYou selected: ${feature.name}\nPrice: €${feature.price}`);
  };

  const options = selectedType === 'boost' ? boostOptions : featuredOptions;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Promote Your Listing</DialogTitle>
          <DialogDescription>
            Get more visibility and sell faster with premium features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Type Selector */}
          <div className="flex gap-2">
            <Button
              variant={selectedType === 'boost' ? 'default' : 'outline'}
              onClick={() => setSelectedType('boost')}
              className="flex-1"
            >
              Boost Listing
            </Button>
            <Button
              variant={selectedType === 'featured' ? 'default' : 'outline'}
              onClick={() => setSelectedType('featured')}
              className="flex-1"
            >
              Featured Placement
            </Button>
          </div>

          {/* Options Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {options.map((option) => (
              <Card
                key={option.name}
                className={`relative ${option.popular ? 'border-emerald-500 shadow-lg' : ''}`}
              >
                {option.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-emerald-500">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg text-emerald-600">
                      {option.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{option.name}</CardTitle>
                  <CardDescription>{option.duration}</CardDescription>
                  <div className="pt-2">
                    <span className="text-3xl font-bold">€{option.price}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {option.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handlePurchase(option)}
                    className="w-full"
                    variant={option.popular ? 'default' : 'outline'}
                  >
                    Select
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits Section */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Why Promote Your Listing?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-semibold mb-1">⚡ Sell 5x Faster</div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Promoted listings sell in average 5 days vs 25 days for standard listings
                  </p>
                </div>
                <div>
                  <div className="font-semibold mb-1">👁️ More Views</div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get 10-100x more views depending on promotion type
                  </p>
                </div>
                <div>
                  <div className="font-semibold mb-1">💰 Better Offers</div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Increased visibility leads to more serious buyers and better offers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Money Back Guarantee */}
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💯 <strong>Money-back guarantee:</strong> If your listing doesn't get at least 2x more
              views, we'll refund your promotion cost
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

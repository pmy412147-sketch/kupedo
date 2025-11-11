'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Calendar, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface BoostOption {
  days: number;
  coins: number;
  label: string;
  description: string;
  popular?: boolean;
}

const boostOptions: BoostOption[] = [
  {
    days: 3,
    coins: 10,
    label: '3 dni',
    description: 'Skvelé pre rýchly predaj',
  },
  {
    days: 7,
    coins: 20,
    label: '7 dní',
    description: 'Najobľúbenejšia voľba',
    popular: true,
  },
  {
    days: 14,
    coins: 35,
    label: '14 dní',
    description: 'Ušetríte 10 mincí',
  },
  {
    days: 30,
    coins: 100,
    label: '30 dní',
    description: 'Maximálna viditeľnosť (2€)',
  },
];

interface BoostAdModalProps {
  open: boolean;
  onClose: () => void;
  adId: string;
  adTitle: string;
  userCoins: number;
  onSuccess?: () => void;
}

export function BoostAdModal({ open, onClose, adId, adTitle, userCoins, onSuccess }: BoostAdModalProps) {
  const [selectedOption, setSelectedOption] = useState<BoostOption | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBoost = async () => {
    if (!selectedOption) return;

    if (userCoins < selectedOption.coins) {
      toast.error('Nedostatok mincí', {
        description: `Na topovanie potrebujete ${selectedOption.coins} mincí. Máte len ${userCoins} mincí.`,
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nie ste prihlásený');

      const boostedUntil = new Date();
      boostedUntil.setDate(boostedUntil.getDate() + selectedOption.days);

      const { error: updateError } = await supabase
        .from('ads')
        .update({
          is_boosted: true,
          boosted_until: boostedUntil.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', adId);

      if (updateError) throw updateError;

      const { error: coinsError } = await supabase.rpc('spend_coins', {
        p_user_id: user.id,
        p_amount: selectedOption.coins,
        p_description: `Topovanie inzerátu: ${adTitle} (${selectedOption.days} dní)`,
      });

      if (coinsError) throw coinsError;

      toast.success('Inzerát bol úspešne topovaný!', {
        description: `Váš inzerát bude topovaný po dobu ${selectedOption.days} dní.`,
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Boost error:', error);
      toast.error('Chyba pri topovaní', {
        description: error.message || 'Nepodarilo sa topovať inzerát',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            Topovať inzerát
          </DialogTitle>
          <DialogDescription>
            Topované inzeráty sa zobrazujú na prvých pozíciách a majú výrazný zlatý badge "TOP"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vaše mince</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <Coins className="h-6 w-6" />
                  {userCoins}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/mince', '_blank')}
              >
                Kúpiť mince
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Vyberte dĺžku topovania</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {boostOptions.map((option) => (
                <Card
                  key={option.days}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedOption?.days === option.days
                      ? 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                      : 'border-2 border-transparent'
                  } ${userCoins < option.coins ? 'opacity-50' : ''}`}
                  onClick={() => userCoins >= option.coins && setSelectedOption(option)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg">{option.label}</h4>
                        {option.popular && (
                          <Badge className="bg-amber-500">Populárne</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    {selectedOption?.days === option.days && (
                      <Check className="h-6 w-6 text-emerald-600" />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold">
                      <Coins className="h-5 w-5" />
                      <span>{option.coins} mincí</span>
                    </div>
                    {userCoins < option.coins && (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="h-4 w-4" />
                        Nedostatok mincí
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Topované do: {new Date(Date.now() + option.days * 24 * 60 * 60 * 1000).toLocaleDateString('sk')}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Výhody topovania
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Zobrazenie na prvých pozíciách vo výsledkoch vyhľadávania</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Výrazný zlatý "TOP" badge pre lepšiu viditeľnosť</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Až 10x viac zobrazení a kontaktov</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Prioritné zobrazenie na mobile aj desktope</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Zrušiť
            </Button>
            <Button
              onClick={handleBoost}
              disabled={!selectedOption || loading || userCoins < (selectedOption?.coins || 0)}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {loading ? 'Spracovávam...' : selectedOption ? `Topovať za ${selectedOption.coins} mincí` : 'Vyberte možnosť'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

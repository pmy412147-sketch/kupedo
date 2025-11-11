'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';

interface SystemSettings {
  welcome_bonus_coins: number;
  listing_reward_coins: number;
  boost_prices: { [key: string]: number };
  max_boost_days: number;
  boost_enabled: boolean;
  coin_purchase_enabled: boolean;
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>({
    welcome_bonus_coins: 100,
    listing_reward_coins: 10,
    boost_prices: { '3': 30, '7': 50, '14': 80, '30': 120 },
    max_boost_days: 30,
    boost_enabled: true,
    coin_purchase_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value');

      if (error) throw error;

      const settingsMap: any = {};
      data?.forEach((setting) => {
        const value = setting.value;
        if (setting.key === 'boost_prices') {
          settingsMap[setting.key] = value;
        } else if (typeof value === 'string') {
          // Handle string values
          if (value === 'true') settingsMap[setting.key] = true;
          else if (value === 'false') settingsMap[setting.key] = false;
          else if (!isNaN(Number(value))) settingsMap[setting.key] = Number(value);
          else settingsMap[setting.key] = value;
        } else {
          settingsMap[setting.key] = value;
        }
      });

      setSettings((prev) => ({ ...prev, ...settingsMap }));
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Chyba pri načítaní nastavení');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setSaving(true);

    try {
      // Update each setting
      const updates = [
        { key: 'welcome_bonus_coins', value: settings.welcome_bonus_coins.toString() },
        { key: 'listing_reward_coins', value: settings.listing_reward_coins.toString() },
        { key: 'boost_prices', value: JSON.stringify(settings.boost_prices) },
        { key: 'max_boost_days', value: settings.max_boost_days.toString() },
        { key: 'boost_enabled', value: settings.boost_enabled.toString() },
        { key: 'coin_purchase_enabled', value: settings.coin_purchase_enabled.toString() },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .update({
            value: update.value,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq('key', update.key);

        if (error) throw error;
      }

      toast.success('Nastavenia boli uložené');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Chyba pri ukladaní nastavení');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Nastavenia systému</h1>
        <p className="text-muted-foreground">
          Upravte globálne nastavenia platformy
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Nastavenia mincí</CardTitle>
            <CardDescription>
              Konfigurácia odmeňovania mincami a uvítacích bonusov
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="welcome-bonus">Uvítací bonus (mince)</Label>
              <Input
                id="welcome-bonus"
                type="number"
                value={settings.welcome_bonus_coins}
                onChange={(e) =>
                  setSettings({ ...settings, welcome_bonus_coins: parseInt(e.target.value) || 0 })
                }
              />
              <p className="text-sm text-muted-foreground mt-1">
                Počet mincí, ktoré dostane nový používateľ pri registrácii
              </p>
            </div>

            <div>
              <Label htmlFor="listing-reward">Odmena za inzerát (mince)</Label>
              <Input
                id="listing-reward"
                type="number"
                value={settings.listing_reward_coins}
                onChange={(e) =>
                  setSettings({ ...settings, listing_reward_coins: parseInt(e.target.value) || 0 })
                }
              />
              <p className="text-sm text-muted-foreground mt-1">
                Počet mincí, ktoré dostane používateľ za vytvorenie inzerátu
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nastavenia topovania</CardTitle>
            <CardDescription>
              Konfigurácia cien a možností topovania inzerátov
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="boost-3">3 dni (mince)</Label>
                <Input
                  id="boost-3"
                  type="number"
                  value={settings.boost_prices['3'] || 0}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      boost_prices: { ...settings.boost_prices, '3': parseInt(e.target.value) || 0 },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="boost-7">7 dní (mince)</Label>
                <Input
                  id="boost-7"
                  type="number"
                  value={settings.boost_prices['7'] || 0}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      boost_prices: { ...settings.boost_prices, '7': parseInt(e.target.value) || 0 },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="boost-14">14 dní (mince)</Label>
                <Input
                  id="boost-14"
                  type="number"
                  value={settings.boost_prices['14'] || 0}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      boost_prices: { ...settings.boost_prices, '14': parseInt(e.target.value) || 0 },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="boost-30">30 dní (mince)</Label>
                <Input
                  id="boost-30"
                  type="number"
                  value={settings.boost_prices['30'] || 0}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      boost_prices: { ...settings.boost_prices, '30': parseInt(e.target.value) || 0 },
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="max-boost-days">Maximálna dĺžka topovania (dni)</Label>
              <Input
                id="max-boost-days"
                type="number"
                value={settings.max_boost_days}
                onChange={(e) =>
                  setSettings({ ...settings, max_boost_days: parseInt(e.target.value) || 30 })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funkcie systému</CardTitle>
            <CardDescription>
              Zapnite alebo vypnite určité funkcie platformy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Topovanie inzerátov</Label>
                <p className="text-sm text-muted-foreground">
                  Povoliť používateľom topovať svoje inzeráty
                </p>
              </div>
              <Button
                variant={settings.boost_enabled ? 'default' : 'outline'}
                onClick={() => setSettings({ ...settings, boost_enabled: !settings.boost_enabled })}
              >
                {settings.boost_enabled ? 'Zapnuté' : 'Vypnuté'}
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Nákup mincí</Label>
                <p className="text-sm text-muted-foreground">
                  Povoliť používateľom nakupovať mince cez Stripe
                </p>
              </div>
              <Button
                variant={settings.coin_purchase_enabled ? 'default' : 'outline'}
                onClick={() =>
                  setSettings({ ...settings, coin_purchase_enabled: !settings.coin_purchase_enabled })
                }
              >
                {settings.coin_purchase_enabled ? 'Zapnuté' : 'Vypnuté'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? 'Ukladám...' : 'Uložiť zmeny'}
          </Button>
        </div>
      </div>
    </div>
  );
}

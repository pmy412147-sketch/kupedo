"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
  ConsentPreferences,
  getConsentFromCookie,
  saveConsentToCookie,
  updateGoogleConsent,
  setDefaultGoogleConsent,
  saveConsentToDatabase,
} from "@/lib/consent-manager";

export function ConsentBanner() {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    ad_storage: false,
    ad_user_data: false,
    ad_personalization: false,
    analytics_storage: false,
  });

  useEffect(() => {
    const consent = getConsentFromCookie();
    if (!consent) {
      setShowBanner(true);
      setDefaultGoogleConsent();
    } else {
      setPreferences(consent);
      updateGoogleConsent(consent);
    }
  }, []);

  const saveConsent = async (prefs: ConsentPreferences) => {
    saveConsentToCookie(prefs);
    updateGoogleConsent(prefs);
    setPreferences(prefs);

    if (user) {
      await saveConsentToDatabase(user.id, prefs);
    }
  };

  const handleAcceptAll = async () => {
    const allGranted: ConsentPreferences = {
      ad_storage: true,
      ad_user_data: true,
      ad_personalization: true,
      analytics_storage: true,
    };
    await saveConsent(allGranted);
    setShowBanner(false);
    window.location.reload();
  };

  const handleRejectAll = async () => {
    const allDenied: ConsentPreferences = {
      ad_storage: false,
      ad_user_data: false,
      ad_personalization: false,
      analytics_storage: false,
    };
    await saveConsent(allDenied);
    setShowBanner(false);
  };

  const handleSavePreferences = async () => {
    await saveConsent(preferences);
    setShowSettings(false);
    setShowBanner(false);
    if (preferences.ad_storage) {
      window.location.reload();
    }
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const togglePreference = (key: keyof ConsentPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
        <Card className="max-w-4xl mx-auto p-6 pointer-events-auto shadow-2xl border-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  Používame súbory cookie
                </h3>
                <p className="text-sm text-muted-foreground">
                  Na zlepšenie vášho zážitku používame súbory cookie a podobné technológie.
                  Pomáhajú nám analyzovať návštevnosť, personalizovať reklamy a poskytovať
                  lepšie služby. Môžete si vybrať, ktoré cookie chcete povoliť.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRejectAll}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAcceptAll}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Prijať všetky
              </Button>
              <Button
                onClick={handleRejectAll}
                variant="outline"
                className="flex-1"
              >
                Odmietnuť všetky
              </Button>
              <Button
                onClick={handleOpenSettings}
                variant="outline"
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                Spravovať nastavenia
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Vaše súkromie je pre nás dôležité. Viac informácií o spracovaní údajov
              nájdete v našich pravidlách ochrany súkromia.
            </p>
          </div>
        </Card>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nastavenia súkromia</DialogTitle>
            <DialogDescription>
              Vyberte si, ktoré typy cookie chcete povoliť. Môžete kedykoľvek
              zmeniť svoje nastavenia.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="ad_storage" className="text-base font-semibold">
                  Reklamné ukladanie
                </Label>
                <p className="text-sm text-muted-foreground">
                  Umožňuje ukladanie údajov súvisiacich s reklamami, ako sú
                  kliknutia a zobrazenia reklám.
                </p>
              </div>
              <Switch
                id="ad_storage"
                checked={preferences.ad_storage}
                onCheckedChange={() => togglePreference("ad_storage")}
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="ad_user_data" className="text-base font-semibold">
                  Používateľské údaje pre reklamy
                </Label>
                <p className="text-sm text-muted-foreground">
                  Povolenie na odosielanie používateľských údajov súvisiacich s
                  reklamou do Google pre online reklamu.
                </p>
              </div>
              <Switch
                id="ad_user_data"
                checked={preferences.ad_user_data}
                onCheckedChange={() => togglePreference("ad_user_data")}
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="ad_personalization" className="text-base font-semibold">
                  Personalizácia reklám
                </Label>
                <p className="text-sm text-muted-foreground">
                  Umožňuje personalizáciu reklám na základe vašich preferencií a
                  správania na webe.
                </p>
              </div>
              <Switch
                id="ad_personalization"
                checked={preferences.ad_personalization}
                onCheckedChange={() => togglePreference("ad_personalization")}
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="analytics_storage" className="text-base font-semibold">
                  Analytické ukladanie
                </Label>
                <p className="text-sm text-muted-foreground">
                  Pomáha nám pochopiť, ako používate náš web, aby sme mohli
                  zlepšovať naše služby.
                </p>
              </div>
              <Switch
                id="analytics_storage"
                checked={preferences.analytics_storage}
                onCheckedChange={() => togglePreference("analytics_storage")}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSavePreferences} className="flex-1">
              Uložiť nastavenia
            </Button>
            <Button onClick={handleAcceptAll} variant="outline" className="flex-1">
              Prijať všetky
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

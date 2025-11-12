'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ReportAdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adId: string;
  adTitle: string;
}

const REPORT_REASONS = [
  'Podozrivý alebo podvodný inzerát',
  'Nevhodný obsah',
  'Nesprávna kategória',
  'Duplicitný inzerát',
  'Porušenie podmienok používania',
  'Iné'
];

export function ReportAdModal({ open, onOpenChange, adId, adTitle }: ReportAdModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !reason) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('ad_reports')
        .insert({
          ad_id: adId,
          reporter_id: user.id,
          reason,
          description: description.trim() || null,
          status: 'pending'
        });

      if (error) throw error;

      alert('Vaše nahlásenie bolo odoslané. Ďakujeme!');
      setReason('');
      setDescription('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Chyba pri odosielaní nahlásenia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nahlásiť inzerát</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Nahlasujete inzerát: <strong>{adTitle}</strong>
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Dôvod nahlásenia</label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {REPORT_REASONS.map((r) => (
                <div key={r} className="flex items-center space-x-2">
                  <RadioGroupItem value={r} id={r} />
                  <Label htmlFor={r} className="cursor-pointer font-normal">
                    {r}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Podrobnosti (voliteľné)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Popíšte prosím problém..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/500 znakov
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={loading || !reason}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Odosielam...' : 'Odoslať nahlásenie'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Zrušiť
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

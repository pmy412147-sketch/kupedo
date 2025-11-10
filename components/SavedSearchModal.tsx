'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Bell } from 'lucide-react';

interface SavedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery?: string;
  filters?: any;
}

export function SavedSearchModal({ isOpen, onClose, searchQuery, filters }: SavedSearchModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyFrequency, setNotifyFrequency] = useState<'instant' | 'daily' | 'weekly'>('daily');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !name.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: user.id,
          name: name.trim(),
          search_query: searchQuery || '',
          filters: filters || {},
          notify_email: notifyEmail,
          notify_frequency: notifyFrequency,
        });

      if (error) throw error;

      setName('');
      onClose();
      alert('Vyhľadávanie bolo úspešne uložené!');
    } catch (error) {
      console.error('Error saving search:', error);
      alert('Nepodarilo sa uložiť vyhľadávanie');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-500" />
            Uložiť vyhľadávanie
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Názov vyhľadávania</Label>
            <Input
              id="name"
              placeholder="napr. BMW X5 v Bratislave"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>

          {searchQuery && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Hľadaný výraz:</p>
              <p className="font-medium">{searchQuery}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Emailové notifikácie</Label>
              <p className="text-sm text-gray-500">
                Upozorníme vás na nové inzeráty
              </p>
            </div>
            <Switch
              checked={notifyEmail}
              onCheckedChange={setNotifyEmail}
            />
          </div>

          {notifyEmail && (
            <div>
              <Label>Frekvencia notifikácií</Label>
              <Select value={notifyFrequency} onValueChange={(v: any) => setNotifyFrequency(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Okamžite</SelectItem>
                  <SelectItem value="daily">Denne</SelectItem>
                  <SelectItem value="weekly">Týždenne</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Zrušiť
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600"
          >
            {saving ? 'Ukladám...' : 'Uložiť'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

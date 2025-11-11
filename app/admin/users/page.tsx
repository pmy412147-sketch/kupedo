'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Coins, Ban, UserX, UserCheck, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  balance?: number;
  is_banned?: boolean;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [coinModalOpen, setCoinModalOpen] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [coinAmount, setCoinAmount] = useState('');
  const [coinReason, setCoinReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.email.toLowerCase().includes(query) ||
            u.name?.toLowerCase().includes(query) ||
            u.id.includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setLoading(true);

    try {
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch coin balances
      const { data: coinsData } = await supabase
        .from('user_coins')
        .select('user_id, balance');

      // Fetch active bans
      const { data: bansData } = await supabase
        .from('user_bans')
        .select('user_id')
        .eq('is_active', true);

      const coinsMap = new Map(coinsData?.map((c) => [c.user_id, c.balance]) || []);
      const bannedSet = new Set(bansData?.map((b) => b.user_id) || []);

      const usersWithDetails = profilesData?.map((profile) => ({
        id: profile.user_id,
        email: profile.email || 'N/A',
        name: profile.name || 'Unnamed',
        created_at: profile.created_at,
        balance: coinsMap.get(profile.user_id) || 0,
        is_banned: bannedSet.has(profile.user_id),
      })) || [];

      setUsers(usersWithDetails);
      setFilteredUsers(usersWithDetails);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Chyba pri načítaní používateľov');
    } finally {
      setLoading(false);
    }
  };

  const handleCoinAdjustment = async () => {
    if (!selectedUser || !user || !coinAmount || !coinReason) {
      toast.error('Vyplňte všetky polia');
      return;
    }

    const amount = parseInt(coinAmount);
    if (isNaN(amount) || amount === 0) {
      toast.error('Neplatná suma mincí');
      return;
    }

    setProcessing(true);

    try {
      const { data, error } = await supabase.rpc('admin_adjust_user_coins', {
        p_admin_id: user.id,
        p_user_id: selectedUser.id,
        p_amount: amount,
        p_reason: coinReason,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (result.success) {
        toast.success('Mince úspešne upravené');
        setCoinModalOpen(false);
        setCoinAmount('');
        setCoinReason('');
        fetchUsers();
      } else {
        toast.error(result.error || 'Nepodarilo sa upraviť mince');
      }
    } catch (error: any) {
      console.error('Error adjusting coins:', error);
      toast.error(error.message || 'Chyba pri úprave mincí');
    } finally {
      setProcessing(false);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser || !user || !banReason) {
      toast.error('Vyplňte dôvod banu');
      return;
    }

    setProcessing(true);

    try {
      const { data, error } = await supabase.rpc('admin_ban_user', {
        p_admin_id: user.id,
        p_user_id: selectedUser.id,
        p_reason: banReason,
        p_expires_at: null,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (result.success) {
        toast.success('Používateľ bol zabanovaný');
        setBanModalOpen(false);
        setBanReason('');
        fetchUsers();
      } else {
        toast.error(result.error || 'Nepodarilo sa zabanovať používateľa');
      }
    } catch (error: any) {
      console.error('Error banning user:', error);
      toast.error(error.message || 'Chyba pri banovaní');
    } finally {
      setProcessing(false);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('admin_unban_user', {
        p_admin_id: user.id,
        p_user_id: userId,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (result.success) {
        toast.success('Ban bol odstránený');
        fetchUsers();
      } else {
        toast.error(result.error || 'Nepodarilo sa odstrániť ban');
      }
    } catch (error: any) {
      console.error('Error unbanning user:', error);
      toast.error(error.message || 'Chyba pri odstraňovaní banu');
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
        <h1 className="text-3xl font-bold mb-2">Správa používateľov</h1>
        <p className="text-muted-foreground">
          Spravujte používateľov, mince a bany
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Vyhľadávanie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Hľadať podľa emailu, mena alebo ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Používatelia ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{u.name}</h3>
                    {u.is_banned && (
                      <Badge variant="destructive">
                        <Ban className="h-3 w-3 mr-1" />
                        Banovaný
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{u.email}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Coins className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium">{u.balance} mincí</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(u);
                      setCoinModalOpen(true);
                    }}
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    Upraviť mince
                  </Button>

                  {u.is_banned ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnbanUser(u.id)}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Odbanovať
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(u);
                        setBanModalOpen(true);
                      }}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Zabanovať
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coin Adjustment Modal */}
      <Dialog open={coinModalOpen} onOpenChange={setCoinModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upraviť mince používateľa</DialogTitle>
            <DialogDescription>
              {selectedUser?.name} ({selectedUser?.email})
              <br />
              Aktuálny zostatok: {selectedUser?.balance} mincí
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="coin-amount">Suma (použite - pre odpočítanie)</Label>
              <Input
                id="coin-amount"
                type="number"
                placeholder="napr. 100 alebo -50"
                value={coinAmount}
                onChange={(e) => setCoinAmount(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="coin-reason">Dôvod úpravy</Label>
              <Textarea
                id="coin-reason"
                placeholder="Napíšte dôvod tejto úpravy..."
                value={coinReason}
                onChange={(e) => setCoinReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCoinModalOpen(false);
                setCoinAmount('');
                setCoinReason('');
              }}
            >
              Zrušiť
            </Button>
            <Button
              onClick={handleCoinAdjustment}
              disabled={processing || !coinAmount || !coinReason}
            >
              {processing ? 'Spracúvam...' : 'Potvrdiť'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Modal */}
      <Dialog open={banModalOpen} onOpenChange={setBanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zabanovať používateľa</DialogTitle>
            <DialogDescription>
              {selectedUser?.name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="ban-reason">Dôvod banu</Label>
              <Textarea
                id="ban-reason"
                placeholder="Napíšte dôvod banu..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBanModalOpen(false);
                setBanReason('');
              }}
            >
              Zrušiť
            </Button>
            <Button
              variant="destructive"
              onClick={handleBanUser}
              disabled={processing || !banReason}
            >
              {processing ? 'Spracúvam...' : 'Zabanovať'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

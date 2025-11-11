'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Trash2, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Ad {
  id: string;
  title: string;
  price: number;
  location: string;
  status: string;
  created_at: string;
  user_id: string;
  images: string[];
  view_count: number;
  is_boosted?: boolean;
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [filteredAds, setFilteredAds] = useState<Ad[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  useEffect(() => {
    let filtered = ads;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((ad) => ad.status === statusFilter);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ad) =>
          ad.title.toLowerCase().includes(query) ||
          ad.location.toLowerCase().includes(query) ||
          ad.id.includes(query)
      );
    }

    setFilteredAds(filtered);
  }, [searchQuery, statusFilter, ads]);

  const fetchAds = async () => {
    setLoading(true);

    try {
      const { data: adsData, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check which ads are boosted
      const adIds = adsData?.map((ad) => ad.id) || [];
      const { data: boosts } = await supabase
        .from('listing_boosts')
        .select('ad_id')
        .in('ad_id', adIds)
        .eq('is_active', true)
        .gt('boost_end', new Date().toISOString());

      const boostedSet = new Set(boosts?.map((b) => b.ad_id) || []);

      const adsWithBoostStatus = adsData?.map((ad) => ({
        ...ad,
        is_boosted: boostedSet.has(ad.id),
      })) || [];

      setAds(adsWithBoostStatus);
      setFilteredAds(adsWithBoostStatus);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast.error('Chyba pri načítaní inzerátov');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Naozaj chcete odstrániť tento inzerát?')) return;

    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId);

      if (error) throw error;

      toast.success('Inzerát bol odstránený');
      fetchAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error('Chyba pri odstraňovaní inzerátu');
    }
  };

  const handleChangeStatus = async (adId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ status: newStatus })
        .eq('id', adId);

      if (error) throw error;

      toast.success('Stav inzerátu bol zmenený');
      fetchAds();
    } catch (error) {
      console.error('Error changing ad status:', error);
      toast.error('Chyba pri zmene stavu');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: { label: string; variant: any } } = {
      active: { label: 'Aktívny', variant: 'default' },
      pending: { label: 'Čaká na schválenie', variant: 'secondary' },
      expired: { label: 'Vypršaný', variant: 'outline' },
      banned: { label: 'Banovaný', variant: 'destructive' },
    };

    const config = variants[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
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
        <h1 className="text-3xl font-bold mb-2">Správa inzerátov</h1>
        <p className="text-muted-foreground">
          Spravujte všetky inzeráty na platforme
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtre</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Hľadať podľa názvu, lokality alebo ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter podľa stavu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všetky stavy</SelectItem>
                <SelectItem value="active">Aktívne</SelectItem>
                <SelectItem value="pending">Čakajúce</SelectItem>
                <SelectItem value="expired">Vypršané</SelectItem>
                <SelectItem value="banned">Banované</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inzeráty ({filteredAds.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAds.map((ad) => (
              <div
                key={ad.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                {ad.images[0] && (
                  <img
                    src={ad.images[0]}
                    alt={ad.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{ad.title}</h3>
                        {ad.is_boosted && (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            TOP
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{ad.location}</span>
                        <span>•</span>
                        <span className="font-medium text-emerald-600">€{ad.price}</span>
                        <span>•</span>
                        <span>{ad.view_count} zobrazení</span>
                      </div>
                    </div>
                    {getStatusBadge(ad.status)}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/inzerat/${ad.id}`} target="_blank">
                        <Eye className="h-4 w-4 mr-2" />
                        Zobraziť
                      </Link>
                    </Button>

                    {ad.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChangeStatus(ad.id, 'active')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Schváliť
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChangeStatus(ad.id, 'banned')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Odmietnuť
                        </Button>
                      </>
                    )}

                    {ad.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangeStatus(ad.id, 'banned')}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Deaktivovať
                      </Button>
                    )}

                    {ad.status === 'banned' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangeStatus(ad.id, 'active')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aktivovať
                      </Button>
                    )}

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAd(ad.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Odstrániť
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredAds.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Žiadne inzeráty neboli nájdené</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

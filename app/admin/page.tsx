'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, AlertCircle, TrendingUp, Eye, MessageSquare } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalAds: number;
  activeAds: number;
  pendingAds: number;
  totalReports: number;
  pendingReports: number;
  totalViews: number;
  totalMessages: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAds: 0,
    activeAds: 0,
    pendingAds: 0,
    totalReports: 0,
    pendingReports: 0,
    totalViews: 0,
    totalMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);

    try {
      const [
        usersResult,
        adsResult,
        activeAdsResult,
        pendingAdsResult,
        reportsResult,
        pendingReportsResult,
        viewsResult,
        messagesResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('ads').select('id', { count: 'exact', head: true }),
        supabase.from('ads').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('ads').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('ad_reports').select('id', { count: 'exact', head: true }),
        supabase.from('ad_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('ads').select('view_count'),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
      ]);

      const totalViews = viewsResult.data?.reduce((sum, ad) => sum + (ad.view_count || 0), 0) || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        totalAds: adsResult.count || 0,
        activeAds: activeAdsResult.count || 0,
        pendingAds: pendingAdsResult.count || 0,
        totalReports: reportsResult.count || 0,
        pendingReports: pendingReportsResult.count || 0,
        totalViews,
        totalMessages: messagesResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Celkovo používateľov',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Aktívne inzeráty',
      value: stats.activeAds,
      subtitle: `z ${stats.totalAds} celkovo`,
      icon: FileText,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Čakajúce na schválenie',
      value: stats.pendingAds,
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Nevyriešené reporty',
      value: stats.pendingReports,
      subtitle: `z ${stats.totalReports} celkovo`,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Celkové zobrazenia',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Správy',
      value: stats.totalMessages,
      icon: MessageSquare,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ];

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
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Prehľad platformy Kupedo.sk
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.subtitle}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rýchle akcie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/ads?status=pending"
              className="block p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Schváliť inzeráty</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.pendingAds} čakajúcich inzerátov
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
            </a>
            <a
              href="/admin/reports"
              className="block p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Vyriešiť reporty</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.pendingReports} nevyriešených reportov
                  </p>
                </div>
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Systémové info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Platforma</span>
                <span className="text-sm font-medium">Kupedo.sk</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Verzia</span>
                <span className="text-sm font-medium">1.0.0</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Stav</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <span className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
                  Online
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

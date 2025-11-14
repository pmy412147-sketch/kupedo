'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  Activity,
  Users,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface AIStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokensUsed: number;
  averageResponseTime: number;
  requestsByFeature: Record<string, number>;
}

export default function AIAdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [cacheStats, setCacheStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      router.push('/');
      return;
    }

    const { data: adminData } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!adminData) {
      router.push('/');
      return;
    }

    loadDashboardData();
  };

  const loadDashboardData = async () => {
    setLoading(true);

    try {
      const { data: logsData } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsData) {
        setRecentLogs(logsData);

        const totalRequests = logsData.length;
        const successfulRequests = logsData.filter((l) => l.success).length;
        const failedRequests = logsData.filter((l) => !l.success).length;
        const totalTokensUsed = logsData.reduce((sum, l) => sum + (l.tokens_used || 0), 0);
        const avgResponseTime =
          logsData.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / logsData.length;

        const requestsByFeature: Record<string, number> = {};
        logsData.forEach((log) => {
          requestsByFeature[log.feature_type] = (requestsByFeature[log.feature_type] || 0) + 1;
        });

        setStats({
          totalRequests,
          successfulRequests,
          failedRequests,
          totalTokensUsed,
          averageResponseTime: Math.round(avgResponseTime),
          requestsByFeature,
        });
      }

      const { data: cacheData } = await supabase
        .from('ai_cache')
        .select('hit_count, tokens_saved, feature_type');

      if (cacheData) {
        const totalHits = cacheData.reduce((sum, c) => sum + c.hit_count, 0);
        const totalTokensSaved = cacheData.reduce((sum, c) => sum + c.tokens_saved, 0);

        setCacheStats({
          totalEntries: cacheData.length,
          totalHits,
          totalTokensSaved,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('sk-SK').format(num);
  };

  const estimatedCost = stats ? (stats.totalTokensUsed / 1000000) * 0.1 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 p-8">
        <div className="container mx-auto">
          <p>Načítavam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 p-8">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-emerald-600" />
            AI Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Prehľad využitia AI funkcií a štatistiky
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Celkové requesty</p>
                <p className="text-3xl font-bold">{formatNumber(stats?.totalRequests || 0)}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Úspešnosť</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats ? Math.round((stats.successfulRequests / stats.totalRequests) * 100) : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Priemerný čas</p>
                <p className="text-3xl font-bold">{stats?.averageResponseTime || 0}ms</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Odhadované náklady</p>
                <p className="text-3xl font-bold text-emerald-600">${estimatedCost.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="features" className="space-y-6">
          <TabsList>
            <TabsTrigger value="features">Funkcie</TabsTrigger>
            <TabsTrigger value="cache">Cache</TabsTrigger>
            <TabsTrigger value="logs">Logy</TabsTrigger>
          </TabsList>

          <TabsContent value="features">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Využitie podľa funkcií</h2>
              <div className="space-y-4">
                {stats?.requestsByFeature &&
                  Object.entries(stats.requestsByFeature).map(([feature, count]) => (
                    <div key={feature}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">
                          {feature.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-bold">{formatNumber(count as number)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{
                            width: `${((count as number) / stats.totalRequests) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="cache">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Cache Štatistiky</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Cache záznamy</p>
                  <p className="text-2xl font-bold">{formatNumber(cacheStats?.totalEntries || 0)}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Cache hits</p>
                  <p className="text-2xl font-bold">{formatNumber(cacheStats?.totalHits || 0)}</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Ušetrené tokeny</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(cacheStats?.totalTokensSaved || 0)}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Posledné AI requesty</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Čas</th>
                      <th className="text-left p-2">Funkcia</th>
                      <th className="text-left p-2">Stav</th>
                      <th className="text-left p-2">Čas (ms)</th>
                      <th className="text-left p-2">Tokeny</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogs.slice(0, 20).map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-2 text-sm">
                          {new Date(log.created_at).toLocaleString('sk-SK')}
                        </td>
                        <td className="p-2 text-sm capitalize">
                          {log.feature_type.replace(/_/g, ' ')}
                        </td>
                        <td className="p-2">
                          {log.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </td>
                        <td className="p-2 text-sm">{log.response_time_ms || '-'}</td>
                        <td className="p-2 text-sm">{log.tokens_used || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

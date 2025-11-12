'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { AlertCircle, CheckCircle, Trash2, Eye } from 'lucide-react';

interface AdReport {
  id: string;
  ad_id: string;
  reporter_id: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
  ad: {
    title: string;
    user_id: string;
  };
  reporter: {
    display_name: string;
  };
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<AdReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_reports')
        .select(`
          *,
          ad:advertisements(title, user_id),
          reporter:profiles!ad_reports_reporter_id_fkey(display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('ad_reports')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', reportId);

      if (error) throw error;
      loadReports();
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Chyba pri aktualizácii nahlásenia');
    }
  };

  const deleteAd = async (adId: string) => {
    if (!confirm('Naozaj chcete vymazať tento inzerát?')) return;

    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', adId);

      if (error) throw error;
      alert('Inzerát bol vymazaný');
      loadReports();
    } catch (error) {
      console.error('Error deleting ad:', error);
      alert('Chyba pri vymazávaní inzerátu');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Naozaj chcete vymazať tohto používateľa? Táto akcia je nevratná!')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      alert('Používateľ bol vymazaný');
      loadReports();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Chyba pri vymazávaní používateľa');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Nahlásené inzeráty</h1>
      </div>

      {loading ? (
        <div className="text-center py-12">Načítavam...</div>
      ) : reports.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Žiadne nahlásenia</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {report.ad?.title || 'Inzerát bol vymazaný'}
                  </h3>
                  <Badge
                    variant={
                      report.status === 'pending'
                        ? 'default'
                        : report.status === 'reviewed'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {report.status === 'pending'
                      ? 'Čaká na vyriešenie'
                      : report.status === 'reviewed'
                      ? 'Preskúmané'
                      : 'Vyriešené'}
                  </Badge>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(report.created_at).toLocaleDateString('sk-SK')}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <strong>Dôvod:</strong> {report.reason}
                </p>
                {report.description && (
                  <p className="text-sm">
                    <strong>Popis:</strong> {report.description}
                  </p>
                )}
                <p className="text-sm">
                  <strong>Nahlásil:</strong> {report.reporter?.display_name || 'Neznámy'}
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                {report.ad && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/inzerat/${report.ad_id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Zobraziť inzerát
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteAd(report.ad_id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Vymazať inzerát
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteUser(report.ad.user_id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Vymazať používateľa
                    </Button>
                  </>
                )}

                {report.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => updateReportStatus(report.id, 'reviewed')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Označiť ako preskúmané
                  </Button>
                )}

                {report.status === 'reviewed' && (
                  <Button
                    size="sm"
                    onClick={() => updateReportStatus(report.id, 'resolved')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Vyriešené
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface PerformanceData {
  userId: string;
  email: string;
  displayName: string;
  totalViews: number;
  totalInteractions: number;
  totalFavorites: number;
  topAds: Array<{
    title: string;
    views: number;
    interactions: number;
  }>;
  viewsChange: number;
  interactionsChange: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all users with active ads
    const { data: activeUsers } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        display_name,
        ads!inner(id)
      `)
      .eq('ads.status', 'active');

    if (!activeUsers || activeUsers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active users found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const reports: PerformanceData[] = [];

    for (const user of activeUsers) {
      // Get user's ads
      const { data: userAds } = await supabase
        .from('ads')
        .select('id, title')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (!userAds || userAds.length === 0) continue;

      const adIds = userAds.map(ad => ad.id);

      // Get this week's stats
      const { data: thisWeekViews } = await supabase
        .from('listing_views')
        .select('ad_id')
        .in('ad_id', adIds)
        .gte('viewed_at', lastWeek.toISOString());

      const { data: thisWeekInteractions } = await supabase
        .from('listing_interactions')
        .select('ad_id')
        .in('ad_id', adIds)
        .gte('created_at', lastWeek.toISOString());

      // Get last week's stats for comparison
      const { data: lastWeekViews } = await supabase
        .from('listing_views')
        .select('ad_id')
        .in('ad_id', adIds)
        .gte('viewed_at', twoWeeksAgo.toISOString())
        .lt('viewed_at', lastWeek.toISOString());

      const { data: lastWeekInteractions } = await supabase
        .from('listing_interactions')
        .select('ad_id')
        .in('ad_id', adIds)
        .gte('created_at', twoWeeksAgo.toISOString())
        .lt('created_at', lastWeek.toISOString());

      // Calculate changes
      const thisWeekViewCount = thisWeekViews?.length || 0;
      const lastWeekViewCount = lastWeekViews?.length || 0;
      const viewsChange = lastWeekViewCount > 0
        ? ((thisWeekViewCount - lastWeekViewCount) / lastWeekViewCount) * 100
        : thisWeekViewCount > 0 ? 100 : 0;

      const thisWeekInteractionCount = thisWeekInteractions?.length || 0;
      const lastWeekInteractionCount = lastWeekInteractions?.length || 0;
      const interactionsChange = lastWeekInteractionCount > 0
        ? ((thisWeekInteractionCount - lastWeekInteractionCount) / lastWeekInteractionCount) * 100
        : thisWeekInteractionCount > 0 ? 100 : 0;

      // Get top performing ads
      const adViewCounts = new Map();
      const adInteractionCounts = new Map();

      thisWeekViews?.forEach(view => {
        adViewCounts.set(view.ad_id, (adViewCounts.get(view.ad_id) || 0) + 1);
      });

      thisWeekInteractions?.forEach(interaction => {
        adInteractionCounts.set(interaction.ad_id, (adInteractionCounts.get(interaction.ad_id) || 0) + 1);
      });

      const topAds = userAds
        .map(ad => ({
          title: ad.title,
          views: adViewCounts.get(ad.id) || 0,
          interactions: adInteractionCounts.get(ad.id) || 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 3);

      // Get total favorites
      const { count: totalFavorites } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .in('ad_id', adIds);

      const reportData: PerformanceData = {
        userId: user.id,
        email: user.email,
        displayName: user.display_name || 'Používateľ',
        totalViews: thisWeekViewCount,
        totalInteractions: thisWeekInteractionCount,
        totalFavorites: totalFavorites || 0,
        topAds,
        viewsChange,
        interactionsChange,
      };

      reports.push(reportData);

      // Save report to database
      await supabase.from('performance_reports').insert({
        user_id: user.id,
        report_type: 'weekly',
        period_start: lastWeek.toISOString(),
        period_end: now.toISOString(),
        total_views: thisWeekViewCount,
        total_interactions: thisWeekInteractionCount,
        report_data: reportData,
        sent_at: now.toISOString(),
      });
    }

    return new Response(
      JSON.stringify({
        message: 'Reports generated successfully',
        count: reports.length,
        reports,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating reports:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

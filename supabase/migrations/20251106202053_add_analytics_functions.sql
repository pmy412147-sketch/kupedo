/*
  # Add Analytics Helper Functions

  1. Functions
    - increment_view_count: Safely increment ad view count
    - get_ad_analytics: Get comprehensive analytics for an ad
    - get_user_analytics_summary: Get analytics summary for all user's ads
*/

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(ad_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE ads
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get ad analytics
CREATE OR REPLACE FUNCTION get_ad_analytics(
  ad_id uuid,
  days_back integer DEFAULT 30
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  start_date timestamptz;
BEGIN
  start_date := NOW() - (days_back || ' days')::interval;

  SELECT jsonb_build_object(
    'total_views', (
      SELECT COUNT(*)
      FROM listing_views
      WHERE listing_views.ad_id = get_ad_analytics.ad_id
        AND viewed_at >= start_date
    ),
    'total_interactions', (
      SELECT COUNT(*)
      FROM listing_interactions
      WHERE listing_interactions.ad_id = get_ad_analytics.ad_id
        AND created_at >= start_date
    ),
    'views_by_source', (
      SELECT jsonb_object_agg(source, count)
      FROM (
        SELECT source, COUNT(*) as count
        FROM listing_views
        WHERE listing_views.ad_id = get_ad_analytics.ad_id
          AND viewed_at >= start_date
        GROUP BY source
      ) sources
    ),
    'interactions_by_type', (
      SELECT jsonb_object_agg(action_type, count)
      FROM (
        SELECT action_type, COUNT(*) as count
        FROM listing_interactions
        WHERE listing_interactions.ad_id = get_ad_analytics.ad_id
          AND created_at >= start_date
        GROUP BY action_type
      ) interactions
    ),
    'views_by_device', (
      SELECT jsonb_object_agg(device_type, count)
      FROM (
        SELECT device_type, COUNT(*) as count
        FROM listing_views
        WHERE listing_views.ad_id = get_ad_analytics.ad_id
          AND viewed_at >= start_date
        GROUP BY device_type
      ) devices
    ),
    'avg_duration', (
      SELECT AVG(duration)
      FROM listing_views
      WHERE listing_views.ad_id = get_ad_analytics.ad_id
        AND viewed_at >= start_date
        AND duration > 0
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user analytics summary
CREATE OR REPLACE FUNCTION get_user_analytics_summary(
  user_id uuid,
  days_back integer DEFAULT 30
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  start_date timestamptz;
BEGIN
  start_date := NOW() - (days_back || ' days')::interval;

  SELECT jsonb_build_object(
    'total_ads', (
      SELECT COUNT(*)
      FROM ads
      WHERE ads.user_id = get_user_analytics_summary.user_id
    ),
    'active_ads', (
      SELECT COUNT(*)
      FROM ads
      WHERE ads.user_id = get_user_analytics_summary.user_id
        AND status = 'active'
    ),
    'total_views', (
      SELECT COUNT(*)
      FROM listing_views lv
      JOIN ads a ON lv.ad_id = a.id
      WHERE a.user_id = get_user_analytics_summary.user_id
        AND lv.viewed_at >= start_date
    ),
    'total_interactions', (
      SELECT COUNT(*)
      FROM listing_interactions li
      JOIN ads a ON li.ad_id = a.id
      WHERE a.user_id = get_user_analytics_summary.user_id
        AND li.created_at >= start_date
    ),
    'views_trend', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', day,
          'count', count
        ) ORDER BY day
      )
      FROM (
        SELECT DATE(lv.viewed_at) as day, COUNT(*) as count
        FROM listing_views lv
        JOIN ads a ON lv.ad_id = a.id
        WHERE a.user_id = get_user_analytics_summary.user_id
          AND lv.viewed_at >= start_date
        GROUP BY DATE(lv.viewed_at)
      ) daily_views
    ),
    'top_performing_ads', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'ad_id', ad_id,
          'title', title,
          'views', views
        )
      )
      FROM (
        SELECT 
          a.id as ad_id,
          a.title,
          COUNT(lv.id) as views
        FROM ads a
        LEFT JOIN listing_views lv ON a.id = lv.ad_id
          AND lv.viewed_at >= start_date
        WHERE a.user_id = get_user_analytics_summary.user_id
        GROUP BY a.id, a.title
        ORDER BY views DESC
        LIMIT 5
      ) top_ads
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

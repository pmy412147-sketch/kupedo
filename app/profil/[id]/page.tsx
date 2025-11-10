'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdCard } from '@/components/AdCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase, Profile, Ad, Review } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import {
  MapPin,
  Calendar,
  Star,
  ShieldCheck,
  Mail,
  Phone,
  CheckCircle2,
  MessageSquare,
  Package,
  TrendingUp,
  Award
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { sk } from 'date-fns/locale';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [userAds, setUserAds] = useState<Ad[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, [profileId]);

  const fetchProfileData = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      const { data: adsData } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', profileId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(12);

      setUserAds(adsData || []);

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey(display_name, avatar_url),
          ad:ads(title)
        `)
        .eq('reviewed_user_id', profileId)
        .order('created_at', { ascending: false })
        .limit(10);

      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    router.push(`/chat/${profileId}`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-6">
              <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold">Profil nenájdený</h1>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 pb-24 md:pb-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <Card className="p-6 md:p-8 mb-8 bg-white dark:bg-gray-800">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="w-32 h-32 border-4 border-emerald-100 dark:border-emerald-900">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-4xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                  {profile.display_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {profile.display_name || 'Používateľ'}
                    </h1>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {profile.verified_email && (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                          <Mail className="h-3 w-3 mr-1" />
                          Email overený
                        </Badge>
                      )}
                      {profile.verified_phone && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          <Phone className="h-3 w-3 mr-1" />
                          Telefón overený
                        </Badge>
                      )}
                      {profile.verified_id && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Totožnosť overená
                        </Badge>
                      )}
                      {profile.is_dealer && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                          <Award className="h-3 w-3 mr-1" />
                          Profesionálny predajca
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {profile.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Člen {formatDistanceToNow(new Date(profile.member_since), { addSuffix: true, locale: sk })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleContact}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Kontaktovať
                  </Button>
                </div>

                {profile.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {profile.bio}
                  </p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Hodnotenie</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.rating_average || '0.0'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {profile.rating_count} recenzií
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Inzeráty</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userAds.length}
                    </p>
                    <p className="text-xs text-gray-500">aktívnych</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Predaných</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.total_sales}
                    </p>
                    <p className="text-xs text-gray-500">produktov</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Overenia</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {[profile.verified_email, profile.verified_phone, profile.verified_id].filter(Boolean).length}/3
                    </p>
                    <p className="text-xs text-gray-500">dokončené</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="ads" className="w-full">
            <TabsList className="w-full justify-start bg-white dark:bg-gray-800 border-b">
              <TabsTrigger value="ads">Inzeráty ({userAds.length})</TabsTrigger>
              <TabsTrigger value="reviews">Recenzie ({reviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="ads" className="mt-6">
              {userAds.length === 0 ? (
                <Card className="p-12 text-center">
                  <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500">Žiadne aktívne inzeráty</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {userAds.map((ad) => (
                    <AdCard
                      key={ad.id}
                      id={ad.id}
                      title={ad.title}
                      price={ad.price}
                      location={ad.location}
                      images={ad.images}
                      user_id={ad.user_id}
                      created_at={ad.created_at}
                      view_count={ad.view_count}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              {reviews.length === 0 ? (
                <Card className="p-12 text-center">
                  <Star className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500">Žiadne recenzie</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={review.reviewer?.avatar_url} />
                          <AvatarFallback>{review.reviewer?.display_name?.[0]}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold">{review.reviewer?.display_name}</p>
                              <p className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: sk })}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {review.ad && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Inzerát: {review.ad.title}
                            </p>
                          )}

                          {review.comment && (
                            <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
}

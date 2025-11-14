'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  MessageSquare,
  Heart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Eye,
  Sparkles,
  Clock,
  Filter,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { sk } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'message' | 'favorite' | 'view' | 'price_drop' | 'quality' | 'ai_suggestion';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  created_at: string;
  ad_id?: string;
  action_url?: string;
}

interface SmartNotificationsProps {
  userId: string;
}

export function SmartNotifications({ userId }: SmartNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'message',
          title: 'Nová správa',
          description: 'Máte novú správu o vašom inzeráte "iPhone 13 Pro"',
          priority: 'high',
          read: false,
          created_at: new Date().toISOString(),
          ad_id: '123',
        },
        {
          id: '2',
          type: 'favorite',
          title: 'Pridané do obľúbených',
          description: '3 používatelia pridali váš inzerát do obľúbených',
          priority: 'medium',
          read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          type: 'ai_suggestion',
          title: 'AI Odporúčanie',
          description: 'Znížte cenu o 10% pre rýchlejší predaj. Podobné produkty sa predávajú za nižšie ceny.',
          priority: 'high',
          read: false,
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: '4',
          type: 'quality',
          title: 'Kvalita inzerátu',
          description: 'Váš inzerát má nízke skóre kvality (45/100). Pridajte viac fotografií.',
          priority: 'medium',
          read: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '5',
          type: 'view',
          title: 'Vysoký záujem',
          description: 'Váš inzerát mal 50+ zobrazení za posledných 24 hodín!',
          priority: 'low',
          read: true,
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5" />;
      case 'favorite':
        return <Heart className="h-5 w-5" />;
      case 'view':
        return <Eye className="h-5 w-5" />;
      case 'price_drop':
        return <TrendingUp className="h-5 w-5" />;
      case 'quality':
        return <AlertCircle className="h-5 w-5" />;
      case 'ai_suggestion':
        return <Sparkles className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'text-blue-600 bg-blue-100';
      case 'favorite':
        return 'text-red-600 bg-red-100';
      case 'view':
        return 'text-purple-600 bg-purple-100';
      case 'price_drop':
        return 'text-green-600 bg-green-100';
      case 'quality':
        return 'text-orange-600 bg-orange-100';
      case 'ai_suggestion':
        return 'text-emerald-600 bg-emerald-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Vysoká</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Stredná</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Nízka</Badge>;
      default:
        return null;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'high') return n.priority === 'high';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-emerald-600" />
            Smart Notifikácie
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
            )}
          </h2>
          <p className="text-gray-600 mt-1">AI prioritizované upozornenia v reálnom čase</p>
        </div>
        <Button onClick={markAllAsRead} variant="outline" size="sm" disabled={unreadCount === 0}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Označiť všetko ako prečítané
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          style={filter === 'all' ? { backgroundColor: '#10b981' } : {}}
        >
          Všetky ({notifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
          style={filter === 'unread' ? { backgroundColor: '#10b981' } : {}}
        >
          Neprečítané ({unreadCount})
        </Button>
        <Button
          variant={filter === 'high' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('high')}
          style={filter === 'high' ? { backgroundColor: '#10b981' } : {}}
        >
          Vysoká priorita ({highPriorityCount})
        </Button>
      </div>

      {filteredNotifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Žiadne notifikácie</h3>
          <p className="text-gray-600">
            {filter === 'all' ? 'Zatiaľ nemáte žiadne notifikácie' : 'Žiadne notifikácie v tejto kategórii'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map(notification => (
            <Card
              key={notification.id}
              className={`p-4 transition-all hover:shadow-md ${
                !notification.read ? 'border-l-4 border-l-emerald-600 bg-emerald-50' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${getIconColor(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{notification.title}</h3>
                      {getPriorityBadge(notification.priority)}
                      {!notification.read && (
                        <Badge className="bg-emerald-600 text-white">Nové</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: sk,
                        })}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">{notification.description}</p>

                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Označiť ako prečítané
                      </Button>
                    )}
                    {notification.action_url && (
                      <Button size="sm" style={{ backgroundColor: '#10b981' }}>
                        Zobraziť detail
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
        <div className="flex items-start gap-3">
          <Sparkles className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Smart Notifikácie</h3>
            <p className="text-sm text-gray-700">
              Naša AI automaticky prioritizuje dôležité notifikácie a filtruje menej podstatné upozornenia.
              Dostávate len tie správy, ktoré sú pre vás skutočne dôležité.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

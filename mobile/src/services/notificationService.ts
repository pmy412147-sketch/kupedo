import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotifications = async (userId: string) => {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2ECC71',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id-here'
    });
    const token = tokenData.data;
    console.log('Push token:', token);

    await savePushToken(userId, token);

    return token;
  } catch (error) {
    console.log('Push notifications not available in Expo Go. Use development build for full functionality.');
    return null;
  }
};

const savePushToken = async (userId: string, token: string) => {
  try {
    const deviceType = Platform.OS;

    const { data: existingToken } = await supabase
      .from('push_tokens')
      .select('id')
      .eq('user_id', userId)
      .eq('token', token)
      .maybeSingle();

    if (existingToken) {
      await supabase
        .from('push_tokens')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', existingToken.id);
    } else {
      await supabase
        .from('push_tokens')
        .insert({
          user_id: userId,
          token,
          device_type: deviceType,
        });
    }

    console.log('Push token saved successfully');
  } catch (error) {
    console.error('Error saving push token:', error);
  }
};

export const removePushToken = async (userId: string) => {
  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;

    await supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('token', token);

    console.log('Push token removed successfully');
  } catch (error) {
    console.error('Error removing push token:', error);
  }
};

export const setupNotificationListeners = (navigation: any) => {
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification response:', response);

    const data = response.notification.request.content.data;

    if (data.type === 'message') {
      if (data.conversationId) {
        navigation.navigate('Chat', {
          userId: data.senderId,
          conversationId: data.conversationId
        });
      }
    } else if (data.type === 'ad') {
      if (data.adId) {
        navigation.navigate('AdDetail', { id: data.adId });
      }
    }
  });

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
};

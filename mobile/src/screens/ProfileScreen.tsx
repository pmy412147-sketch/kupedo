import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [adCount, setAdCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadAdCount();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();

    if (data) setProfile(data);
  };

  const loadAdCount = async () => {
    const { count } = await supabase
      .from('advertisements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id);

    setAdCount(count || 0);
  };

  const handleSignOut = async () => {
    Alert.alert('Odhlásiť sa', 'Naozaj sa chcete odhlásiť?', [
      { text: 'Zrušiť', style: 'cancel' },
      {
        text: 'Odhlásiť',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.full_name?.[0] || user?.email?.[0] || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.full_name || 'Používateľ'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{adCount}</Text>
          <Text style={styles.statLabel}>Inzeráty</Text>
        </View>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Main', { screen: 'Ads' })}
        >
          <Text style={styles.menuItemText}>📝 Moje inzeráty</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Main', { screen: 'Favorites' })}
        >
          <Text style={styles.menuItemText}>❤️ Obľúbené</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Main', { screen: 'Messages' })}
        >
          <Text style={styles.menuItemText}>💬 Správy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.signOutItem]} onPress={handleSignOut}>
          <Text style={[styles.menuItemText, styles.signOutText]}>🚪 Odhlásiť sa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  stats: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  menu: {
    marginTop: 15,
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
  },
  signOutItem: {
    marginTop: 15,
  },
  signOutText: {
    color: '#FF3B30',
  },
});

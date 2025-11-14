import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useEffect, useRef } from 'react';
import { setupNotificationListeners } from './src/services/notificationService';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AdListScreen from './src/screens/AdListScreen';
import AdDetailScreen from './src/screens/AdDetailScreen';
import CreateAdScreen from './src/screens/CreateAdScreen';
import EditAdScreen from './src/screens/EditAdScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ChatScreen from './src/screens/ChatScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CoinsScreen from './src/screens/CoinsScreen';
import MyAdsScreen from './src/screens/MyAdsScreen';
import BoostAdScreen from './src/screens/BoostAdScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import { colors, spacing, typography } from './src/theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Prihlásenie' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registrácia' }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom || 8,
          paddingTop: 8,
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.border.light,
        },
        tabBarActiveTintColor: colors.emerald[600],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Domov',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="CreateAd"
        component={CreateAdScreen}
        options={{
          title: 'Pridať',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.addButton}>
              <Text style={{ fontSize: 28, color: colors.white }}>+</Text>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          title: 'Správy',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>💬</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator>
      {!user ? (
        <Stack.Screen
          name="Auth"
          component={AuthStack}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AdDetail"
            component={AdDetailScreen}
            options={{
              title: 'Detail inzerátu',
              headerStyle: {
                backgroundColor: colors.white,
              },
              headerTintColor: colors.text.primary,
            }}
          />
          <Stack.Screen
            name="Ads"
            component={AdListScreen}
            options={{
              title: 'Inzeráty',
              headerStyle: {
                backgroundColor: colors.white,
              },
              headerTintColor: colors.text.primary,
            }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{
              title: 'Chat',
              headerStyle: {
                backgroundColor: colors.white,
              },
              headerTintColor: colors.text.primary,
            }}
          />
          <Stack.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{
              title: 'Obľúbené',
              headerStyle: {
                backgroundColor: colors.white,
              },
              headerTintColor: colors.text.primary,
            }}
          />
          <Stack.Screen
            name="Coins"
            component={CoinsScreen}
            options={{
              title: 'Mince',
              headerStyle: {
                backgroundColor: colors.white,
              },
              headerTintColor: colors.text.primary,
            }}
          />
          <Stack.Screen
            name="EditAd"
            component={EditAdScreen}
            options={{
              title: 'Upraviť inzerát',
              headerStyle: {
                backgroundColor: colors.white,
              },
              headerTintColor: colors.text.primary,
            }}
          />
          <Stack.Screen
            name="BoostAd"
            component={BoostAdScreen}
            options={{
              title: 'TOP-ovať inzerát',
              headerStyle: {
                backgroundColor: colors.white,
              },
              headerTintColor: colors.text.primary,
            }}
          />
          <Stack.Screen
            name="MyAds"
            component={MyAdsScreen}
            options={{
              title: 'Moje inzeráty',
              headerStyle: {
                backgroundColor: colors.white,
              },
              headerTintColor: colors.text.primary,
            }}
          />
          <Stack.Screen
            name="ViewProfile"
            component={ProfileScreen}
            options={{
              title: 'Profil používateľa',
              headerStyle: {
                backgroundColor: colors.white,
              },
              headerTintColor: colors.text.primary,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    if (navigationRef.current) {
      const cleanup = setupNotificationListeners(navigationRef.current);
      return cleanup;
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SafeAreaView style={styles.safeArea}>
          <NavigationContainer ref={navigationRef}>
            <AppNavigator />
            <StatusBar style="dark" />
          </NavigationContainer>
        </SafeAreaView>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.emerald[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

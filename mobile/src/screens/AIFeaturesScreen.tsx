import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import {
  Sparkles,
  MessageSquare,
  Camera,
  TrendingUp,
  Award,
  Search,
  Target,
  Shield,
  Zap,
  BarChart3,
  Bell,
  Eye,
  Lightbulb,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface Feature {
  id: string;
  icon: any;
  title: string;
  description: string;
  color: string;
  benefits: string[];
  available: boolean;
}

export default function AIFeaturesScreen({ navigation }: any) {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('overview');

  const features: Feature[] = [
    {
      id: 'chat',
      icon: MessageSquare,
      title: 'AI Chat Asistent',
      description: '24/7 inteligentný asistent pre odpovede',
      color: '#3B82F6',
      benefits: ['Okamžité odpovede', 'Kontextové rady', 'Slovenský jazyk'],
      available: true,
    },
    {
      id: 'quality',
      icon: Award,
      title: 'Hodnotenie kvality',
      description: 'AI hodnotí kvalitu vašich inzerátov',
      color: '#10B981',
      benefits: ['Skóre 0-100', 'Návrhy na zlepšenie', 'Detailná analýza'],
      available: true,
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Trhová analytika',
      description: 'Inteligentné insights o trhu',
      color: '#F59E0B',
      benefits: ['Cenové trendy', 'Populárne kategórie', 'AI insights'],
      available: true,
    },
    {
      id: 'performance',
      icon: Target,
      title: 'Výkonnostné insights',
      description: 'Personalizované odporúčania',
      color: '#EF4444',
      benefits: ['Analýza výkonu', 'AI odporúčania', 'Optimalizácia'],
      available: true,
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Smart notifikácie',
      description: 'AI prioritizované upozornenia',
      color: '#F59E0B',
      benefits: ['Automatická priorita', 'Filtrovanie', 'Reálny čas'],
      available: true,
    },
    {
      id: 'price',
      icon: TrendingUp,
      title: 'Cenové odporúčania',
      description: 'AI navrhne optimálnu cenu',
      color: '#10B981',
      benefits: ['Trhová analýza', 'Konkurenčné ceny', 'Maximalizácia'],
      available: true,
    },
    {
      id: 'fraud',
      icon: Shield,
      title: 'Detekcia podvodov',
      description: 'Automatická ochrana',
      color: '#6366F1',
      benefits: ['AI bezpečnosť', 'Okamžitá detekcia', '99% presnosť'],
      available: true,
    },
    {
      id: 'description',
      icon: Lightbulb,
      title: 'Generovanie popisov',
      description: 'AI vytvorí profesionálny popis',
      color: '#EC4899',
      benefits: ['3-krokový wizard', 'SEO optimalizácia', 'Profesionálny štýl'],
      available: true,
    },
  ];

  const FeatureCard = ({ feature }: { feature: Feature }) => {
    const IconComponent = feature.icon;

    return (
      <TouchableOpacity
        style={styles.featureCard}
        onPress={() => {
          if (feature.available) {
            // Navigate to specific feature
          }
        }}
      >
        <View style={[styles.iconContainer, { backgroundColor: feature.color }]}>
          <IconComponent color="#FFFFFF" size={24} />
        </View>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
        <View style={styles.benefitsContainer}>
          {feature.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <View style={styles.benefitDot} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
        {feature.available && (
          <View style={styles.availableBadge}>
            <Text style={styles.availableText}>Dostupné</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBadge}>
            <Sparkles color="#10B981" size={20} />
            <Text style={styles.headerBadgeText}>Powered by Google Gemini AI</Text>
          </View>
          <Text style={styles.headerTitle}>AI Funkcie</Text>
          <Text style={styles.headerSubtitle}>
            Najmodernejšie AI funkcie pre váš marketplace
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#10B981' }]}>
            <Text style={styles.statNumber}>15+</Text>
            <Text style={styles.statLabel}>AI Funkcií</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#3B82F6' }]}>
            <Text style={styles.statNumber}>99%</Text>
            <Text style={styles.statLabel}>Presnosť</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F59E0B' }]}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Dostupnosť</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
            onPress={() => setSelectedTab('overview')}
          >
            <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
              Prehľad
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'benefits' && styles.activeTab]}
            onPress={() => setSelectedTab('benefits')}
          >
            <Text style={[styles.tabText, selectedTab === 'benefits' && styles.activeTabText]}>
              Výhody
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {selectedTab === 'overview' ? (
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </View>
        ) : (
          <View style={styles.benefitsSection}>
            <View style={styles.benefitCard}>
              <Zap color="#10B981" size={32} />
              <Text style={styles.benefitCardTitle}>Ušetrite čas</Text>
              <Text style={styles.benefitCardText}>
                AI automatizuje časovo náročné úlohy a zvyšuje produktivitu
              </Text>
            </View>
            <View style={styles.benefitCard}>
              <TrendingUp color="#10B981" size={32} />
              <Text style={styles.benefitCardTitle}>Predávajte viac</Text>
              <Text style={styles.benefitCardText}>
                Optimalizované inzeráty = vyššia konverzia a rýchlejší predaj
              </Text>
            </View>
            <View style={styles.benefitCard}>
              <Target color="#10B981" size={32} />
              <Text style={styles.benefitCardTitle}>Lepšie rozhodnutia</Text>
              <Text style={styles.benefitCardText}>
                Data-driven insights pre úspešný predaj a správne ceny
              </Text>
            </View>
            <View style={styles.benefitCard}>
              <Shield color="#10B981" size={32} />
              <Text style={styles.benefitCardTitle}>Bezpečnosť</Text>
              <Text style={styles.benefitCardText}>
                Automatická ochrana pred podvodmi a podozrivými inzerátmi
              </Text>
            </View>
          </View>
        )}

        {/* CTA */}
        {!user && (
          <View style={styles.ctaContainer}>
            <View style={styles.ctaCard}>
              <Text style={styles.ctaTitle}>Začnite využívať AI funkcie</Text>
              <Text style={styles.ctaText}>
                Prihláste sa a získajte prístup k pokročilým AI nástrojom zadarmo
              </Text>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Sparkles color="#FFFFFF" size={20} />
                <Text style={styles.ctaButtonText}>Prihlásiť sa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  headerBadgeText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  featuresGrid: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 40,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  benefitsContainer: {
    gap: 8,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  benefitText: {
    fontSize: 12,
    color: '#374151',
  },
  availableBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  availableText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  benefitsSection: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 40,
  },
  benefitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitCardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  benefitCardText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  ctaContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  ctaCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

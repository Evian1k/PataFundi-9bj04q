import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList, TextInput, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadow } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { FundiCard } from '@/components/feature/FundiCard';
import { useAuth } from '@/hooks/useAuth';
import { fundiService } from '@/services/fundiService';
import { jobService } from '@/services/jobService';
import { SERVICE_CATEGORIES, APP_CONFIG } from '@/constants/config';
import { Fundi, Job } from '@/types';

const { width } = Dimensions.get('window');

export default function CustomerHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [nearbyFundis, setNearbyFundis] = useState<Fundi[]>([]);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.id) return;
    const fundiRes = await fundiService.getAllFundis();
    if (fundiRes.success && fundiRes.data) setNearbyFundis(fundiRes.data.slice(0, 5));

    const jobRes = await jobService.getCustomerJobs(user.id);
    if (jobRes.success && jobRes.data) {
      const active = jobRes.data.find(j => ['matching', 'fundi_assigned', 'fundi_accepted', 'on_the_way', 'arrived', 'in_progress'].includes(j.status));
      setActiveJob(active || null);
    }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const filteredCategories = search
    ? SERVICE_CATEGORIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : SERVICE_CATEGORIES;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={14} color={Colors.brand.primary} />
            <Text style={styles.locationText}>Westlands, Nairobi</Text>
            <MaterialIcons name="keyboard-arrow-down" size={16} color={Colors.text.secondary} />
          </View>
          <Text style={styles.greeting}>{getGreeting()}, {user?.firstName || 'there'} 👋</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={() => router.push('/(customer)/notifications')} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="notifications-none" size={24} color={Colors.text.primary} />
            <View style={styles.notifBadge} />
          </Pressable>
          <Avatar name={`${user?.firstName} ${user?.lastName}`} size={40} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={Colors.text.secondary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search services..."
            placeholderTextColor={Colors.text.muted}
            style={styles.searchInput}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')}>
              <MaterialIcons name="close" size={18} color={Colors.text.secondary} />
            </Pressable>
          ) : null}
        </View>

        {/* Active Job Banner */}
        {activeJob ? (
          <Pressable onPress={() => router.push({ pathname: '/(customer)/job-tracking', params: { jobId: activeJob.id } })} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
            <GlassCard variant="elevated" style={styles.activeJobCard}>
              <View style={styles.activeJobHeader}>
                <Badge label="Active Job" variant="warning" icon="work" />
                <Badge label={activeJob.status.replace(/_/g, ' ')} variant="warning" size="sm" />
              </View>
              <Text style={styles.activeJobTitle}>{activeJob.title}</Text>
              {activeJob.fundi ? (
                <View style={styles.activeFundiRow}>
                  <Avatar name={`${activeJob.fundi.firstName} ${activeJob.fundi.lastName}`} size={32} isVerified={activeJob.fundi.isVerified} />
                  <Text style={styles.activeFundiName}>{activeJob.fundi.firstName} is working on your job</Text>
                  <Pressable style={styles.chatBtn}>
                    <MaterialIcons name="chat" size={18} color={Colors.brand.primary} />
                  </Pressable>
                </View>
              ) : null}
              <View style={styles.activeJobFooter}>
                <Text style={styles.tapToView}>Tap to view progress →</Text>
              </View>
            </GlassCard>
          </Pressable>
        ) : null}

        {/* Emergency Support */}
        <Pressable style={({ pressed }) => [styles.emergencyBtn, { opacity: pressed ? 0.9 : 1 }]}>
          <MaterialIcons name="emergency" size={18} color={Colors.semantic.error} />
          <Text style={styles.emergencyText}>Emergency Support — Available 24/7</Text>
          <MaterialIcons name="chevron-right" size={18} color={Colors.semantic.error} />
        </Pressable>

        {/* Service Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>What do you need?</Text>
          <Pressable><Text style={styles.seeAll}>See all</Text></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {filteredCategories.map(cat => (
            <Pressable
              key={cat.id}
              onPress={() => { setSelectedCategory(cat.id); router.push({ pathname: '/(customer)/job-create', params: { category: cat.id } }); }}
              style={({ pressed }) => [styles.categoryCard, selectedCategory === cat.id && { borderColor: cat.color }, { opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
                <MaterialIcons name={cat.icon as any} size={26} color={cat.color} />
              </View>
              <Text style={styles.categoryName} numberOfLines={2}>{cat.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Request Button */}
        <Pressable
          onPress={() => router.push('/(customer)/job-create')}
          style={({ pressed }) => [styles.requestBtn, { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
        >
          <MaterialIcons name="add-circle" size={22} color="#FFF" />
          <Text style={styles.requestBtnText}>Request a Service Now</Text>
          <MaterialIcons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" />
        </Pressable>

        {/* Nearby Fundis */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Fundis</Text>
          <Pressable><Text style={styles.seeAll}>View all</Text></Pressable>
        </View>
        {nearbyFundis.map(fundi => (
          <FundiCard
            key={fundi.id}
            fundi={fundi}
            distance={Math.random() * 5 + 0.5}
            onPress={() => router.push({ pathname: '/(customer)/fundi-profile', params: { fundiId: fundi.id } })}
          />
        ))}

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Tips</Text>
        </View>
        <GlassCard style={styles.tipCard}>
          <MaterialIcons name="lightbulb" size={20} color={Colors.brand.secondary} />
          <Text style={styles.tipText}>Always check a Fundi&apos;s verification badge before confirming. Verified Fundis have passed our background check and skill assessment.</Text>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 12 },
  headerLeft: { flex: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 4 },
  locationText: { fontSize: 13, color: Colors.text.secondary, fontWeight: '500', includeFontPadding: false },
  greeting: { fontSize: 20, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { position: 'relative' },
  notifBadge: { position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.semantic.error },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.glass.medium,
    borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.glass.border,
    paddingHorizontal: 16, height: 50, gap: 10, marginBottom: 20,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text.primary, includeFontPadding: false },
  activeJobCard: { marginBottom: 16, borderColor: Colors.status.inProgress },
  activeJobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  activeJobTitle: { fontSize: 17, fontWeight: '700', color: Colors.text.primary, marginBottom: 12, includeFontPadding: false },
  activeFundiRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  activeFundiName: { flex: 1, fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  chatBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.glass.medium, alignItems: 'center', justifyContent: 'center' },
  activeJobFooter: {},
  tapToView: { fontSize: 13, color: Colors.brand.primary, fontWeight: '500', includeFontPadding: false },
  emergencyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.semantic.errorBg,
    borderRadius: Radius.lg, paddingVertical: 12, paddingHorizontal: 16,
    marginBottom: 24, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  emergencyText: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.semantic.error, includeFontPadding: false },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  seeAll: { fontSize: 13, color: Colors.brand.primary, fontWeight: '500', includeFontPadding: false },
  categoriesScroll: { paddingRight: 20, gap: 12, marginBottom: 24 },
  categoryCard: {
    width: 88, alignItems: 'center', padding: 12,
    backgroundColor: Colors.glass.medium,
    borderRadius: Radius.xl, borderWidth: 1.5, borderColor: Colors.glass.border,
    gap: 8,
  },
  categoryIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  categoryName: { fontSize: 11, fontWeight: '500', color: Colors.text.secondary, textAlign: 'center', includeFontPadding: false },
  requestBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.full, paddingVertical: 16, paddingHorizontal: 24,
    marginBottom: 28, gap: 10, ...Shadow.brand,
  },
  requestBtnText: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#FFF', includeFontPadding: false },
  tipCard: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 20 },
  tipText: { flex: 1, fontSize: 13, color: Colors.text.secondary, lineHeight: 20, includeFontPadding: false },
});

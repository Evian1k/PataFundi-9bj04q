// PataFundi — Customer Jobs Tab
// Shows all jobs: active, completed, cancelled with real data
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { jobService } from '@/services/jobService';
import { useAuth } from '@/hooks/useAuth';
import { APP_CONFIG, SERVICE_CATEGORIES } from '@/constants/config';
import { Job } from '@/types';

const STATUS_FILTERS = ['All', 'Active', 'Completed', 'Cancelled'];

const STATUS_BADGE_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' }> = {
  requested: { label: 'Requested', variant: 'info' },
  matching: { label: 'Matching', variant: 'warning' },
  fundi_assigned: { label: 'Fundi Found', variant: 'info' },
  fundi_accepted: { label: 'Fundi Accepted', variant: 'info' },
  on_the_way: { label: 'On The Way', variant: 'warning' },
  arrived: { label: 'Arrived', variant: 'warning' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
  customer_confirmed: { label: 'Confirmed', variant: 'success' },
  payment_processing: { label: 'Payment...', variant: 'warning' },
  payment_complete: { label: 'Paid', variant: 'success' },
  reviewed: { label: 'Reviewed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'error' },
  disputed: { label: 'Disputed', variant: 'error' },
};

const ACTIVE_STATUSES = ['requested', 'matching', 'fundi_assigned', 'fundi_accepted', 'on_the_way', 'arrived', 'in_progress', 'payment_processing'];
const COMPLETED_STATUSES = ['completed', 'customer_confirmed', 'payment_complete', 'reviewed'];

export default function CustomerJobsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadJobs();
  }, [user?.id]);

  const loadJobs = async () => {
    if (!user?.id) return;
    setLoading(true);
    const res = await jobService.getCustomerJobs(user.id);
    setLoading(false);
    if (res.success && res.data) setJobs(res.data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  const filteredJobs = jobs.filter(j => {
    if (filter === 'All') return true;
    if (filter === 'Active') return ACTIVE_STATUSES.includes(j.status);
    if (filter === 'Completed') return COMPLETED_STATUSES.includes(j.status);
    if (filter === 'Cancelled') return j.status === 'cancelled' || j.status === 'disputed';
    return true;
  });

  const getCategoryIcon = (catId: string) => SERVICE_CATEGORIES.find(c => c.id === catId)?.icon || 'build';
  const getCategoryColor = (catId: string) => SERVICE_CATEGORIES.find(c => c.id === catId)?.color || Colors.brand.primary;

  const renderJob = ({ item }: { item: Job }) => {
    const badgeInfo = STATUS_BADGE_MAP[item.status] || { label: item.status, variant: 'neutral' as const };
    const isActive = ACTIVE_STATUSES.includes(item.status);
    const catColor = getCategoryColor(item.serviceCategory);
    const catIcon = getCategoryIcon(item.serviceCategory);

    return (
      <Pressable
        onPress={() => isActive
          ? router.push({ pathname: '/(customer)/job-tracking', params: { jobId: item.id } })
          : undefined
        }
        style={({ pressed }) => [{ opacity: pressed && isActive ? 0.9 : 1 }]}
      >
        <GlassCard style={[styles.jobCard, isActive && { borderColor: catColor, borderWidth: 1.5 }]}>
          <View style={styles.jobHeader}>
            <View style={[styles.catIcon, { backgroundColor: `${catColor}20` }]}>
              <MaterialIcons name={catIcon as any} size={20} color={catColor} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.jobCategory}>{item.serviceCategory.charAt(0).toUpperCase() + item.serviceCategory.slice(1)}</Text>
            </View>
            <Badge label={badgeInfo.label} variant={badgeInfo.variant} size="sm" />
          </View>

          <View style={styles.jobMeta}>
            <View style={styles.metaItem}>
              <MaterialIcons name="place" size={12} color={Colors.text.muted} />
              <Text style={styles.metaText} numberOfLines={1}>{item.location.area || item.location.city || 'Nairobi'}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="access-time" size={12} color={Colors.text.muted} />
              <Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            {(item.agreedPrice || item.estimatedPrice?.estimatedTotal) ? (
              <View style={styles.metaItem}>
                <MaterialIcons name="payments" size={12} color={Colors.brand.accent} />
                <Text style={[styles.metaText, { color: Colors.brand.accent }]}>
                  {APP_CONFIG.currencySymbol} {(item.agreedPrice || item.estimatedPrice.estimatedTotal || 0).toLocaleString()}
                </Text>
              </View>
            ) : null}
          </View>

          {isActive && (
            <View style={styles.activeFooter}>
              <Text style={styles.tapToTrack}>Tap to track →</Text>
            </View>
          )}
        </GlassCard>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Jobs</Text>
        <Pressable onPress={() => router.push('/(customer)/job-create')} style={styles.newJobBtn}>
          <MaterialIcons name="add" size={18} color="#FFF" />
          <Text style={styles.newJobText}>New</Text>
        </Pressable>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map(f => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.filterChipActive]}>
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map(i => <SkeletonLoader key={i} width="100%" height={110} style={{ marginBottom: 12, borderRadius: 16 }} />)}
        </View>
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon="work-outline"
          title={filter === 'All' ? 'No Jobs Yet' : `No ${filter} Jobs`}
          message={filter === 'All' ? 'Request your first service to get started.' : `You have no ${filter.toLowerCase()} jobs.`}
          action={{ label: 'Request Service', onPress: () => router.push('/(customer)/job-create') }}
        />
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={item => item.id}
          renderItem={renderJob}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text.primary, includeFontPadding: false },
  newJobBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.brand.primary, borderRadius: Radius.full, paddingVertical: 8, paddingHorizontal: 14 },
  newJobText: { fontSize: 13, fontWeight: '700', color: '#FFF', includeFontPadding: false },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.glass.medium, borderWidth: 1, borderColor: Colors.glass.border },
  filterChipActive: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
  filterChipText: { fontSize: 13, fontWeight: '500', color: Colors.text.secondary, includeFontPadding: false },
  filterChipTextActive: { color: '#FFF' },
  skeletonContainer: { paddingHorizontal: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  jobCard: { marginBottom: 12 },
  jobHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  catIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  jobTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  jobCategory: { fontSize: 12, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  jobMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.text.secondary, includeFontPadding: false },
  activeFooter: { marginTop: 12, borderTopWidth: 1, borderTopColor: Colors.glass.borderLight, paddingTop: 10 },
  tapToTrack: { fontSize: 12, color: Colors.brand.primary, fontWeight: '500', includeFontPadding: false },
});

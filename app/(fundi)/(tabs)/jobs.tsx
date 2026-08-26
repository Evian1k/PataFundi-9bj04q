// PataFundi — Fundi Jobs Tab (real Supabase data)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { jobService } from '@/services/jobService';
import { useAuth } from '@/hooks/useAuth';
import { APP_CONFIG, SERVICE_CATEGORIES } from '@/constants/config';
import { Job } from '@/types';

const ACTIVE_STATUSES = ['fundi_accepted', 'on_the_way', 'arrived', 'in_progress'];

export default function FundiJobsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => { loadJobs(); }, [user?.id]);

  const loadJobs = async () => {
    if (!user?.id) return;
    setLoading(true);
    const res = await jobService.getFundiJobs(user.id);
    setLoading(false);
    if (res.success && res.data) setJobs(res.data);
  };

  const onRefresh = async () => { setRefreshing(true); await loadJobs(); setRefreshing(false); };

  const filtered = jobs.filter(j => {
    if (filter === 'All') return true;
    if (filter === 'Active') return ACTIVE_STATUSES.includes(j.status);
    if (filter === 'Completed') return ['completed','customer_confirmed','payment_complete','reviewed'].includes(j.status);
    return true;
  });

  const getCatColor = (cat: string) => SERVICE_CATEGORIES.find(c => c.id === cat)?.color || Colors.brand.primary;
  const getCatIcon = (cat: string) => SERVICE_CATEGORIES.find(c => c.id === cat)?.icon || 'build';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>My Jobs</Text>
      <View style={styles.filterRow}>
        {['All','Active','Completed'].map(f => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipActive]}>
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </View>
      {loading ? (
        <View style={{ paddingHorizontal: 20 }}>
          {[1,2,3].map(i => <SkeletonLoader key={i} width="100%" height={100} style={{ borderRadius: 16, marginBottom: 12 }} />)}
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState icon="work-outline" title="No Jobs" message="Your assigned jobs will appear here." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />}
          renderItem={({ item }) => {
            const isActive = ACTIVE_STATUSES.includes(item.status);
            const catColor = getCatColor(item.serviceCategory);
            return (
              <Pressable onPress={() => isActive ? router.push({ pathname: '/(fundi)/active-job', params: { jobId: item.id } }) : undefined}>
                <GlassCard style={[styles.jobCard, isActive && { borderColor: catColor, borderWidth: 1.5 }]}>
                  <View style={styles.jobRow}>
                    <View style={[styles.catIcon, { backgroundColor: `${catColor}20` }]}>
                      <MaterialIcons name={getCatIcon(item.serviceCategory) as any} size={20} color={catColor} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.jobArea}>{item.location.area || item.location.city}</Text>
                    </View>
                    <Badge label={item.status.replace(/_/g,' ')} variant={isActive ? 'warning' : 'success'} size="sm" />
                  </View>
                  <View style={styles.jobMeta}>
                    <Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    {item.agreedPrice && <Text style={[styles.metaText, { color: Colors.brand.accent }]}>{APP_CONFIG.currencySymbol} {item.agreedPrice.toLocaleString()}</Text>}
                    {isActive && <Text style={styles.tapText}>Tap to manage →</Text>}
                  </View>
                </GlassCard>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text.primary, paddingHorizontal: 20, paddingVertical: 14, includeFontPadding: false },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.glass.medium, borderWidth: 1, borderColor: Colors.glass.border },
  chipActive: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
  chipText: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  chipTextActive: { color: '#FFF', fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  jobCard: { marginBottom: 12 },
  jobRow: { flexDirection: 'row', alignItems: 'flex-start' },
  catIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  jobTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  jobArea: { fontSize: 12, color: Colors.text.muted, marginTop: 3, includeFontPadding: false },
  jobMeta: { flexDirection: 'row', gap: 16, marginTop: 12, borderTopWidth: 1, borderTopColor: Colors.glass.borderLight, paddingTop: 10 },
  metaText: { fontSize: 12, color: Colors.text.secondary, includeFontPadding: false },
  tapText: { fontSize: 12, color: Colors.brand.primary, fontWeight: '500', includeFontPadding: false },
});

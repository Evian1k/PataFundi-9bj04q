import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { JobCard } from '@/components/feature/JobCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { jobService } from '@/services/jobService';
import { useAuth } from '@/hooks/useAuth';
import { Job } from '@/types';

const FILTERS = ['All', 'Active', 'Completed', 'Cancelled'];

export default function CustomerJobsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    const res = await jobService.getCustomerJobs(user?.id || 'cust_001');
    if (res.success && res.data) setJobs(res.data);
    setLoading(false);
  };

  const filtered = jobs.filter(j => {
    if (filter === 'Active') return ['matching', 'fundi_assigned', 'fundi_accepted', 'on_the_way', 'arrived', 'in_progress'].includes(j.status);
    if (filter === 'Completed') return ['completed', 'customer_confirmed', 'payment_complete', 'reviewed'].includes(j.status);
    if (filter === 'Cancelled') return j.status === 'cancelled';
    return true;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Jobs</Text>
        <Button title="+ New" onPress={() => router.push('/(customer)/job-create')} size="sm" />
      </View>

      <View style={styles.filterBar}>
        {FILTERS.map(f => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <LoadingSpinner fullScreen message="Loading your jobs..." />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {filtered.length === 0 ? (
            <EmptyState
              icon="work-off"
              title="No jobs found"
              description={filter === 'All' ? "You haven't created any jobs yet. Request your first service!" : `No ${filter.toLowerCase()} jobs.`}
              actionLabel={filter === 'All' ? 'Request a Service' : undefined}
              onAction={filter === 'All' ? () => router.push('/(customer)/job-create') : undefined}
            />
          ) : (
            filtered.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onPress={() => router.push({ pathname: '/(customer)/job-tracking', params: { jobId: job.id } })}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text.primary, includeFontPadding: false },
  filterBar: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  filterChip: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: Radius.full,
    backgroundColor: Colors.glass.light, borderWidth: 1, borderColor: Colors.glass.border,
  },
  filterChipActive: { backgroundColor: 'rgba(14,165,233,0.2)', borderColor: Colors.brand.primary },
  filterText: { fontSize: 13, fontWeight: '500', color: Colors.text.secondary, includeFontPadding: false },
  filterTextActive: { color: Colors.brand.primary },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
});

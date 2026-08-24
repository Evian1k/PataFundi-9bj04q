import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { JobCard } from '@/components/feature/JobCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { jobService } from '@/services/jobService';
import { useAuth } from '@/hooks/useAuth';
import { Job } from '@/types';

const FILTERS = ['All', 'Active', 'Completed'];

export default function FundiJobsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    setLoading(true);
    jobService.getFundiJobs(user?.id || 'fundi_001').then(res => {
      if (res.success && res.data) setJobs(res.data);
      setLoading(false);
    });
  }, []);

  const filtered = jobs.filter(j => {
    if (filter === 'Active') return ['fundi_accepted', 'on_the_way', 'arrived', 'in_progress'].includes(j.status);
    if (filter === 'Completed') return ['completed', 'payment_complete', 'reviewed'].includes(j.status);
    return true;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>My Jobs</Text>
      <View style={styles.filterBar}>
        {FILTERS.map(f => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.filterActive]}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </View>
      {loading ? <LoadingSpinner fullScreen message="Loading jobs..." /> : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {filtered.length === 0
            ? <EmptyState icon="work-off" title="No jobs found" description={`No ${filter.toLowerCase()} jobs.`} />
            : filtered.map(job => (
              <JobCard key={job.id} job={job} variant="fundi" onPress={() => router.push('/(fundi)/active-job')} />
            ))
          }
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text.primary, paddingHorizontal: 20, paddingVertical: 16, includeFontPadding: false },
  filterBar: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  filterChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: Radius.full, backgroundColor: Colors.glass.light, borderWidth: 1, borderColor: Colors.glass.border },
  filterActive: { backgroundColor: 'rgba(20,184,166,0.2)', borderColor: Colors.brand.accent },
  filterText: { fontSize: 13, fontWeight: '500', color: Colors.text.secondary, includeFontPadding: false },
  filterTextActive: { color: Colors.brand.accent },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
});

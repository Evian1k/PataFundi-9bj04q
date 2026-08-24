import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { JobCard } from '@/components/feature/JobCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { jobService } from '@/services/jobService';
import { Job } from '@/types';

export default function AdminJobsScreen() {
  const insets = useSafeAreaInsets();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobService.getAllJobs().then(res => {
      if (res.success && res.data) setJobs(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>All Jobs</Text>
      <Text style={styles.subtitle}>{jobs.length} total jobs on platform</Text>
      {loading ? <LoadingSpinner fullScreen /> : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {jobs.map(job => <JobCard key={job.id} job={job} variant="admin" />)}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text.primary, paddingHorizontal: 20, paddingTop: 14, includeFontPadding: false },
  subtitle: { fontSize: 13, color: Colors.text.secondary, paddingHorizontal: 20, paddingBottom: 14, includeFontPadding: false },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
});

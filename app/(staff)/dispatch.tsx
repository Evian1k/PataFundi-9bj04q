import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { staffService } from '@/services/staffService';

export default function DispatchDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    staffService.getDispatchOverview().then(res => { if (res.success) setOverview(res.data); });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Dispatch Control</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {overview && (
          <View style={styles.statsGrid}>
            {[
              { label: 'Active Jobs', value: overview.activeJobs, icon: 'work', color: Colors.semantic.warning },
              { label: 'Pending Match', value: overview.pendingMatching, icon: 'search', color: Colors.brand.primary },
              { label: 'Online Fundis', value: overview.onlineFundis, icon: 'person', color: Colors.semantic.success },
              { label: 'Busy Fundis', value: overview.busyFundis, icon: 'build', color: Colors.semantic.warning },
            ].map(s => (
              <GlassCard key={s.label} style={styles.statCard}>
                <MaterialIcons name={s.icon as any} size={22} color={s.color} />
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </GlassCard>
            ))}
          </View>
        )}
        <GlassCard style={styles.mapPlaceholder}>
          <MaterialIcons name="map" size={40} color={Colors.text.muted} />
          <Text style={styles.mapText}>Live Dispatch Map</Text>
          <Text style={styles.mapSub}>Real-time Fundi and job locations — GPS required</Text>
        </GlassCard>
        {overview && (
          <GlassCard variant="elevated">
            <Text style={styles.metricTitle}>Avg Match Time</Text>
            <Text style={styles.metricValue}>{overview.avgMatchTime} min</Text>
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', includeFontPadding: false },
  placeholder: { width: 40 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: '47%', alignItems: 'center', gap: 6 },
  statValue: { fontSize: 24, fontWeight: '800', includeFontPadding: false },
  statLabel: { fontSize: 11, color: Colors.text.muted, textAlign: 'center', includeFontPadding: false },
  mapPlaceholder: { height: 200, alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16, backgroundColor: Colors.background.tertiary },
  mapText: { fontSize: 16, fontWeight: '600', color: Colors.text.secondary, includeFontPadding: false },
  mapSub: { fontSize: 12, color: Colors.text.muted, textAlign: 'center', includeFontPadding: false },
  metricTitle: { fontSize: 14, color: Colors.text.secondary, includeFontPadding: false },
  metricValue: { fontSize: 32, fontWeight: '800', color: Colors.brand.accent, marginTop: 4, includeFontPadding: false },
});

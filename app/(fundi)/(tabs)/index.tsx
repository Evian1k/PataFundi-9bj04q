import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { JobCard } from '@/components/feature/JobCard';
import { fundiService } from '@/services/fundiService';
import { jobService } from '@/services/jobService';
import { useAuth } from '@/hooks/useAuth';
import { APP_CONFIG } from '@/constants/config';
import { Job } from '@/types';

export default function FundiDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [earnings, setEarnings] = useState({ available: 12450, pending: 3200, thisMonth: 28750 });
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    // Real Supabase data
    fundiService.getFundiEarnings(user.id).then(res => {
      if (res.success && res.data) setEarnings(res.data as any);
    });
    jobService.getFundiJobs(user.id).then(res => {
      if (res.success && res.data) {
        const active = res.data.find(j => ['fundi_accepted', 'on_the_way', 'arrived', 'in_progress'].includes(j.status));
        setActiveJob(active || null);
      }
    });
    // Real-time: listen for new jobs assigned to this fundi
    const sub = jobService.subscribeToFundiJobs(user.id, (updatedJob) => {
      if (updatedJob.status === 'fundi_assigned') {
        router.push('/(fundi)/incoming-job');
      }
    });
    return () => { sub.unsubscribe(); };
  }, [user?.id]);

  const toggleOnline = async () => {
    const next = !isOnline;
    setIsOnline(next);
    await fundiService.toggleOnlineStatus(user?.id || '', next);
  };

  // Simulate an incoming job demo
  const demoIncomingJob = () => {
    router.push('/(fundi)/incoming-job');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Good morning, {user?.firstName || 'James'}</Text>
          <Badge label={isOnline ? 'Online' : 'Offline'} variant={isOnline ? 'success' : 'neutral'} icon={isOnline ? 'circle' : 'radio-button-unchecked'} />
        </View>
        <View style={styles.onlineToggle}>
          <Text style={styles.toggleLabel}>{isOnline ? 'Go Offline' : 'Go Online'}</Text>
          <Switch value={isOnline} onValueChange={toggleOnline} trackColor={{ false: Colors.glass.heavy, true: Colors.semantic.success }} thumbColor={isOnline ? '#FFF' : Colors.text.muted} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Earnings Summary */}
        <GlassCard variant="elevated" style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Available Earnings</Text>
          <Text style={styles.earningsAmount}>{APP_CONFIG.currencySymbol} {earnings.available.toLocaleString()}</Text>
          <View style={styles.earningsRow}>
            <View style={styles.earningsStat}>
              <Text style={styles.earningsStatVal}>{APP_CONFIG.currencySymbol} {earnings.pending.toLocaleString()}</Text>
              <Text style={styles.earningsStatLabel}>Pending</Text>
            </View>
            <View style={styles.earningsDivider} />
            <View style={styles.earningsStat}>
              <Text style={styles.earningsStatVal}>{APP_CONFIG.currencySymbol} {earnings.thisMonth.toLocaleString()}</Text>
              <Text style={styles.earningsStatLabel}>This Month</Text>
            </View>
          </View>
          <Pressable onPress={() => router.push('/(fundi)/(tabs)/earnings')} style={styles.payoutBtn}>
            <MaterialIcons name="account-balance-wallet" size={16} color={Colors.brand.accent} />
            <Text style={styles.payoutBtnText}>Request Payout</Text>
          </Pressable>
        </GlassCard>

        {/* Performance */}
        <View style={styles.statsRow}>
          {[
            { label: 'Rating', value: '4.8', icon: 'star', color: Colors.brand.secondary },
            { label: 'Jobs Done', value: '247', icon: 'check-circle', color: Colors.semantic.success },
            { label: 'Response', value: '98%', icon: 'speed', color: Colors.brand.primary },
          ].map(s => (
            <GlassCard key={s.label} style={styles.statCard}>
              <MaterialIcons name={s.icon as any} size={22} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Active Job */}
        {activeJob ? (
          <View>
            <Text style={styles.sectionTitle}>Active Job</Text>
            <JobCard job={activeJob} variant="fundi" onPress={() => router.push('/(fundi)/active-job')} />
          </View>
        ) : null}

        {/* Demo Incoming Job */}
        <GlassCard style={styles.demoCard}>
          <View style={styles.demoRow}>
            <MaterialIcons name="notifications-active" size={22} color={Colors.brand.secondary} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.demoTitle}>Simulate Incoming Job</Text>
              <Text style={styles.demoSub}>Test the incoming job experience</Text>
            </View>
            <Pressable onPress={demoIncomingJob} style={styles.demoBtnPressable}>
              <Text style={styles.demoBtnText}>Open</Text>
            </Pressable>
          </View>
        </GlassCard>

        {/* Status tips */}
        {!isOnline && (
          <GlassCard style={[styles.offlineBanner]}>
            <MaterialIcons name="wifi-off" size={20} color={Colors.semantic.warning} />
            <Text style={styles.offlineText}>You are offline. Toggle Online above to receive job requests.</Text>
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 14 },
  headerLeft: { gap: 6 },
  greeting: { fontSize: 20, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  onlineToggle: { alignItems: 'flex-end', gap: 4 },
  toggleLabel: { fontSize: 12, color: Colors.text.secondary, includeFontPadding: false },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  earningsCard: { marginBottom: 16 },
  earningsLabel: { fontSize: 13, color: Colors.text.secondary, marginBottom: 4, includeFontPadding: false },
  earningsAmount: { fontSize: 36, fontWeight: '800', color: Colors.brand.accent, marginBottom: 16, includeFontPadding: false },
  earningsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  earningsStat: { flex: 1, alignItems: 'center' },
  earningsStatVal: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  earningsStatLabel: { fontSize: 12, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  earningsDivider: { width: 1, height: 32, backgroundColor: Colors.glass.border },
  payoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, backgroundColor: 'rgba(20,184,166,0.15)', borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.brand.accent },
  payoutBtnText: { fontSize: 14, fontWeight: '600', color: Colors.brand.accent, includeFontPadding: false },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, alignItems: 'center', gap: 6 },
  statValue: { fontSize: 20, fontWeight: '800', includeFontPadding: false },
  statLabel: { fontSize: 11, color: Colors.text.muted, textAlign: 'center', includeFontPadding: false },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text.primary, marginBottom: 12, includeFontPadding: false },
  demoCard: { marginBottom: 14 },
  demoRow: { flexDirection: 'row', alignItems: 'center' },
  demoTitle: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, includeFontPadding: false },
  demoSub: { fontSize: 12, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  demoBtnPressable: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: Colors.brand.secondary, borderRadius: Radius.lg },
  demoBtnText: { fontSize: 13, fontWeight: '600', color: '#0A1628', includeFontPadding: false },
  offlineBanner: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: Colors.semantic.warningBg, borderColor: 'rgba(245,158,11,0.3)' },
  offlineText: { flex: 1, fontSize: 13, color: Colors.semantic.warning, includeFontPadding: false },
});

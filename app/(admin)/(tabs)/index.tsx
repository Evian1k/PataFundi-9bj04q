import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { adminService } from '@/services/adminService';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { APP_CONFIG } from '@/constants/config';
import { PlatformStats } from '@/types';

export default function AdminOverviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);

  useEffect(() => {
    adminService.getPlatformStats().then(res => { if (res.success) setStats(res.data || null); });
    adminService.getFraudAlerts().then(res => { if (res.success) setFraudAlerts(res.data?.slice(0, 3) || []); });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Badge label="SUPER ADMIN" variant="brand" size="sm" />
          <Text style={styles.headerTitle}>Platform Overview</Text>
        </View>
        <Pressable onPress={() => logout().then(() => router.replace('/auth/login'))} style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={20} color={Colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Revenue Card */}
        {stats && (
          <GlassCard variant="elevated" style={styles.revenueCard}>
            <Text style={styles.revenueLabel}>Monthly Revenue</Text>
            <Text style={styles.revenueAmount}>{APP_CONFIG.currencySymbol} {stats.monthlyRevenue.toLocaleString()}</Text>
            <Text style={styles.revenueSub}>Total: {APP_CONFIG.currencySymbol} {stats.totalRevenue.toLocaleString()}</Text>
          </GlassCard>
        )}

        {/* Key Stats */}
        {stats && (
          <View style={styles.statsGrid}>
            {[
              { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: 'people', color: Colors.brand.primary },
              { label: 'Active Fundis', value: stats.totalFundis.toLocaleString(), icon: 'build', color: Colors.brand.accent },
              { label: 'Active Jobs', value: stats.activeJobs.toString(), icon: 'work', color: Colors.semantic.warning },
              { label: 'Completed Jobs', value: stats.completedJobs.toLocaleString(), icon: 'check-circle', color: Colors.semantic.success },
              { label: 'Avg Job Value', value: `${APP_CONFIG.currencySymbol} ${stats.averageJobValue.toLocaleString()}`, icon: 'payments', color: Colors.brand.secondary },
              { label: 'Dispute Rate', value: `${(stats.disputeRate * 100).toFixed(1)}%`, icon: 'warning', color: Colors.semantic.error },
            ].map(s => (
              <GlassCard key={s.label} style={styles.statCard}>
                <MaterialIcons name={s.icon as any} size={20} color={s.color} />
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </GlassCard>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Management</Text>
        <View style={styles.actionsGrid}>
          {[
            { label: 'Payroll', icon: 'payments', route: '/(admin)/payroll', color: Colors.brand.secondary },
            { label: 'Disputes', icon: 'gavel', route: '/(admin)/disputes', color: Colors.semantic.error },
            { label: 'Audit Log', icon: 'history', route: '/(admin)/audit', color: Colors.role.admin },
            { label: 'Fraud Alerts', icon: 'security', route: null, color: Colors.semantic.warning },
          ].map(action => (
            <Pressable
              key={action.label}
              onPress={() => action.route ? router.push(action.route as any) : null}
              style={({ pressed }) => [styles.actionCard, { opacity: pressed ? 0.8 : 1 }]}
            >
              <MaterialIcons name={action.icon as any} size={28} color={action.color} />
              <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Fraud Alerts */}
        <Text style={styles.sectionTitle}>Active Fraud Alerts</Text>
        {fraudAlerts.map(alert => (
          <GlassCard key={alert.id} style={styles.fraudCard}>
            <View style={styles.fraudHeader}>
              <Badge label={alert.severity.toUpperCase()} variant={alert.severity === 'high' || alert.severity === 'critical' ? 'error' : 'warning'} size="sm" />
              <Text style={styles.fraudType}>{alert.type.replace(/_/g, ' ')}</Text>
            </View>
            <Text style={styles.fraudDesc}>{alert.description}</Text>
            <Text style={styles.fraudEntity}>Entity: {alert.entityId}</Text>
          </GlassCard>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text.primary, marginTop: 4, includeFontPadding: false },
  logoutBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  revenueCard: { marginBottom: 20, alignItems: 'center', padding: 24 },
  revenueLabel: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  revenueAmount: { fontSize: 38, fontWeight: '800', color: Colors.role.admin, marginTop: 4, includeFontPadding: false },
  revenueSub: { fontSize: 13, color: Colors.text.muted, marginTop: 4, includeFontPadding: false },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  statCard: { width: '47%', alignItems: 'center', gap: 6 },
  statValue: { fontSize: 18, fontWeight: '800', includeFontPadding: false },
  statLabel: { fontSize: 11, color: Colors.text.muted, textAlign: 'center', includeFontPadding: false },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text.primary, marginBottom: 14, includeFontPadding: false },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  actionCard: { width: '47%', backgroundColor: Colors.glass.medium, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.glass.border, padding: 20, alignItems: 'center', gap: 10 },
  actionLabel: { fontSize: 13, fontWeight: '700', textAlign: 'center', includeFontPadding: false },
  fraudCard: { marginBottom: 10 },
  fraudHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  fraudType: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, textTransform: 'capitalize', includeFontPadding: false },
  fraudDesc: { fontSize: 13, color: Colors.text.secondary, marginBottom: 6, includeFontPadding: false },
  fraudEntity: { fontSize: 12, color: Colors.text.muted, includeFontPadding: false },
});

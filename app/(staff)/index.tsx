// PataFundi — Staff Portal Router
// Detects staff role and routes to the correct dashboard
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { adminService } from '@/services/adminService';
import { useAuth } from '@/hooks/useAuth';

const ROLE_DASHBOARDS: Record<string, { label: string; color: string; icon: string; route: string; description: string }> = {
  support: { label: 'Support Portal', color: Colors.brand.primary, icon: 'headset-mic', route: '/(staff)/support', description: 'Tickets, user inquiries, conversations' },
  fraud: { label: 'Fraud & Risk', color: Colors.semantic.error, icon: 'security', route: '/(staff)/fraud', description: 'Alerts, investigations, risk signals' },
  finance: { label: 'Finance Portal', color: Colors.brand.accent, icon: 'account-balance', route: '/(staff)/finance', description: 'Payments, reconciliation, refunds' },
  dispatch: { label: 'Dispatch Center', color: Colors.semantic.warning, icon: 'map', route: '/(staff)/dispatch', description: 'Active jobs, Fundi availability' },
  devops: { label: 'DevOps & Systems', color: Colors.text.secondary, icon: 'monitor-heart', route: '/(staff)/devops', description: 'System health, logs, deployments' },
  operations: { label: 'Operations', color: Colors.brand.secondary, icon: 'admin-panel-settings', route: '/(staff)/support', description: 'Platform operations overview' },
  auditor: { label: 'Audit Portal', color: Colors.text.muted, icon: 'history', route: '/(staff)/devops', description: 'Read-only audit logs and reports' },
};

export default function StaffPortalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [stats, setStats] = React.useState<any>(null);

  const staffRole = (user as any)?.staffRole || 'support';
  const dashboardInfo = ROLE_DASHBOARDS[staffRole] || ROLE_DASHBOARDS.support;

  useEffect(() => {
    adminService.getDispatchOverview().then(res => {
      if (res.success) setStats(res.data);
    });
  }, []);

  const goToDashboard = () => {
    router.push(dashboardInfo.route as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Staff Portal</Text>
          <Text style={styles.subtitle}>PataFundi Internal System</Text>
        </View>
        <Pressable onPress={logout} style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={18} color={Colors.semantic.error} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Staff Identity */}
        <GlassCard variant="elevated" style={styles.identityCard}>
          <Avatar name={`${user?.firstName} ${user?.lastName}`} size={56} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.staffName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.staffEmail}>{user?.email}</Text>
            <View style={styles.roleBadgeRow}>
              <Badge label={staffRole.charAt(0).toUpperCase() + staffRole.slice(1)} variant="info" />
              <Badge label={(user as any)?.employeeId || 'EMP001'} variant="neutral" size="sm" />
            </View>
          </View>
        </GlassCard>

        {/* Your Dashboard */}
        <Text style={styles.sectionTitle}>Your Dashboard</Text>
        <Pressable onPress={goToDashboard} style={({ pressed }) => [styles.primaryDashCard, { borderColor: dashboardInfo.color, opacity: pressed ? 0.9 : 1 }]}>
          <View style={[styles.dashIcon, { backgroundColor: `${dashboardInfo.color}20` }]}>
            <MaterialIcons name={dashboardInfo.icon as any} size={32} color={dashboardInfo.color} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.dashLabel, { color: dashboardInfo.color }]}>{dashboardInfo.label}</Text>
            <Text style={styles.dashDesc}>{dashboardInfo.description}</Text>
          </View>
          <MaterialIcons name="arrow-forward-ios" size={16} color={dashboardInfo.color} />
        </Pressable>

        {/* Live Stats */}
        {stats && (
          <>
            <Text style={styles.sectionTitle}>Platform Status</Text>
            <View style={styles.statsGrid}>
              <GlassCard style={styles.statCard}>
                <MaterialIcons name="work" size={20} color={Colors.semantic.warning} />
                <Text style={styles.statValue}>{stats.activeJobs || 0}</Text>
                <Text style={styles.statLabel}>Active Jobs</Text>
              </GlassCard>
              <GlassCard style={styles.statCard}>
                <MaterialIcons name="pending" size={20} color={Colors.brand.primary} />
                <Text style={styles.statValue}>{stats.pendingMatching || 0}</Text>
                <Text style={styles.statLabel}>Matching</Text>
              </GlassCard>
              <GlassCard style={styles.statCard}>
                <MaterialIcons name="wifi" size={20} color={Colors.semantic.success} />
                <Text style={styles.statValue}>{stats.onlineFundis || 0}</Text>
                <Text style={styles.statLabel}>Online Fundis</Text>
              </GlassCard>
              <GlassCard style={styles.statCard}>
                <MaterialIcons name="access-time" size={20} color={Colors.brand.secondary} />
                <Text style={styles.statValue}>{(stats.avgMatchTime || 4.2).toFixed(1)}m</Text>
                <Text style={styles.statLabel}>Avg Match</Text>
              </GlassCard>
            </View>
          </>
        )}

        {/* Other allowed tools */}
        <Text style={styles.sectionTitle}>Tools Available</Text>
        {Object.entries(ROLE_DASHBOARDS)
          .filter(([role]) => role === staffRole)
          .map(([role, info]) => (
            <Pressable key={role} onPress={() => router.push(info.route as any)} style={({ pressed }) => [styles.toolCard, { opacity: pressed ? 0.85 : 1 }]}>
              <View style={[styles.toolIcon, { backgroundColor: `${info.color}20` }]}>
                <MaterialIcons name={info.icon as any} size={20} color={info.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.toolLabel}>{info.label}</Text>
                <Text style={styles.toolDesc}>{info.description}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={Colors.text.muted} />
            </Pressable>
          ))}

        <GlassCard style={styles.accessNote}>
          <MaterialIcons name="lock" size={16} color={Colors.semantic.warning} />
          <Text style={styles.accessNoteText}>You only have access to tools authorized for your role. Contact your supervisor for additional access.</Text>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 14 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text.primary, includeFontPadding: false },
  subtitle: { fontSize: 13, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  logoutBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.semantic.errorBg, borderRadius: 18 },
  content: { paddingHorizontal: 20, paddingBottom: 60 },
  identityCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  staffName: { fontSize: 17, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  staffEmail: { fontSize: 13, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  roleBadgeRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.primary, marginBottom: 14, includeFontPadding: false },
  primaryDashCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.glass.medium, borderRadius: Radius.xl, borderWidth: 2, padding: 18, marginBottom: 28 },
  dashIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  dashLabel: { fontSize: 16, fontWeight: '700', includeFontPadding: false },
  dashDesc: { fontSize: 13, color: Colors.text.muted, marginTop: 3, includeFontPadding: false },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28, justifyContent: 'space-between' },
  statCard: { width: '47%', alignItems: 'center', gap: 6 },
  statValue: { fontSize: 24, fontWeight: '800', color: Colors.text.primary, includeFontPadding: false },
  statLabel: { fontSize: 12, color: Colors.text.muted, includeFontPadding: false },
  toolCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.glass.medium, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.glass.border, padding: 14, marginBottom: 10 },
  toolIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  toolLabel: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, includeFontPadding: false },
  toolDesc: { fontSize: 12, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  accessNote: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 12 },
  accessNoteText: { flex: 1, fontSize: 12, color: Colors.text.secondary, lineHeight: 18, includeFontPadding: false },
});

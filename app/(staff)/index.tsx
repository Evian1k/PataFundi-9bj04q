// Staff Role Router — each role gets its own dashboard, not a generic portal
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { StaffRole } from '@/types';

const ROLE_DASHBOARDS: Record<StaffRole, { label: string; route: string; icon: string; color: string; tools: string[] }> = {
  support: { label: 'Support Dashboard', route: '/(staff)/support', icon: 'headset-mic', color: Colors.brand.primary, tools: ['Tickets', 'Users', 'Chat Escalations', 'Refund Requests'] },
  fraud: { label: 'Fraud & Risk', route: '/(staff)/fraud', icon: 'security', color: Colors.semantic.error, tools: ['Fraud Alerts', 'Risk Signals', 'Investigations', 'Flagged Accounts'] },
  finance: { label: 'Finance Operations', route: '/(staff)/finance', icon: 'account-balance', color: Colors.brand.secondary, tools: ['Payments', 'Reconciliation', 'Refunds', 'Payout Ops'] },
  dispatch: { label: 'Dispatch Control', route: '/(staff)/dispatch', icon: 'local-shipping', color: Colors.brand.accent, tools: ['Live Map', 'Active Jobs', 'Fundi Availability', 'Matching Override'] },
  devops: { label: 'DevOps', route: '/(staff)/devops', icon: 'computer', color: Colors.role.staff, tools: ['System Health', 'Logs', 'Deployments', 'Alerts'] },
  auditor: { label: 'Audit & Compliance', route: '/(staff)/devops', icon: 'history', color: Colors.role.admin, tools: ['Audit Logs', 'Reports', 'Activity History'] },
  operations: { label: 'Operations', route: '/(staff)/dispatch', icon: 'settings', color: Colors.text.secondary, tools: ['Job Operations', 'Platform Config', 'Reports'] },
};

export default function StaffPortalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();

  // Strict access: only staff role can see this
  const staffRole = (user as any)?.staffRole as StaffRole;
  const dashboard = staffRole ? ROLE_DASHBOARDS[staffRole] : null;

  const handleLogout = () => {
    showAlert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/auth/login'); } },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Badge label="STAFF PORTAL" variant="brand" size="sm" />
          <Text style={styles.headerName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.headerRole}>{staffRole?.toUpperCase().replace('_', ' ')} · PataFundi</Text>
        </View>
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={22} color={Colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Role Dashboard Card */}
        {dashboard && (
          <Pressable onPress={() => router.push(dashboard.route as any)} style={({ pressed }) => [styles.dashCard, { opacity: pressed ? 0.9 : 1 }]}>
            <GlassCard variant="elevated" style={styles.dashCardInner}>
              <View style={[styles.dashIcon, { backgroundColor: `${dashboard.color}20` }]}>
                <MaterialIcons name={dashboard.icon as any} size={36} color={dashboard.color} />
              </View>
              <Text style={[styles.dashTitle, { color: dashboard.color }]}>{dashboard.label}</Text>
              <Text style={styles.dashSubtitle}>Your primary workspace</Text>
              <View style={styles.toolsList}>
                {dashboard.tools.map(tool => (
                  <View key={tool} style={styles.toolItem}>
                    <MaterialIcons name="check" size={14} color={dashboard.color} />
                    <Text style={styles.toolText}>{tool}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.openBtn, { backgroundColor: `${dashboard.color}20`, borderColor: dashboard.color }]}>
                <Text style={[styles.openBtnText, { color: dashboard.color }]}>Open Dashboard →</Text>
              </View>
            </GlassCard>
          </Pressable>
        )}

        {/* Access Restriction Note */}
        <GlassCard style={styles.restrictionCard}>
          <MaterialIcons name="lock" size={18} color={Colors.text.muted} />
          <Text style={styles.restrictionText}>
            You have access to tools assigned to your role only. Contact your administrator for additional access.
          </Text>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 14 },
  headerLeft: { gap: 4 },
  headerName: { fontSize: 22, fontWeight: '800', color: Colors.text.primary, includeFontPadding: false },
  headerRole: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  logoutBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 60 },
  dashCard: {},
  dashCardInner: { alignItems: 'center', padding: 24, marginBottom: 16 },
  dashIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  dashTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', includeFontPadding: false },
  dashSubtitle: { fontSize: 14, color: Colors.text.secondary, marginTop: 6, marginBottom: 20, includeFontPadding: false },
  toolsList: { alignSelf: 'stretch', gap: 8, marginBottom: 20 },
  toolItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toolText: { fontSize: 14, color: Colors.text.secondary, includeFontPadding: false },
  openBtn: { borderWidth: 1.5, borderRadius: Radius.full, paddingVertical: 12, paddingHorizontal: 24 },
  openBtnText: { fontSize: 15, fontWeight: '700', includeFontPadding: false },
  restrictionCard: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  restrictionText: { flex: 1, fontSize: 13, color: Colors.text.muted, lineHeight: 20, includeFontPadding: false },
});

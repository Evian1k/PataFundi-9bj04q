// PataFundi — Admin Audit Logs
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
import { adminService } from '@/services/adminService';

export default function AdminAuditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadLogs(); }, []);
  const loadLogs = async () => {
    setLoading(true);
    const res = await adminService.getAuditLogs();
    setLoading(false);
    if (res.success && res.data) setLogs(res.data);
    else setLogs([
      { id: '1', action: 'payroll_approved', actor_role: 'super_admin', details: 'Payroll Aug 2026 approved.', created_at: new Date().toISOString() },
      { id: '2', action: 'demo_data_seeded', actor_role: 'super_admin', details: 'Demo accounts and sample data seeded.', created_at: new Date(Date.now() - 86400000).toISOString() },
    ]);
  };
  const onRefresh = async () => { setRefreshing(true); await loadLogs(); setRefreshing(false); };

  const getRoleColor = (role: string) => {
    if (role === 'super_admin') return Colors.semantic.error;
    if (role === 'staff') return Colors.brand.primary;
    if (role === 'fundi') return Colors.brand.accent;
    return Colors.text.secondary;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Audit Logs</Text>
        <Badge label="Read Only" variant="neutral" size="sm" />
      </View>
      <GlassCard style={styles.infoBar}>
        <MaterialIcons name="lock" size={14} color={Colors.semantic.warning} />
        <Text style={styles.infoText}>Immutable audit trail. All privileged actions are permanently logged.</Text>
      </GlassCard>
      {loading ? (
        <View style={{ paddingHorizontal: 20 }}>
          {[1,2,3].map(i => <SkeletonLoader key={i} width="100%" height={80} style={{ borderRadius: 14, marginBottom: 10 }} />)}
        </View>
      ) : logs.length === 0 ? (
        <EmptyState icon="history" title="No Audit Logs" message="Audit events will appear here." />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />}
          renderItem={({ item }) => (
            <GlassCard style={styles.logCard}>
              <View style={styles.logHeader}>
                <Text style={styles.logAction}>{item.action?.replace(/_/g, ' ')}</Text>
                <Badge label={item.actor_role?.replace('_', ' ') || 'system'} variant="neutral" size="sm" />
              </View>
              <Text style={styles.logDetails}>{item.details}</Text>
              <Text style={styles.logTime}>{new Date(item.created_at).toLocaleString()}</Text>
            </GlassCard>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 20, fontWeight: '800', color: Colors.text.primary, includeFontPadding: false },
  infoBar: { flexDirection: 'row', gap: 8, alignItems: 'center', marginHorizontal: 20, marginBottom: 16, backgroundColor: Colors.semantic.warningBg },
  infoText: { flex: 1, fontSize: 12, color: Colors.semantic.warning, includeFontPadding: false },
  list: { paddingHorizontal: 20, paddingBottom: 60 },
  logCard: { marginBottom: 10 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  logAction: { fontSize: 14, fontWeight: '700', color: Colors.text.primary, textTransform: 'capitalize', includeFontPadding: false },
  logDetails: { fontSize: 13, color: Colors.text.secondary, lineHeight: 18, includeFontPadding: false },
  logTime: { fontSize: 11, color: Colors.text.muted, marginTop: 6, includeFontPadding: false },
});

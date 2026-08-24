import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { adminService } from '@/services/adminService';

export default function AuditLogScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    adminService.getAuditLogs(50).then(res => { if (res.success && res.data) setLogs(res.data); });
  }, []);

  const actionColors: Record<string, string> = {
    payroll_approved: Colors.brand.secondary,
    user_suspended: Colors.semantic.error,
    dispute_resolved: Colors.semantic.success,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Audit Log</Text>
        <View style={styles.placeholder} />
      </View>
      <FlatList
        data={logs}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <GlassCard style={styles.logItem}>
            <View style={styles.logHeader}>
              <View style={[styles.actionDot, { backgroundColor: actionColors[item.action] || Colors.brand.primary }]} />
              <Text style={[styles.logAction, { color: actionColors[item.action] || Colors.brand.primary }]}>{item.action.replace(/_/g, ' ').toUpperCase()}</Text>
              <Text style={styles.logTime}>{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
            <Text style={styles.logDetails}>{item.details}</Text>
            <Text style={styles.logActor}>By: {item.actorId} ({item.actorRole})</Text>
            {item.ip && <Text style={styles.logIp}>IP: {item.ip}</Text>}
          </GlassCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 20, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', includeFontPadding: false },
  placeholder: { width: 40 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  logItem: { marginBottom: 10 },
  logHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  actionDot: { width: 8, height: 8, borderRadius: 4 },
  logAction: { flex: 1, fontSize: 12, fontWeight: '700', includeFontPadding: false },
  logTime: { fontSize: 11, color: Colors.text.muted, includeFontPadding: false },
  logDetails: { fontSize: 13, color: Colors.text.primary, marginBottom: 6, includeFontPadding: false },
  logActor: { fontSize: 12, color: Colors.text.secondary, includeFontPadding: false },
  logIp: { fontSize: 11, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
});

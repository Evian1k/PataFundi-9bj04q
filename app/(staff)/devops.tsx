import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { staffService } from '@/services/staffService';

export default function DevOpsDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    staffService.getSystemHealth().then(res => { if (res.success) setHealth(res.data); });
  }, []);

  const services = health ? [
    { name: 'API Gateway', ...health.api },
    { name: 'Database', ...health.db },
    { name: 'Payments', ...health.payments },
    { name: 'Matching Engine', ...health.matching },
    { name: 'Chat Service', ...health.chat },
  ] : [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>System Health</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {health && (
          <GlassCard variant="elevated" style={styles.uptimeCard}>
            <Text style={styles.uptimeLabel}>Platform Uptime</Text>
            <Text style={styles.uptimeValue}>{health.uptime}%</Text>
            <Badge label="All Systems Operational" variant="success" />
          </GlassCard>
        )}
        <Text style={styles.sectionTitle}>Service Status</Text>
        {services.map(svc => (
          <GlassCard key={svc.name} style={styles.serviceCard}>
            <View style={styles.serviceRow}>
              <View style={[styles.statusDot, { backgroundColor: svc.status === 'operational' ? Colors.semantic.success : Colors.semantic.error }]} />
              <Text style={styles.serviceName}>{svc.name}</Text>
              <Badge label={svc.status} variant={svc.status === 'operational' ? 'success' : 'error'} size="sm" />
              <Text style={styles.serviceLatency}>{svc.latency}ms</Text>
            </View>
          </GlassCard>
        ))}
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
  uptimeCard: { alignItems: 'center', gap: 10, marginBottom: 24, padding: 24 },
  uptimeLabel: { fontSize: 14, color: Colors.text.secondary, includeFontPadding: false },
  uptimeValue: { fontSize: 48, fontWeight: '800', color: Colors.semantic.success, includeFontPadding: false },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, marginBottom: 12, includeFontPadding: false },
  serviceCard: { marginBottom: 8 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  serviceName: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.text.primary, includeFontPadding: false },
  serviceLatency: { fontSize: 13, color: Colors.text.muted, fontWeight: '500', includeFontPadding: false },
});

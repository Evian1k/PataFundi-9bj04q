import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { staffService } from '@/services/staffService';

export default function SupportDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    staffService.getSupportTickets().then(res => { if (res.success && res.data) setTickets(res.data); });
  }, []);

  const priorityColors: Record<string, string> = { high: Colors.semantic.error, medium: Colors.semantic.warning, low: Colors.semantic.success };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Support Dashboard</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.statsRow}>
        {[{ label: 'Open', value: tickets.filter(t => t.status === 'open').length.toString(), color: Colors.semantic.error },
          { label: 'In Progress', value: tickets.filter(t => t.status === 'in_progress').length.toString(), color: Colors.semantic.warning },
          { label: 'Escalated', value: tickets.filter(t => t.status === 'escalated').length.toString(), color: Colors.role.admin }].map(s => (
          <GlassCard key={s.label} style={styles.statCard}>
            <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </GlassCard>
        ))}
      </View>
      <Text style={styles.sectionTitle}>Active Tickets</Text>
      <FlatList
        data={tickets}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <GlassCard style={styles.ticket}>
            <View style={styles.ticketHeader}>
              <Badge label={item.priority} variant={item.priority === 'high' ? 'error' : 'warning'} size="sm" />
              <Badge label={item.status} variant={item.status === 'open' ? 'error' : item.status === 'in_progress' ? 'warning' : 'brand'} size="sm" />
            </View>
            <Text style={styles.ticketSubject}>{item.subject}</Text>
            <Text style={styles.ticketMeta}>Customer: {item.customerId} {item.jobId ? `· Job: ${item.jobId}` : ''}</Text>
            <Text style={styles.ticketDate}>{new Date(item.createdAt).toLocaleString()}</Text>
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
  title: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', includeFontPadding: false },
  placeholder: { width: 40 },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 20 },
  statCard: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 24, fontWeight: '800', includeFontPadding: false },
  statLabel: { fontSize: 11, color: Colors.text.muted, includeFontPadding: false },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, paddingHorizontal: 20, marginBottom: 12, includeFontPadding: false },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  ticket: { marginBottom: 10 },
  ticketHeader: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  ticketSubject: { fontSize: 15, fontWeight: '600', color: Colors.text.primary, marginBottom: 4, includeFontPadding: false },
  ticketMeta: { fontSize: 12, color: Colors.text.secondary, marginBottom: 2, includeFontPadding: false },
  ticketDate: { fontSize: 11, color: Colors.text.muted, includeFontPadding: false },
});

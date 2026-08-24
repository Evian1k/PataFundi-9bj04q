import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { adminService } from '@/services/adminService';
import { APP_CONFIG } from '@/constants/config';

export default function AdminFinanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [revenue, setRevenue] = useState<any>(null);
  const [disputes, setDisputes] = useState<any[]>([]);

  useEffect(() => {
    adminService.getRevenueBreakdown('week').then(res => { if (res.success) setRevenue(res.data); });
    adminService.getDisputes().then(res => { if (res.success && res.data) setDisputes(res.data.slice(0, 3)); });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Financial Overview</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <GlassCard variant="elevated" style={styles.revenueCard}>
          <Text style={styles.cardTitle}>This Week Revenue</Text>
          {revenue && (
            <View style={styles.chartArea}>
              {revenue.revenue.map((v: number, i: number) => (
                <View key={i} style={styles.barCol}>
                  <View style={[styles.bar, { height: Math.max(20, (v / Math.max(...revenue.revenue)) * 100) }]} />
                  <Text style={styles.barLabel}>{revenue.labels[i]}</Text>
                </View>
              ))}
            </View>
          )}
        </GlassCard>

        <Pressable onPress={() => router.push('/(admin)/payroll')} style={({ pressed }) => [styles.payrollBtn, { opacity: pressed ? 0.85 : 1 }]}>
          <View style={styles.payrollLeft}>
            <MaterialIcons name="payments" size={26} color={Colors.brand.secondary} />
            <View>
              <Text style={styles.payrollTitle}>Staff Payroll</Text>
              <Text style={styles.payrollSub}>August 2026 — Pending Approval</Text>
            </View>
          </View>
          <Badge label="KSh 2.84M" variant="warning" />
          <MaterialIcons name="chevron-right" size={20} color={Colors.text.secondary} />
        </Pressable>

        <Text style={styles.sectionTitle}>Recent Disputes</Text>
        {disputes.map(d => (
          <GlassCard key={d.id} style={styles.disputeCard}>
            <View style={styles.disputeHeader}>
              <Badge label={d.status} variant={d.status === 'open' ? 'error' : 'warning'} size="sm" />
              <Text style={styles.disputeAmount}>{APP_CONFIG.currencySymbol} {d.amount.toLocaleString()}</Text>
            </View>
            <Text style={styles.disputeReason}>{d.reason}</Text>
            <Text style={styles.disputeJob}>Job #{d.jobId} · Customer {d.customerId}</Text>
          </GlassCard>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text.primary, paddingHorizontal: 20, paddingVertical: 14, includeFontPadding: false },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  revenueCard: { marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.primary, marginBottom: 20, includeFontPadding: false },
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 120 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  bar: { width: '100%', backgroundColor: Colors.role.admin, borderRadius: 4, opacity: 0.8 },
  barLabel: { fontSize: 10, color: Colors.text.muted, includeFontPadding: false },
  payrollBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.glass.medium, borderRadius: Radius.xl, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: Colors.glass.border },
  payrollLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  payrollTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  payrollSub: { fontSize: 12, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text.primary, marginBottom: 14, includeFontPadding: false },
  disputeCard: { marginBottom: 10 },
  disputeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  disputeAmount: { fontSize: 16, fontWeight: '700', color: Colors.semantic.error, includeFontPadding: false },
  disputeReason: { fontSize: 14, color: Colors.text.primary, marginBottom: 4, includeFontPadding: false },
  disputeJob: { fontSize: 12, color: Colors.text.muted, includeFontPadding: false },
});

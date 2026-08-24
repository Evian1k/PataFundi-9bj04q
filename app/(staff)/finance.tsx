import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { staffService } from '@/services/staffService';
import { APP_CONFIG } from '@/constants/config';

export default function FinanceDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [operations, setOperations] = useState<any[]>([]);

  useEffect(() => {
    staffService.getPaymentOperations().then(res => { if (res.success && res.data) setOperations(res.data); });
  }, []);

  const typeColors: Record<string, string> = {
    job_payment: Colors.semantic.success,
    fundi_payout: Colors.brand.accent,
    refund: Colors.semantic.error,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Finance Operations</Text>
        <View style={styles.placeholder} />
      </View>
      <FlatList
        data={operations}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View style={styles.statsRow}>
            {[
              { l: 'Payments', v: operations.filter(o => o.type === 'job_payment').length, c: Colors.semantic.success },
              { l: 'Payouts', v: operations.filter(o => o.type === 'fundi_payout').length, c: Colors.brand.accent },
              { l: 'Refunds', v: operations.filter(o => o.type === 'refund').length, c: Colors.semantic.error },
            ].map(s => (
              <GlassCard key={s.l} style={styles.statCard}>
                <Text style={[styles.statVal, { color: s.c }]}>{s.v}</Text>
                <Text style={styles.statLbl}>{s.l}</Text>
              </GlassCard>
            ))}
          </View>
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <GlassCard style={styles.opCard}>
            <View style={styles.opRow}>
              <View style={[styles.opIcon, { backgroundColor: `${typeColors[item.type]}15` }]}>
                <MaterialIcons name="payments" size={18} color={typeColors[item.type] || Colors.brand.primary} />
              </View>
              <View style={styles.opInfo}>
                <Text style={styles.opType}>{item.type.replace(/_/g, ' ').toUpperCase()}</Text>
                <Text style={styles.opDate}>{new Date(item.createdAt).toLocaleString()}</Text>
              </View>
              <View style={styles.opRight}>
                <Text style={[styles.opAmount, { color: typeColors[item.type] }]}>{APP_CONFIG.currencySymbol} {item.amount.toLocaleString()}</Text>
                <Badge label={item.status} variant={item.status === 'completed' ? 'success' : 'warning'} size="sm" />
              </View>
            </View>
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
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 16 },
  statCard: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 24, fontWeight: '800', includeFontPadding: false },
  statLbl: { fontSize: 11, color: Colors.text.muted, includeFontPadding: false },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  opCard: { marginBottom: 10 },
  opRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  opIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  opInfo: { flex: 1 },
  opType: { fontSize: 13, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  opDate: { fontSize: 11, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  opRight: { alignItems: 'flex-end', gap: 4 },
  opAmount: { fontSize: 16, fontWeight: '700', includeFontPadding: false },
});

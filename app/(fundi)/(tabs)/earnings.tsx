import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { fundiService } from '@/services/fundiService';
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { APP_CONFIG } from '@/constants/config';
import { FundiPayout } from '@/types';

export default function FundiEarningsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [earnings, setEarnings] = useState({ available: 12450, pending: 3200, thisMonth: 28750, lastMonth: 31200, totalPaid: 184500 });
  const [payouts, setPayouts] = useState<FundiPayout[]>([]);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    fundiService.getFundiEarnings(user?.id || 'fundi_001').then(res => {
      if (res.success && res.data) setEarnings(res.data);
    });
    paymentService.getFundiPayoutHistory(user?.id || 'fundi_001').then(res => {
      if (res.success && res.data) setPayouts(res.data);
    });
  }, []);

  const handlePayout = async () => {
    if (earnings.available < 500) {
      showAlert('Minimum Payout', 'Minimum payout amount is KSh 500.');
      return;
    }
    setRequesting(true);
    const res = await paymentService.requestFundiPayout(user?.id || 'fundi_001', earnings.available);
    setRequesting(false);
    if (res.success) {
      showAlert('Payout Requested', res.message || 'Processing within 24 hours.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Earnings</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Available Balance */}
        <GlassCard variant="elevated" style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available to Withdraw</Text>
          <Text style={styles.balanceAmount}>{APP_CONFIG.currencySymbol} {earnings.available.toLocaleString()}</Text>
          <Text style={styles.balanceNote}>Your eligible earnings. Payment processed securely.</Text>
          <Button title="Request Payout" onPress={handlePayout} loading={requesting} variant="success" fullWidth style={{ marginTop: 16 }} />
        </GlassCard>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Pending', value: earnings.pending, color: Colors.semantic.warning },
            { label: 'This Month', value: earnings.thisMonth, color: Colors.brand.primary },
            { label: 'Last Month', value: earnings.lastMonth, color: Colors.text.secondary },
            { label: 'Total Paid', value: earnings.totalPaid, color: Colors.semantic.success },
          ].map(s => (
            <GlassCard key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{APP_CONFIG.currencySymbol} {s.value.toLocaleString()}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Payout History */}
        <Text style={styles.sectionTitle}>Payout History</Text>
        {payouts.length === 0 ? (
          <GlassCard style={styles.emptyPayouts}>
            <Text style={styles.emptyText}>No payout history yet.</Text>
          </GlassCard>
        ) : (
          payouts.map(payout => (
            <GlassCard key={payout.id} style={styles.payoutCard}>
              <View style={styles.payoutRow}>
                <View style={styles.payoutIcon}>
                  <MaterialIcons name="account-balance-wallet" size={20} color={Colors.brand.accent} />
                </View>
                <View style={styles.payoutInfo}>
                  <Text style={styles.payoutAmount}>{APP_CONFIG.currencySymbol} {payout.amount.toLocaleString()}</Text>
                  <Text style={styles.payoutMethod}>{payout.bankDetails.bankName} · {payout.bankDetails.mpesaNumber || payout.bankDetails.accountNumber}</Text>
                  <Text style={styles.payoutDate}>{new Date(payout.requestedAt).toLocaleDateString()}</Text>
                </View>
                <Badge label={payout.status} variant={payout.status === 'paid' ? 'success' : payout.status === 'processing' ? 'warning' : 'neutral'} size="sm" />
              </View>
            </GlassCard>
          ))
        )}

        <GlassCard style={styles.infoCard}>
          <MaterialIcons name="info" size={18} color={Colors.brand.primary} />
          <Text style={styles.infoText}>Earnings are calculated after job completion confirmation. Processing takes up to 24 hours.</Text>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text.primary, paddingHorizontal: 20, paddingVertical: 16, includeFontPadding: false },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  balanceCard: { marginBottom: 20, alignItems: 'center' },
  balanceLabel: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  balanceAmount: { fontSize: 40, fontWeight: '800', color: Colors.brand.accent, marginTop: 4, includeFontPadding: false },
  balanceNote: { fontSize: 12, color: Colors.text.muted, textAlign: 'center', marginTop: 8, includeFontPadding: false },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  statCard: { width: '47%', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: '700', includeFontPadding: false },
  statLabel: { fontSize: 12, color: Colors.text.muted, includeFontPadding: false },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text.primary, marginBottom: 14, includeFontPadding: false },
  emptyPayouts: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 14, color: Colors.text.muted, includeFontPadding: false },
  payoutCard: { marginBottom: 10 },
  payoutRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  payoutIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(20,184,166,0.15)', alignItems: 'center', justifyContent: 'center' },
  payoutInfo: { flex: 1 },
  payoutAmount: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  payoutMethod: { fontSize: 12, color: Colors.text.secondary, marginTop: 2, includeFontPadding: false },
  payoutDate: { fontSize: 11, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  infoCard: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginTop: 8 },
  infoText: { flex: 1, fontSize: 13, color: Colors.text.secondary, lineHeight: 20, includeFontPadding: false },
});

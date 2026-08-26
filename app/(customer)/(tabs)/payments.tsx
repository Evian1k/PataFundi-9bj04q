// PataFundi — Customer Payments Tab
// Real payment history from Supabase
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
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/hooks/useAuth';
import { APP_CONFIG } from '@/constants/config';
import { Payment } from '@/types';

export default function CustomerPaymentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    loadPayments();
  }, [user?.id]);

  const loadPayments = async () => {
    if (!user?.id) return;
    setLoading(true);
    const res = await paymentService.getCustomerPaymentHistory(user.id);
    setLoading(false);
    if (res.success && res.data) {
      setPayments(res.data);
      const total = res.data.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
      setTotalSpent(total);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const getMethodIcon = (method: string) => {
    if (method === 'mpesa') return 'phone-android';
    if (method === 'card') return 'credit-card';
    return 'account-balance-wallet';
  };

  const getMethodColor = (method: string) => {
    if (method === 'mpesa') return '#00A651';
    if (method === 'card') return Colors.brand.primary;
    return Colors.brand.secondary;
  };

  const renderPayment = ({ item }: { item: Payment }) => (
    <GlassCard style={styles.paymentCard}>
      <View style={styles.paymentRow}>
        <View style={[styles.methodIcon, { backgroundColor: `${getMethodColor(item.method)}20` }]}>
          <MaterialIcons name={getMethodIcon(item.method) as any} size={20} color={getMethodColor(item.method)} />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentRef}>{item.reference || `REF-${item.id.slice(-6).toUpperCase()}`}</Text>
          <Text style={styles.paymentDate}>
            {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
            {' · '}{item.method.charAt(0).toUpperCase() + item.method.slice(1)}
          </Text>
        </View>
        <View style={styles.paymentRight}>
          <Text style={styles.paymentAmount}>{APP_CONFIG.currencySymbol} {item.amount.toLocaleString()}</Text>
          <Badge
            label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            variant={item.status === 'completed' ? 'success' : item.status === 'failed' ? 'error' : 'warning'}
            size="sm"
          />
        </View>
      </View>
    </GlassCard>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Payments</Text>

      {/* Summary */}
      <GlassCard variant="elevated" style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Spent</Text>
        <Text style={styles.summaryAmount}>{APP_CONFIG.currencySymbol} {totalSpent.toLocaleString()}</Text>
        <Text style={styles.summaryNote}>{payments.filter(p => p.status === 'completed').length} completed transactions</Text>
      </GlassCard>

      {/* Payments List */}
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Transaction History</Text>
          <Pressable onPress={() => router.push({ pathname: '/(customer)/payment-flow', params: { jobId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', amount: '4000' } })} style={styles.payNowBtn}>
            <Text style={styles.payNowText}>Pay Now</Text>
          </Pressable>
        </View>

        {loading ? (
          <>
            {[1, 2, 3].map(i => <SkeletonLoader key={i} width="100%" height={80} style={{ marginBottom: 10, borderRadius: 14 }} />)}
          </>
        ) : payments.length === 0 ? (
          <EmptyState icon="receipt" title="No Payments Yet" message="Your payment history will appear here after completing a job." />
        ) : (
          <FlatList
            data={payments}
            keyExtractor={item => item.id}
            renderItem={renderPayment}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text.primary, paddingHorizontal: 20, paddingVertical: 14, includeFontPadding: false },
  summaryCard: { marginHorizontal: 20, marginBottom: 20, alignItems: 'center' },
  summaryLabel: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  summaryAmount: { fontSize: 36, fontWeight: '800', color: Colors.brand.accent, marginTop: 6, includeFontPadding: false },
  summaryNote: { fontSize: 12, color: Colors.text.muted, marginTop: 6, includeFontPadding: false },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  listTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  payNowBtn: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: Colors.brand.primary, borderRadius: Radius.full },
  payNowText: { fontSize: 13, fontWeight: '600', color: '#FFF', includeFontPadding: false },
  paymentCard: { marginBottom: 10 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  methodIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  paymentInfo: { flex: 1 },
  paymentRef: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, includeFontPadding: false },
  paymentDate: { fontSize: 12, color: Colors.text.muted, marginTop: 3, includeFontPadding: false },
  paymentRight: { alignItems: 'flex-end', gap: 4 },
  paymentAmount: { fontSize: 16, fontWeight: '700', color: Colors.brand.accent, includeFontPadding: false },
});

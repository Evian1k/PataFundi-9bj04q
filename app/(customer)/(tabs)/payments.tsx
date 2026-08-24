import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/hooks/useAuth';
import { APP_CONFIG } from '@/constants/config';
import { Payment } from '@/types';

export default function CustomerPaymentsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    paymentService.getCustomerPaymentHistory(user?.id || 'cust_001').then(res => {
      if (res.success && res.data) setPayments(res.data);
    });
  }, []);

  const total = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

  const methodIcon: Record<string, string> = {
    mpesa: 'phone-android',
    card: 'credit-card',
    wallet: 'account-balance-wallet',
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Payments</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Summary */}
        <GlassCard variant="elevated" style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={styles.summaryAmount}>{APP_CONFIG.currencySymbol} {total.toLocaleString()}</Text>
          <Text style={styles.summaryNote}>{payments.length} transactions</Text>
        </GlassCard>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <GlassCard style={styles.methodCard}>
            <View style={styles.methodRow}>
              <View style={[styles.methodIcon, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                <MaterialIcons name="phone-android" size={22} color={Colors.semantic.success} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>M-Pesa</Text>
                <Text style={styles.methodDetail}>+254 712 *** 678</Text>
              </View>
              <Badge label="Default" variant="success" size="sm" />
            </View>
          </GlassCard>
          <Pressable style={styles.addMethod}>
            <MaterialIcons name="add" size={18} color={Colors.brand.primary} />
            <Text style={styles.addMethodText}>Add payment method</Text>
          </Pressable>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {payments.map(payment => (
            <GlassCard key={payment.id} style={styles.txCard}>
              <View style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: Colors.glass.heavy }]}>
                  <MaterialIcons name={(methodIcon[payment.method] || 'payment') as any} size={20} color={Colors.brand.primary} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txTitle}>Job Payment</Text>
                  <Text style={styles.txMeta}>{payment.method.toUpperCase()} · {payment.reference}</Text>
                  <Text style={styles.txDate}>{new Date(payment.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={styles.txAmountArea}>
                  <Text style={styles.txAmount}>-{APP_CONFIG.currencySymbol} {payment.amount.toLocaleString()}</Text>
                  <Badge label={payment.status} variant={payment.status === 'completed' ? 'success' : 'warning'} size="sm" />
                </View>
              </View>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text.primary, paddingHorizontal: 20, paddingVertical: 16, includeFontPadding: false },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  summaryCard: { marginBottom: 24, alignItems: 'center', padding: 24 },
  summaryLabel: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  summaryAmount: { fontSize: 36, fontWeight: '800', color: Colors.text.primary, marginTop: 4, includeFontPadding: false },
  summaryNote: { fontSize: 13, color: Colors.text.muted, marginTop: 4, includeFontPadding: false },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, marginBottom: 14, includeFontPadding: false },
  methodCard: { marginBottom: 10 },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  methodIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  methodInfo: { flex: 1 },
  methodName: { fontSize: 15, fontWeight: '600', color: Colors.text.primary, includeFontPadding: false },
  methodDetail: { fontSize: 13, color: Colors.text.secondary, marginTop: 2, includeFontPadding: false },
  addMethod: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 4 },
  addMethodText: { fontSize: 14, fontWeight: '500', color: Colors.brand.primary, includeFontPadding: false },
  txCard: { marginBottom: 10 },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  txIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, includeFontPadding: false },
  txMeta: { fontSize: 12, color: Colors.text.secondary, marginTop: 2, includeFontPadding: false },
  txDate: { fontSize: 11, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  txAmountArea: { alignItems: 'flex-end', gap: 4 },
  txAmount: { fontSize: 15, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
});

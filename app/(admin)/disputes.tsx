import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { adminService } from '@/services/adminService';
import { APP_CONFIG } from '@/constants/config';

export default function DisputesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [disputes, setDisputes] = useState<any[]>([]);

  useEffect(() => {
    adminService.getDisputes().then(res => { if (res.success && res.data) setDisputes(res.data); });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Disputes</Text>
        <View style={styles.placeholder} />
      </View>
      <FlatList
        data={disputes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <GlassCard style={styles.disputeCard}>
            <View style={styles.disputeHeader}>
              <Badge label={item.status} variant={item.status === 'open' ? 'error' : 'warning'} />
              <Text style={styles.disputeAmount}>{APP_CONFIG.currencySymbol} {item.amount.toLocaleString()}</Text>
            </View>
            <Text style={styles.disputeReason}>{item.reason}</Text>
            <Text style={styles.disputeParties}>Customer: {item.customerId} · Fundi: {item.fundiId}</Text>
            <Text style={styles.disputeDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            <View style={styles.actionRow}>
              <Pressable style={[styles.actionBtn, { backgroundColor: Colors.semantic.successBg }]}>
                <Text style={[styles.actionBtnText, { color: Colors.semantic.success }]}>Resolve — Approve</Text>
              </Pressable>
              <Pressable style={[styles.actionBtn, { backgroundColor: Colors.semantic.errorBg }]}>
                <Text style={[styles.actionBtnText, { color: Colors.semantic.error }]}>Resolve — Refund</Text>
              </Pressable>
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
  title: { flex: 1, fontSize: 20, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', includeFontPadding: false },
  placeholder: { width: 40 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  disputeCard: { marginBottom: 12 },
  disputeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  disputeAmount: { fontSize: 18, fontWeight: '800', color: Colors.semantic.error, includeFontPadding: false },
  disputeReason: { fontSize: 15, fontWeight: '600', color: Colors.text.primary, marginBottom: 6, includeFontPadding: false },
  disputeParties: { fontSize: 12, color: Colors.text.secondary, marginBottom: 4, includeFontPadding: false },
  disputeDate: { fontSize: 11, color: Colors.text.muted, marginBottom: 14, includeFontPadding: false },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.lg, alignItems: 'center' },
  actionBtnText: { fontSize: 13, fontWeight: '600', includeFontPadding: false },
});

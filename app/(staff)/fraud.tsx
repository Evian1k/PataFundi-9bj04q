import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { adminService } from '@/services/adminService';

export default function FraudDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    adminService.getFraudAlerts().then(res => { if (res.success && res.data) setAlerts(res.data); });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Fraud & Risk</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.alertBanner}>
        <MaterialIcons name="security" size={18} color={Colors.semantic.error} />
        <Text style={styles.alertBannerText}>{alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length} high-priority alerts require attention</Text>
      </View>
      <FlatList
        data={alerts}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <GlassCard style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Badge label={item.severity.toUpperCase()} variant={item.severity === 'high' || item.severity === 'critical' ? 'error' : 'warning'} />
              <Text style={styles.alertType}>{item.type.replace(/_/g, ' ')}</Text>
            </View>
            <Text style={styles.alertDesc}>{item.description}</Text>
            <Text style={styles.alertEntity}>Entity: {item.entityId}</Text>
            <View style={styles.alertActions}>
              <Pressable style={styles.investigateBtn}>
                <Text style={styles.investigateBtnText}>Investigate</Text>
              </Pressable>
              <Pressable style={styles.dismissBtn}>
                <Text style={styles.dismissBtnText}>Dismiss</Text>
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
  title: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', includeFontPadding: false },
  placeholder: { width: 40 },
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.semantic.errorBg, paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(239,68,68,0.3)', marginBottom: 16 },
  alertBannerText: { fontSize: 13, fontWeight: '600', color: Colors.semantic.error, flex: 1, includeFontPadding: false },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  alertCard: { marginBottom: 12 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  alertType: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.text.primary, textTransform: 'capitalize', includeFontPadding: false },
  alertDesc: { fontSize: 13, color: Colors.text.secondary, marginBottom: 6, includeFontPadding: false },
  alertEntity: { fontSize: 12, color: Colors.text.muted, marginBottom: 14, includeFontPadding: false },
  alertActions: { flexDirection: 'row', gap: 10 },
  investigateBtn: { flex: 1, paddingVertical: 10, backgroundColor: Colors.semantic.errorBg, borderRadius: Radius.lg, alignItems: 'center' },
  investigateBtnText: { fontSize: 13, fontWeight: '600', color: Colors.semantic.error, includeFontPadding: false },
  dismissBtn: { flex: 1, paddingVertical: 10, backgroundColor: Colors.glass.medium, borderRadius: Radius.lg, alignItems: 'center' },
  dismissBtnText: { fontSize: 13, fontWeight: '500', color: Colors.text.secondary, includeFontPadding: false },
});

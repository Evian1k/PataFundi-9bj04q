import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminService } from '@/services/adminService';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { APP_CONFIG } from '@/constants/config';
import { PayrollPeriod } from '@/types';

export default function PayrollScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [payrolls, setPayrolls] = useState<PayrollPeriod[]>([]);
  const [approvalStep, setApprovalStep] = useState(0);
  const [password, setPassword] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollPeriod | null>(null);

  useEffect(() => {
    adminService.getPayrollPeriods().then(res => {
      if (res.success && res.data) setPayrolls(res.data);
    });
  }, []);

  const pendingPayroll = payrolls.find(p => p.status === 'pending_approval');

  const handleApprovalFlow = (payroll: PayrollPeriod) => {
    setSelectedPayroll(payroll);
    setApprovalStep(1);
  };

  const executeApproval = async () => {
    if (!password || !securityCode) {
      showAlert('Required', 'Both password and security code are required.');
      return;
    }
    showAlert(
      'IRREVERSIBLE ACTION',
      `You are about to approve payroll for ${selectedPayroll?.totalStaff} staff members totalling ${APP_CONFIG.currencySymbol} ${selectedPayroll?.totalAmount.toLocaleString()}. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Execute',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const res = await adminService.approvePayroll({ payrollId: selectedPayroll!.id, adminId: user!.id, passwordConfirmation: password, securityCode });
            setLoading(false);
            if (res.success) {
              showAlert('Payroll Approved', `Payroll disbursement initiated. Audit ID: ${res.data?.auditId}`, [
                { text: 'OK', onPress: () => { setApprovalStep(0); router.back(); } },
              ]);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => approvalStep > 0 ? setApprovalStep(0) : router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Staff Payroll</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {approvalStep === 0 && (
          <>
            {pendingPayroll && (
              <GlassCard variant="elevated" style={styles.pendingCard}>
                <View style={styles.pendingHeader}>
                  <Badge label="PENDING APPROVAL" variant="warning" />
                  <MaterialIcons name="priority-high" size={20} color={Colors.semantic.warning} />
                </View>
                <Text style={styles.pendingPeriod}>August 2026 Payroll</Text>
                <Text style={styles.pendingAmount}>{APP_CONFIG.currencySymbol} {pendingPayroll.totalAmount.toLocaleString()}</Text>
                <Text style={styles.pendingDetails}>{pendingPayroll.totalStaff} staff members · Ready for review</Text>
                <GlassCard style={[styles.warningBox, { backgroundColor: Colors.semantic.errorBg }]}>
                  <MaterialIcons name="warning" size={18} color={Colors.semantic.error} />
                  <Text style={styles.warningText}>This action is irreversible. Funds will be immediately disbursed upon approval.</Text>
                </GlassCard>
                <Button title="Review & Approve Payroll" onPress={() => handleApprovalFlow(pendingPayroll)} variant="secondary" fullWidth style={{ marginTop: 16 }} />
              </GlassCard>
            )}

            <Text style={styles.sectionTitle}>Payroll History</Text>
            {payrolls.filter(p => p.status !== 'pending_approval').map(p => (
              <GlassCard key={p.id} style={styles.historyCard}>
                <View style={styles.historyRow}>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyPeriod}>{new Date(p.periodStart).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</Text>
                    <Text style={styles.historyStaff}>{p.totalStaff} staff</Text>
                    {p.approvedAt && <Text style={styles.historyDate}>Approved: {new Date(p.approvedAt).toLocaleDateString()}</Text>}
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyAmount}>{APP_CONFIG.currencySymbol} {p.totalAmount.toLocaleString()}</Text>
                    <Badge label={p.status} variant="success" size="sm" />
                  </View>
                </View>
              </GlassCard>
            ))}
          </>
        )}

        {approvalStep === 1 && selectedPayroll && (
          <>
            <GlassCard style={[styles.warningCard, { backgroundColor: Colors.semantic.errorBg, borderColor: Colors.semantic.error }]}>
              <MaterialIcons name="security" size={28} color={Colors.semantic.error} />
              <Text style={styles.warningCardTitle}>Security Verification Required</Text>
              <Text style={styles.warningCardText}>You are about to approve {APP_CONFIG.currencySymbol} {selectedPayroll.totalAmount.toLocaleString()} payroll for {selectedPayroll.totalStaff} staff members. This is an irreversible action that requires dual authentication.</Text>
            </GlassCard>

            <GlassCard style={styles.authCard}>
              <Text style={styles.authLabel}>Admin Password</Text>
              <TextInput value={password} onChangeText={setPassword} placeholder="Enter your admin password" placeholderTextColor={Colors.text.muted} secureTextEntry style={styles.authInput} />
            </GlassCard>

            <GlassCard style={styles.authCard}>
              <Text style={styles.authLabel}>Security Code</Text>
              <Text style={styles.authHint}>Enter the 6-digit code from your authenticator app</Text>
              <TextInput value={securityCode} onChangeText={setSecurityCode} placeholder="000000" keyboardType="number-pad" maxLength={6} placeholderTextColor={Colors.text.muted} style={[styles.authInput, { textAlign: 'center', fontSize: 24, letterSpacing: 8 }]} />
            </GlassCard>

            <Button title="Confirm Payroll Approval" onPress={executeApproval} loading={loading} variant="danger" fullWidth size="lg" style={{ marginTop: 16 }} />
            <Pressable onPress={() => setApprovalStep(0)} style={styles.cancelLink}>
              <Text style={styles.cancelLinkText}>Cancel</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: Colors.text.primary, textAlign: 'center', includeFontPadding: false },
  placeholder: { width: 40 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  pendingCard: { marginBottom: 24 },
  pendingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pendingPeriod: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  pendingAmount: { fontSize: 36, fontWeight: '800', color: Colors.brand.secondary, marginTop: 4, includeFontPadding: false },
  pendingDetails: { fontSize: 13, color: Colors.text.secondary, marginTop: 4, marginBottom: 16, includeFontPadding: false },
  warningBox: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  warningText: { flex: 1, fontSize: 13, color: Colors.semantic.error, lineHeight: 19, includeFontPadding: false },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text.primary, marginBottom: 14, includeFontPadding: false },
  historyCard: { marginBottom: 10 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  historyInfo: { gap: 3 },
  historyPeriod: { fontSize: 15, fontWeight: '600', color: Colors.text.primary, includeFontPadding: false },
  historyStaff: { fontSize: 12, color: Colors.text.secondary, includeFontPadding: false },
  historyDate: { fontSize: 11, color: Colors.text.muted, includeFontPadding: false },
  historyRight: { alignItems: 'flex-end', gap: 4 },
  historyAmount: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  warningCard: { borderWidth: 1.5, borderRadius: Radius.xl, padding: 20, marginBottom: 16, alignItems: 'center', gap: 12 },
  warningCardTitle: { fontSize: 18, fontWeight: '800', color: Colors.semantic.error, textAlign: 'center', includeFontPadding: false },
  warningCardText: { fontSize: 14, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22, includeFontPadding: false },
  authCard: { marginBottom: 14 },
  authLabel: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, marginBottom: 4, includeFontPadding: false },
  authHint: { fontSize: 12, color: Colors.text.muted, marginBottom: 10, includeFontPadding: false },
  authInput: { fontSize: 16, color: Colors.text.primary, paddingVertical: 10, borderBottomWidth: 1.5, borderBottomColor: Colors.brand.primary, includeFontPadding: false },
  cancelLink: { alignItems: 'center', paddingVertical: 16 },
  cancelLinkText: { fontSize: 14, color: Colors.text.secondary, includeFontPadding: false },
});

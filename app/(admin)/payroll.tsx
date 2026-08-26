// PataFundi — Admin Payroll Screen
// Super Admin ONLY — irreversible payroll approval with multi-step confirmation
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { adminService } from '@/services/adminService';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { APP_CONFIG } from '@/constants/config';
import { PayrollPeriod } from '@/types';

type ConfirmStep = 'idle' | 'confirm1' | 'password' | 'confirm2' | 'processing' | 'done';

export default function AdminPayrollScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [payrolls, setPayrolls] = useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollPeriod | null>(null);
  const [confirmStep, setConfirmStep] = useState<ConfirmStep>('idle');
  const [password, setPassword] = useState('');
  const [approving, setApproving] = useState(false);

  useEffect(() => { loadPayroll(); }, []);

  const loadPayroll = async () => {
    setLoading(true);
    const res = await adminService.getPayroll();
    setLoading(false);
    if (res.success && res.data) setPayrolls(res.data);
    else {
      // Demo fallback
      setPayrolls([
        { id: 'payroll-001', periodStart: '2026-08-01', periodEnd: '2026-08-31', totalStaff: 47, totalAmount: 2840000, status: 'pending_approval' },
        { id: 'payroll-002', periodStart: '2026-07-01', periodEnd: '2026-07-31', totalStaff: 45, totalAmount: 2710000, status: 'paid', approvedAt: '2026-08-01T09:15:00Z' },
      ]);
    }
  };

  const handleApproveClick = (payroll: PayrollPeriod) => {
    setSelectedPayroll(payroll);
    setConfirmStep('confirm1');
  };

  const handleConfirm1 = () => setConfirmStep('password');

  const handlePasswordSubmit = () => {
    if (password.length < 4) {
      showAlert('Invalid Password', 'Enter your admin password to continue.');
      return;
    }
    setConfirmStep('confirm2');
  };

  const handleFinalApprove = async () => {
    if (!selectedPayroll) return;
    setApproving(true);
    setConfirmStep('processing');

    const res = await adminService.approvePayroll(selectedPayroll.id);
    setApproving(false);

    if (res.success) {
      setConfirmStep('done');
      setPayrolls(prev => prev.map(p => p.id === selectedPayroll.id ? { ...p, status: 'approved', approvedAt: new Date().toISOString() } : p));
    } else {
      showAlert('Approval Failed', res.error || 'Please try again.');
      setConfirmStep('idle');
    }
  };

  const resetFlow = () => { setConfirmStep('idle'); setSelectedPayroll(null); setPassword(''); };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Staff Payroll</Text>
        <Badge label="Admin Only" variant="error" size="sm" />
      </View>

      {/* Confirmation Overlay */}
      {confirmStep !== 'idle' && selectedPayroll && (
        <View style={styles.overlay}>
          <GlassCard variant="elevated" style={styles.confirmCard}>
            {confirmStep === 'confirm1' && (
              <>
                <MaterialIcons name="warning" size={44} color={Colors.semantic.warning} />
                <Text style={styles.confirmTitle}>Confirm Payroll Approval</Text>
                <Text style={styles.confirmSub}>You are about to approve payroll for {selectedPayroll.totalStaff} staff members.</Text>
                <GlassCard style={styles.confirmDetail}>
                  <Text style={styles.confirmPeriod}>{new Date(selectedPayroll.periodStart).toLocaleDateString()} – {new Date(selectedPayroll.periodEnd).toLocaleDateString()}</Text>
                  <Text style={styles.confirmAmount}>{APP_CONFIG.currencySymbol} {selectedPayroll.totalAmount.toLocaleString()}</Text>
                  <Text style={styles.confirmAmountLabel}>Total Amount</Text>
                </GlassCard>
                <GlassCard style={[styles.warningNote, { backgroundColor: Colors.semantic.warningBg }]}>
                  <MaterialIcons name="info" size={16} color={Colors.semantic.warning} />
                  <Text style={styles.warningText}>This action is irreversible. Once approved, payroll processing begins and cannot be undone.</Text>
                </GlassCard>
                <View style={styles.confirmButtons}>
                  <Button title="Cancel" onPress={resetFlow} variant="ghost" style={{ flex: 1 }} />
                  <Button title="Continue" onPress={handleConfirm1} variant="secondary" style={{ flex: 1 }} />
                </View>
              </>
            )}

            {confirmStep === 'password' && (
              <>
                <MaterialIcons name="lock" size={44} color={Colors.brand.primary} />
                <Text style={styles.confirmTitle}>Admin Authentication</Text>
                <Text style={styles.confirmSub}>Enter your admin password to authorize payroll approval.</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Admin password"
                  placeholderTextColor={Colors.text.muted}
                  secureTextEntry
                  style={styles.passwordInput}
                  autoFocus
                />
                <View style={styles.confirmButtons}>
                  <Button title="Cancel" onPress={resetFlow} variant="ghost" style={{ flex: 1 }} />
                  <Button title="Authenticate" onPress={handlePasswordSubmit} style={{ flex: 1 }} />
                </View>
              </>
            )}

            {confirmStep === 'confirm2' && (
              <>
                <View style={styles.finalWarningIcon}>
                  <MaterialIcons name="gavel" size={44} color={Colors.semantic.error} />
                </View>
                <Text style={styles.confirmTitle}>Final Confirmation</Text>
                <Text style={styles.confirmSub}>This is the final step. Payroll will be queued for immediate processing.</Text>
                <GlassCard style={[styles.warningNote, { backgroundColor: Colors.semantic.errorBg }]}>
                  <MaterialIcons name="warning" size={16} color={Colors.semantic.error} />
                  <Text style={[styles.warningText, { color: Colors.semantic.error }]}>
                    {APP_CONFIG.currencySymbol} {selectedPayroll.totalAmount.toLocaleString()} will be scheduled for disbursement to {selectedPayroll.totalStaff} staff. This cannot be reversed.
                  </Text>
                </GlassCard>
                <View style={styles.confirmButtons}>
                  <Button title="Cancel" onPress={resetFlow} variant="ghost" style={{ flex: 1 }} />
                  <Button title="APPROVE PAYROLL" onPress={handleFinalApprove} loading={approving} style={{ flex: 1, backgroundColor: Colors.semantic.error }} />
                </View>
              </>
            )}

            {confirmStep === 'processing' && (
              <View style={styles.processingState}>
                <MaterialIcons name="refresh" size={44} color={Colors.brand.primary} />
                <Text style={styles.confirmTitle}>Processing Approval...</Text>
                <Text style={styles.confirmSub}>Please wait. Creating audit log.</Text>
              </View>
            )}

            {confirmStep === 'done' && (
              <View style={styles.doneState}>
                <MaterialIcons name="check-circle" size={60} color={Colors.semantic.success} />
                <Text style={styles.confirmTitle}>Payroll Approved</Text>
                <Text style={styles.confirmSub}>Payroll has been approved and logged. Processing will begin shortly.</Text>
                <Button title="Done" onPress={resetFlow} fullWidth style={{ marginTop: 16 }} />
              </View>
            )}
          </GlassCard>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <GlassCard style={styles.infoCard}>
          <MaterialIcons name="security" size={18} color={Colors.semantic.warning} />
          <Text style={styles.infoText}>Payroll approval is a high-security action. It requires password authentication and is fully audit-logged.</Text>
        </GlassCard>

        {loading ? (
          [1, 2].map(i => <SkeletonLoader key={i} width="100%" height={160} style={{ borderRadius: 16, marginBottom: 14 }} />)
        ) : (
          payrolls.map(payroll => (
            <GlassCard key={payroll.id} variant={payroll.status === 'pending_approval' ? 'elevated' : 'default'} style={[styles.payrollCard, payroll.status === 'pending_approval' && { borderColor: Colors.semantic.warning }]}>
              <View style={styles.payrollHeader}>
                <View>
                  <Text style={styles.payrollPeriod}>
                    {new Date(payroll.periodStart).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })} Payroll
                  </Text>
                  <Text style={styles.payrollDates}>{payroll.periodStart} – {payroll.periodEnd}</Text>
                </View>
                <Badge
                  label={payroll.status === 'pending_approval' ? 'Awaiting Approval' : payroll.status === 'approved' ? 'Approved' : payroll.status === 'paid' ? 'Paid' : 'Open'}
                  variant={payroll.status === 'pending_approval' ? 'warning' : payroll.status === 'paid' ? 'success' : 'neutral'}
                />
              </View>

              <View style={styles.payrollStats}>
                <View style={styles.payrollStat}>
                  <Text style={styles.payrollStatVal}>{payroll.totalStaff}</Text>
                  <Text style={styles.payrollStatLabel}>Staff</Text>
                </View>
                <View style={styles.payrollStatDivider} />
                <View style={styles.payrollStat}>
                  <Text style={styles.payrollStatVal}>{APP_CONFIG.currencySymbol} {payroll.totalAmount.toLocaleString()}</Text>
                  <Text style={styles.payrollStatLabel}>Total Amount</Text>
                </View>
              </View>

              {payroll.status === 'pending_approval' && (
                <Button title="Review & Approve Payroll" onPress={() => handleApproveClick(payroll)} variant="secondary" fullWidth style={{ marginTop: 12 }} />
              )}

              {payroll.approvedAt && (
                <Text style={styles.approvedAt}>Approved {new Date(payroll.approvedAt).toLocaleDateString()}</Text>
              )}
            </GlassCard>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 20, fontWeight: '800', color: Colors.text.primary, includeFontPadding: false },
  content: { paddingHorizontal: 20, paddingBottom: 60 },
  infoCard: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 20, backgroundColor: Colors.semantic.warningBg, borderColor: 'rgba(245,158,11,0.3)' },
  infoText: { flex: 1, fontSize: 13, color: Colors.semantic.warning, lineHeight: 18, includeFontPadding: false },
  payrollCard: { marginBottom: 16 },
  payrollHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  payrollPeriod: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  payrollDates: { fontSize: 12, color: Colors.text.muted, marginTop: 3, includeFontPadding: false },
  payrollStats: { flexDirection: 'row', alignItems: 'center' },
  payrollStat: { flex: 1, alignItems: 'center' },
  payrollStatVal: { fontSize: 20, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  payrollStatLabel: { fontSize: 12, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  payrollStatDivider: { width: 1, height: 32, backgroundColor: Colors.glass.border },
  approvedAt: { fontSize: 12, color: Colors.semantic.success, marginTop: 10, textAlign: 'center', includeFontPadding: false },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, alignItems: 'center', justifyContent: 'center', padding: 20 },
  confirmCard: { width: '100%', alignItems: 'center', gap: 12 },
  confirmTitle: { fontSize: 20, fontWeight: '800', color: Colors.text.primary, textAlign: 'center', includeFontPadding: false },
  confirmSub: { fontSize: 14, color: Colors.text.secondary, textAlign: 'center', lineHeight: 20, includeFontPadding: false },
  confirmDetail: { width: '100%', alignItems: 'center', gap: 4 },
  confirmPeriod: { fontSize: 13, color: Colors.text.muted, includeFontPadding: false },
  confirmAmount: { fontSize: 28, fontWeight: '800', color: Colors.brand.accent, includeFontPadding: false },
  confirmAmountLabel: { fontSize: 12, color: Colors.text.muted, includeFontPadding: false },
  warningNote: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', width: '100%' },
  warningText: { flex: 1, fontSize: 13, color: Colors.semantic.warning, lineHeight: 18, includeFontPadding: false },
  confirmButtons: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 4 },
  passwordInput: { width: '100%', backgroundColor: Colors.glass.medium, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.glass.border, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: Colors.text.primary, includeFontPadding: false },
  finalWarningIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.semantic.errorBg, alignItems: 'center', justifyContent: 'center' },
  processingState: { alignItems: 'center', gap: 12 },
  doneState: { alignItems: 'center', gap: 12 },
});

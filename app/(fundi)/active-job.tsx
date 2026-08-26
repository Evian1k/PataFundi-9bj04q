// PataFundi — Fundi Active Job Screen
// Complete job lifecycle management: accepted → on_the_way → arrived → in_progress → completed
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { jobService } from '@/services/jobService';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { APP_CONFIG } from '@/constants/config';
import { JobStatus } from '@/types';

type FundiJobStage = 'fundi_accepted' | 'on_the_way' | 'arrived' | 'in_progress' | 'completed';

const STAGES: { status: FundiJobStage; label: string; action: string; icon: string; confirmTitle?: string; confirmMsg?: string }[] = [
  { status: 'fundi_accepted', label: 'Job Accepted', action: "I'm On The Way", icon: 'directions-walk', confirmTitle: "Go to Customer?", confirmMsg: "Confirm you are heading to the customer location." },
  { status: 'on_the_way', label: 'On The Way', action: "I've Arrived", icon: 'place', confirmTitle: "Mark as Arrived?", confirmMsg: "Confirm you have reached the customer's location." },
  { status: 'arrived', label: 'Arrived', action: 'Start Work', icon: 'build', confirmTitle: "Start Work?", confirmMsg: "Confirm you are beginning the job." },
  { status: 'in_progress', label: 'Working', action: 'Mark Work Complete', icon: 'check-circle', confirmTitle: "Complete Job?", confirmMsg: "Confirm the work is fully done. The customer will be notified to verify." },
  { status: 'completed', label: 'Work Complete', action: 'Awaiting Confirmation', icon: 'hourglass-top' },
];

export default function FundiActiveJobScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { jobId } = useLocalSearchParams<{ jobId?: string }>();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [currentStage, setCurrentStage] = useState<FundiJobStage>('fundi_accepted');
  const [advancing, setAdvancing] = useState(false);
  const [jobDetails, setJobDetails] = useState({
    title: 'Install Ceiling Lights',
    service: 'Electrical',
    customerName: 'John Doe',
    address: '14 Riverside Drive, Westlands',
    estimatedEarnings: 3400,
    agreedPrice: 4000,
  });

  const subRef = useRef<any>(null);

  useEffect(() => {
    if (!jobId) return;
    jobService.getJobById(jobId).then(res => {
      if (res.success && res.data) {
        const j = res.data;
        setJobDetails({
          title: j.title,
          service: j.serviceCategory,
          customerName: j.customer ? `${(j.customer as any).first_name} ${(j.customer as any).last_name}` : 'Customer',
          address: j.location.address,
          estimatedEarnings: Math.round((j.agreedPrice || j.estimatedPrice.estimatedTotal) * 0.85),
          agreedPrice: j.agreedPrice || j.estimatedPrice.estimatedTotal,
        });
        const validStatus: FundiJobStage[] = ['fundi_accepted', 'on_the_way', 'arrived', 'in_progress', 'completed'];
        if (validStatus.includes(j.status as FundiJobStage)) {
          setCurrentStage(j.status as FundiJobStage);
        }
      }
    });

    subRef.current = jobService.subscribeToJob(jobId, (updated) => {
      const validStatus: FundiJobStage[] = ['fundi_accepted', 'on_the_way', 'arrived', 'in_progress', 'completed'];
      if (validStatus.includes(updated.status)) setCurrentStage(updated.status as FundiJobStage);
    });

    return () => { subRef.current?.unsubscribe(); };
  }, [jobId]);

  const currentStageIdx = STAGES.findIndex(s => s.status === currentStage);
  const currentStageDef = STAGES[currentStageIdx];
  const isCompleted = currentStage === 'completed';

  const handleAdvance = () => {
    if (currentStageIdx >= STAGES.length - 1) return;
    const next = STAGES[currentStageIdx + 1];
    const def = currentStageDef;

    showAlert(def.confirmTitle || 'Confirm', def.confirmMsg || 'Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm', style: 'default', onPress: async () => {
          setAdvancing(true);
          const effectiveJobId = jobId || 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
          const res = await jobService.updateJobStatus(effectiveJobId, next.status as JobStatus, `Fundi updated status to: ${next.label}`);
          setAdvancing(false);
          if (res.success) {
            setCurrentStage(next.status);
          } else {
            // Demo mode fallback
            setCurrentStage(next.status);
          }
        }
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Active Job</Text>
        <Pressable onPress={() => router.push({ pathname: '/(customer)/chat-room', params: { roomId: 'dddddddd-dddd-dddd-dddd-dddddddddddd' } })} style={styles.chatBtn}>
          <MaterialIcons name="chat" size={22} color={Colors.brand.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Status Banner */}
        <GlassCard variant="elevated" style={[styles.statusCard, isCompleted && { borderColor: Colors.semantic.success }]}>
          <View style={styles.statusRow}>
            <MaterialIcons name={currentStageDef?.icon as any || 'work'} size={28} color={isCompleted ? Colors.semantic.success : Colors.brand.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.statusLabel}>Current Status</Text>
              <Text style={[styles.statusValue, isCompleted && { color: Colors.semantic.success }]}>{currentStageDef?.label}</Text>
            </View>
            <Badge label={isCompleted ? 'Done' : 'Active'} variant={isCompleted ? 'success' : 'warning'} />
          </View>
        </GlassCard>

        {/* Stage Progress */}
        <View style={styles.stagesSection}>
          <Text style={styles.sectionTitle}>Job Progress</Text>
          {STAGES.map((stage, idx) => {
            const isDone = idx < currentStageIdx;
            const isActive = idx === currentStageIdx;
            return (
              <View key={stage.status} style={styles.stageItem}>
                <View style={styles.stageLeft}>
                  <View style={[styles.stageDot, isDone && styles.stageDotDone, isActive && styles.stageDotActive]}>
                    {isDone ? <MaterialIcons name="check" size={12} color="#FFF" /> : <Text style={styles.stageDotNum}>{idx + 1}</Text>}
                  </View>
                  {idx < STAGES.length - 1 && <View style={[styles.stageLine, isDone && styles.stageLineDone]} />}
                </View>
                <View style={styles.stageContent}>
                  <Text style={[styles.stageLabel, isActive && { color: Colors.brand.primary, fontWeight: '700' }]}>{stage.label}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Job Details */}
        <GlassCard style={styles.jobDetails}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          <DetailRow icon="build" text={`${jobDetails.title} — ${jobDetails.service}`} />
          <DetailRow icon="person" text={`Customer: ${jobDetails.customerName}`} />
          <DetailRow icon="place" text={jobDetails.address} />
          <DetailRow icon="account-balance-wallet" text={`Your earnings: ${APP_CONFIG.currencySymbol} ${jobDetails.estimatedEarnings.toLocaleString()}`} highlight />
        </GlassCard>

        {/* Map placeholder */}
        <View style={styles.mapArea}>
          <MaterialIcons name="map" size={32} color={Colors.text.muted} />
          <Text style={styles.mapText}>Live Map — GPS required</Text>
        </View>

        {/* Contact customer */}
        <GlassCard style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contact Customer</Text>
          <View style={styles.contactRow}>
            <Pressable onPress={() => router.push({ pathname: '/(customer)/chat-room', params: { roomId: 'dddddddd-dddd-dddd-dddd-dddddddddddd' } })} style={styles.contactBtn}>
              <MaterialIcons name="chat" size={18} color={Colors.brand.primary} />
              <Text style={[styles.contactBtnText, { color: Colors.brand.primary }]}>Message</Text>
            </Pressable>
            <Pressable style={styles.contactBtn}>
              <MaterialIcons name="call" size={18} color={Colors.semantic.success} />
              <Text style={[styles.contactBtnText, { color: Colors.semantic.success }]}>Call</Text>
            </Pressable>
          </View>
        </GlassCard>

        {/* Advance Button */}
        {!isCompleted && (
          <Button
            title={currentStageDef?.action || 'Next'}
            onPress={handleAdvance}
            loading={advancing}
            fullWidth size="lg"
            style={{ marginTop: 8 }}
          />
        )}

        {/* Completed State */}
        {isCompleted && (
          <GlassCard style={styles.completedCard}>
            <MaterialIcons name="hourglass-top" size={24} color={Colors.brand.secondary} />
            <Text style={styles.completedTitle}>Waiting for Customer Confirmation</Text>
            <Text style={styles.completedSub}>Your earnings will be released once the customer confirms the work is complete.</Text>
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, text, highlight }: { icon: string; text: string; highlight?: boolean }) {
  return (
    <View style={detailStyles.row}>
      <MaterialIcons name={icon as any} size={15} color={highlight ? Colors.brand.accent : Colors.text.muted} />
      <Text style={[detailStyles.text, highlight && detailStyles.highlight]}>{text}</Text>
    </View>
  );
}
const detailStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  text: { flex: 1, fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  highlight: { color: Colors.brand.accent, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: Colors.text.primary, textAlign: 'center', includeFontPadding: false },
  chatBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 14 },
  statusCard: { borderColor: Colors.brand.primary },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  statusLabel: { fontSize: 12, color: Colors.text.muted, includeFontPadding: false },
  statusValue: { fontSize: 18, fontWeight: '700', color: Colors.brand.primary, includeFontPadding: false },
  stagesSection: {},
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, marginBottom: 14, includeFontPadding: false },
  stageItem: { flexDirection: 'row', gap: 12 },
  stageLeft: { alignItems: 'center' },
  stageDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.glass.heavy, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.glass.border },
  stageDotDone: { backgroundColor: Colors.semantic.success, borderColor: Colors.semantic.success },
  stageDotActive: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
  stageDotNum: { fontSize: 11, fontWeight: '700', color: Colors.text.secondary, includeFontPadding: false },
  stageLine: { width: 2, flex: 1, backgroundColor: Colors.glass.border, marginVertical: 2 },
  stageLineDone: { backgroundColor: Colors.semantic.success },
  stageContent: { flex: 1, paddingBottom: 20 },
  stageLabel: { fontSize: 14, fontWeight: '500', color: Colors.text.primary, includeFontPadding: false },
  jobDetails: { gap: 0 },
  mapArea: { height: 140, backgroundColor: Colors.background.tertiary, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: Colors.glass.border },
  mapText: { fontSize: 13, color: Colors.text.muted, includeFontPadding: false },
  contactCard: {},
  contactTitle: { fontSize: 14, fontWeight: '600', color: Colors.text.secondary, marginBottom: 12, includeFontPadding: false },
  contactRow: { flexDirection: 'row', gap: 10 },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, backgroundColor: Colors.glass.light, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.glass.border },
  contactBtnText: { fontSize: 13, fontWeight: '600', includeFontPadding: false },
  completedCard: { alignItems: 'center', gap: 10 },
  completedTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', includeFontPadding: false },
  completedSub: { fontSize: 13, color: Colors.text.secondary, textAlign: 'center', lineHeight: 20, includeFontPadding: false },
});

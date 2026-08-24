import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAlert } from '@/template';
import { APP_CONFIG } from '@/constants/config';

const JOB_STAGES = [
  { id: 'navigate', label: 'Navigate to Customer', icon: 'directions', actionLabel: 'Mark as Arrived' },
  { id: 'arrived', label: 'Arrived at Location', icon: 'place', actionLabel: 'Start Work' },
  { id: 'working', label: 'Work In Progress', icon: 'build', actionLabel: 'Complete Work' },
  { id: 'completed', label: 'Work Completed', icon: 'check-circle', actionLabel: 'Upload Final Photos & Request Confirmation' },
];

export default function FundiActiveJobScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const [currentStage, setCurrentStage] = useState(2); // "working"

  const handleStageAction = () => {
    if (currentStage < JOB_STAGES.length - 1) {
      const nextStage = JOB_STAGES[currentStage + 1];
      showAlert(
        `Confirm: ${nextStage.label}`,
        'This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Confirm', onPress: () => setCurrentStage(s => s + 1) },
        ]
      );
    } else {
      showAlert('Request Confirmation', 'Notify customer that work is complete?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Request', onPress: () => router.back() },
      ]);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Active Job</Text>
        <Pressable style={styles.emergencyBtn}>
          <MaterialIcons name="emergency" size={22} color={Colors.semantic.error} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Stage Progress */}
        <GlassCard variant="elevated" style={styles.stageCard}>
          <Text style={styles.stageTitle}>Current Stage</Text>
          <View style={styles.stageIndicator}>
            <MaterialIcons name={JOB_STAGES[currentStage].icon as any} size={32} color={Colors.brand.accent} />
            <Text style={styles.stageName}>{JOB_STAGES[currentStage].label}</Text>
          </View>
          <View style={styles.stageBar}>
            {JOB_STAGES.map((stage, i) => (
              <View key={stage.id} style={[styles.stageDot, i <= currentStage && styles.stageDotActive]} />
            ))}
          </View>
        </GlassCard>

        {/* Customer */}
        <GlassCard style={styles.customerCard}>
          <Text style={styles.sectionLabel}>Customer</Text>
          <View style={styles.customerRow}>
            <Avatar name="Amina Wanjiku" size={48} />
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>Amina Wanjiku</Text>
              <Text style={styles.customerAddress}>14 Riverside Drive, Westlands</Text>
            </View>
            <View style={styles.contactBtns}>
              <Pressable style={styles.contactBtn}>
                <MaterialIcons name="chat" size={18} color={Colors.brand.primary} />
              </Pressable>
              <Pressable style={[styles.contactBtn, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                <MaterialIcons name="call" size={18} color={Colors.semantic.success} />
              </Pressable>
            </View>
          </View>
        </GlassCard>

        {/* Job Info */}
        <GlassCard style={styles.jobInfo}>
          <Text style={styles.sectionLabel}>Job Details</Text>
          <Text style={styles.jobTitle}>Kitchen Sink Leak</Text>
          <Text style={styles.jobDesc}>Kitchen sink has been leaking for 2 days. Water pooling under the cabinet.</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Agreed Price</Text>
            <Text style={styles.priceValue}>{APP_CONFIG.currencySymbol} 4,500</Text>
          </View>
        </GlassCard>

        {/* Photo Upload */}
        <GlassCard style={styles.photoSection}>
          <Text style={styles.sectionLabel}>Job Photos</Text>
          <View style={styles.photoRow}>
            <Pressable style={styles.photoAdd}>
              <MaterialIcons name="add-photo-alternate" size={24} color={Colors.brand.primary} />
              <Text style={styles.photoAddText}>Before</Text>
            </Pressable>
            <Pressable style={styles.photoAdd}>
              <MaterialIcons name="add-photo-alternate" size={24} color={Colors.brand.accent} />
              <Text style={[styles.photoAddText, { color: Colors.brand.accent }]}>After</Text>
            </Pressable>
          </View>
        </GlassCard>

        {/* Action */}
        <Button
          title={JOB_STAGES[currentStage].actionLabel}
          onPress={handleStageAction}
          fullWidth
          size="lg"
          variant={currentStage === JOB_STAGES.length - 1 ? 'secondary' : 'primary'}
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: Colors.text.primary, textAlign: 'center', includeFontPadding: false },
  emergencyBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  stageCard: { marginBottom: 14, alignItems: 'center', gap: 12 },
  stageTitle: { fontSize: 13, fontWeight: '500', color: Colors.text.secondary, includeFontPadding: false },
  stageIndicator: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stageName: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  stageBar: { flexDirection: 'row', gap: 8 },
  stageDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.glass.heavy },
  stageDotActive: { backgroundColor: Colors.brand.accent },
  customerCard: { marginBottom: 14 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, includeFontPadding: false },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 15, fontWeight: '600', color: Colors.text.primary, includeFontPadding: false },
  customerAddress: { fontSize: 12, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  contactBtns: { flexDirection: 'row', gap: 8 },
  contactBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(14,165,233,0.15)', alignItems: 'center', justifyContent: 'center' },
  jobInfo: { marginBottom: 14 },
  jobTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, marginBottom: 6, includeFontPadding: false },
  jobDesc: { fontSize: 13, color: Colors.text.secondary, lineHeight: 19, marginBottom: 14, includeFontPadding: false },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.glass.border },
  priceLabel: { fontSize: 14, color: Colors.text.secondary, includeFontPadding: false },
  priceValue: { fontSize: 18, fontWeight: '800', color: Colors.brand.secondary, includeFontPadding: false },
  photoSection: { marginBottom: 14 },
  photoRow: { flexDirection: 'row', gap: 12 },
  photoAdd: { flex: 1, height: 80, borderRadius: Radius.xl, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.glass.border, alignItems: 'center', justifyContent: 'center', gap: 6 },
  photoAddText: { fontSize: 13, fontWeight: '500', color: Colors.brand.primary, includeFontPadding: false },
});

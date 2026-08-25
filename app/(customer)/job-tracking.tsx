import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { jobService } from '@/services/jobService';
import { Job } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/constants/config';

const TIMELINE = [
  { status: 'requested', label: 'Job Requested', done: true, time: '2:15 PM' },
  { status: 'matching', label: 'Finding Fundi', done: true, time: '2:16 PM' },
  { status: 'fundi_assigned', label: 'Fundi Assigned', done: true, time: '2:20 PM' },
  { status: 'on_the_way', label: 'Fundi On The Way', done: true, time: '2:25 PM' },
  { status: 'arrived', label: 'Fundi Arrived', done: true, time: '2:45 PM' },
  { status: 'in_progress', label: 'Work In Progress', done: true, time: '3:00 PM', active: true },
  { status: 'completed', label: 'Work Completed', done: false, time: '' },
  { status: 'customer_confirmed', label: 'You Confirm', done: false, time: '' },
  { status: 'payment_complete', label: 'Payment Done', done: false, time: '' },
];

export default function JobTrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { jobId } = useLocalSearchParams<{ jobId?: string }>();
  const [showConfirmPrompt, setShowConfirmPrompt] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const subRef = useRef<any>(null);

  useEffect(() => {
    if (!jobId) return;
    // Load real job
    jobService.getJobById(jobId).then(res => {
      if (res.success && res.data) setJob(res.data);
    });
    // Subscribe to live updates
    subRef.current = jobService.subscribeToJob(jobId, (updated) => {
      setJob(prev => prev ? { ...prev, status: updated.status, updatedAt: updated.updated_at } : prev);
    });
    return () => { subRef.current?.unsubscribe(); };
  }, [jobId]);

  const handleConfirmComplete = async () => {
    if (!jobId) return;
    await jobService.updateJobStatus(jobId, 'customer_confirmed', 'Customer confirmed work complete');
    setShowConfirmPrompt(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Job Tracking</Text>
        <Pressable style={styles.supportBtn}>
          <MaterialIcons name="headset-mic" size={22} color={Colors.brand.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Map Placeholder */}
        <View style={styles.mapArea}>
          <MaterialIcons name="map" size={36} color={Colors.text.muted} />
          <Text style={styles.mapText}>Live Map — GPS integration required</Text>
          <Badge label="In Progress" variant="warning" />
        </View>

        {/* Fundi Card */}
        <GlassCard variant="elevated" style={styles.fundiCard}>
          <View style={styles.fundiRow}>
            <Avatar name="James Omondi" size={56} isOnline isVerified />
            <View style={styles.fundiInfo}>
              <Text style={styles.fundiName}>James Omondi</Text>
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={14} color={Colors.brand.secondary} />
                <Text style={styles.rating}>4.8 · 247 jobs</Text>
              </View>
              <Text style={styles.fundiStatus}>Currently working on your job</Text>
            </View>
          </View>
          <View style={styles.contactRow}>
            <Pressable onPress={() => router.push({ pathname: '/(customer)/chat-room', params: { roomId: 'room_job_001' } })} style={styles.contactBtn}>
              <MaterialIcons name="chat" size={20} color={Colors.brand.primary} />
              <Text style={styles.contactBtnText}>Message</Text>
            </Pressable>
            <Pressable style={styles.contactBtn}>
              <MaterialIcons name="call" size={20} color={Colors.semantic.success} />
              <Text style={[styles.contactBtnText, { color: Colors.semantic.success }]}>Call</Text>
            </Pressable>
            <Pressable style={styles.contactBtn}>
              <MaterialIcons name="share-location" size={20} color={Colors.brand.accent} />
              <Text style={[styles.contactBtnText, { color: Colors.brand.accent }]}>Track</Text>
            </Pressable>
          </View>
        </GlassCard>

        {/* Job Details */}
        <GlassCard style={styles.jobDetails}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          <View style={styles.detailRow}>
            <MaterialIcons name="build" size={15} color={Colors.text.muted} />
            <Text style={styles.detailText}>Kitchen Sink Leak — Plumbing</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={15} color={Colors.text.muted} />
            <Text style={styles.detailText}>14 Riverside Drive, Westlands</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="payment" size={15} color={Colors.text.muted} />
            <Text style={styles.detailText}>{APP_CONFIG.currencySymbol} 4,500 agreed price</Text>
          </View>
        </GlassCard>

        {/* Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Job Timeline</Text>
          {TIMELINE.map((event, i) => (
            <View key={event.status} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, event.done && styles.timelineDotDone, (event as any).active && styles.timelineDotActive]}>
                  {event.done ? <MaterialIcons name="check" size={12} color="#FFF" /> : null}
                </View>
                {i < TIMELINE.length - 1 && <View style={[styles.timelineLine, event.done && styles.timelineLineDone]} />}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineLabel, (event as any).active && { color: Colors.brand.primary }]}>{event.label}</Text>
                {event.time ? <Text style={styles.timelineTime}>{event.time}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        {/* Confirm Work Button */}
        <GlassCard style={styles.confirmSection}>
          <Text style={styles.confirmTitle}>Work finished?</Text>
          <Text style={styles.confirmDesc}>Once you confirm work is complete, payment will be processed to the Fundi.</Text>
          <Button title="Confirm Work Complete" onPress={handleConfirmComplete} variant="success" fullWidth style={{ marginTop: 12 }} />
        </GlassCard>

        {/* Emergency */}
        <Pressable style={styles.emergencyBtn}>
          <MaterialIcons name="emergency" size={18} color={Colors.semantic.error} />
          <Text style={styles.emergencyText}>Report Emergency or Problem</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: Colors.text.primary, textAlign: 'center', includeFontPadding: false },
  supportBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  mapArea: { height: 180, backgroundColor: Colors.background.tertiary, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16, borderWidth: 1, borderColor: Colors.glass.border },
  mapText: { fontSize: 13, color: Colors.text.muted, includeFontPadding: false },
  fundiCard: { marginBottom: 14 },
  fundiRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  fundiInfo: { flex: 1 },
  fundiName: { fontSize: 17, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  rating: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  fundiStatus: { fontSize: 12, color: Colors.semantic.warning, marginTop: 3, includeFontPadding: false },
  contactRow: { flexDirection: 'row', gap: 10 },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, backgroundColor: Colors.glass.light, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.glass.border },
  contactBtnText: { fontSize: 13, fontWeight: '600', color: Colors.brand.primary, includeFontPadding: false },
  jobDetails: { marginBottom: 16, gap: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailText: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  timelineSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, marginBottom: 16, includeFontPadding: false },
  timelineItem: { flexDirection: 'row', gap: 12 },
  timelineLeft: { alignItems: 'center' },
  timelineDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.glass.heavy, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.glass.border },
  timelineDotDone: { backgroundColor: Colors.semantic.success, borderColor: Colors.semantic.success },
  timelineDotActive: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.glass.border, marginVertical: 2 },
  timelineLineDone: { backgroundColor: Colors.semantic.success },
  timelineContent: { flex: 1, paddingBottom: 20 },
  timelineLabel: { fontSize: 14, fontWeight: '500', color: Colors.text.primary, includeFontPadding: false },
  timelineTime: { fontSize: 12, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  confirmSection: { marginBottom: 14 },
  confirmTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  confirmDesc: { fontSize: 13, color: Colors.text.secondary, lineHeight: 20, marginTop: 4, includeFontPadding: false },
  emergencyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: Colors.semantic.errorBg, borderRadius: Radius.xl, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  emergencyText: { fontSize: 14, fontWeight: '600', color: Colors.semantic.error, includeFontPadding: false },
});

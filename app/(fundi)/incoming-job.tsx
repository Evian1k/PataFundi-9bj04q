// PataFundi — Incoming Job Screen for Fundi
// Real-time countdown timer + job details + accept/decline
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { fundiService } from '@/services/fundiService';
import { useAlert } from '@/template';
import { APP_CONFIG } from '@/constants/config';

const JOB_ACCEPT_TIMEOUT = 28; // seconds

export default function IncomingJobScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { jobId } = useLocalSearchParams<{ jobId?: string }>();
  const { showAlert } = useAlert();

  const [timeLeft, setTimeLeft] = useState(JOB_ACCEPT_TIMEOUT);
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState<'accepted' | 'declined' | null>(null);

  // Animations
  const timerAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<any>(null);

  // Demo job data
  const demoJob = {
    id: jobId || 'demo_job_001',
    title: 'Kitchen Sink Leak — Urgent',
    service: 'Plumbing',
    customerName: 'John Doe',
    area: 'Westlands, Nairobi',
    distanceKm: 1.4,
    etaMin: 9,
    urgency: 'urgent',
    estimatedEarnings: 3825, // After platform processing
    description: 'Under-sink leak flooding the cabinet. Needs immediate attention.',
    photosCount: 2,
  };

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(bounceAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // Ring pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(ringAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    // Countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    // Animate timer bar
    Animated.timing(timerAnim, {
      toValue: timeLeft / JOB_ACCEPT_TIMEOUT,
      duration: 900,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  const handleTimeout = () => {
    if (!responded) {
      showAlert('Time Expired', 'The job request has expired. Stay online to receive more jobs.');
      setTimeout(() => router.replace('/(fundi)/(tabs)'), 1500);
    }
  };

  const handleRespond = async (accept: boolean) => {
    clearInterval(timerRef.current);
    setResponding(true);

    if (jobId) {
      const res = await fundiService.respondToJob(jobId, '', accept);
      if (!res.success && accept) {
        showAlert('Error', res.error || 'Failed to respond to job.');
        setResponding(false);
        return;
      }
    }

    setResponded(accept ? 'accepted' : 'declined');
    setResponding(false);

    if (accept) {
      setTimeout(() => {
        router.replace({ pathname: '/(fundi)/active-job', params: { jobId: jobId || 'demo_job_001' } });
      }, 1400);
    } else {
      showAlert('Job Declined', 'No worries — you can receive the next job request.');
      setTimeout(() => router.replace('/(fundi)/(tabs)'), 1200);
    }
  };

  const ringScale = ringAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
  const ringOpacity = ringAnim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.5, 0, 0] });
  const timerWidth = timerAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const timerColor = timeLeft > 15 ? Colors.semantic.success : timeLeft > 8 ? Colors.semantic.warning : Colors.semantic.error;

  if (responded === 'accepted') {
    return (
      <View style={[styles.resultContainer, { paddingTop: insets.top }]}>
        <View style={styles.acceptedIcon}>
          <MaterialIcons name="check-circle" size={80} color={Colors.semantic.success} />
        </View>
        <Text style={styles.acceptedTitle}>Job Accepted!</Text>
        <Text style={styles.acceptedSub}>Navigating to {demoJob.area}...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { paddingTop: insets.top, opacity: fadeAnim, transform: [{ scale: bounceAnim }] }]}>
      {/* Pulsing notification header */}
      <View style={styles.notifHeader}>
        <View style={styles.rippleWrap}>
          <Animated.View style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
          <View style={styles.bellCircle}>
            <MaterialIcons name="notifications-active" size={28} color="#FFF" />
          </View>
        </View>
        <View style={styles.notifInfo}>
          <Text style={styles.notifLabel}>New Job Request!</Text>
          <Badge label={demoJob.urgency.charAt(0).toUpperCase() + demoJob.urgency.slice(1)} variant={demoJob.urgency === 'emergency' ? 'error' : demoJob.urgency === 'urgent' ? 'warning' : 'info'} />
        </View>
      </View>

      {/* Countdown Timer */}
      <View style={styles.timerSection}>
        <View style={styles.timerLabelRow}>
          <MaterialIcons name="timer" size={16} color={timerColor} />
          <Text style={[styles.timerLabel, { color: timerColor }]}>Accept within</Text>
          <Text style={[styles.timerCount, { color: timerColor }]}>{timeLeft}s</Text>
        </View>
        <View style={styles.timerBar}>
          <Animated.View style={[styles.timerFill, { width: timerWidth, backgroundColor: timerColor }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Job Card */}
        <GlassCard variant="elevated" style={styles.jobCard}>
          <Text style={styles.jobTitle}>{demoJob.title}</Text>
          <Text style={styles.jobService}>{demoJob.service}</Text>

          <View style={styles.jobMetaGrid}>
            <MetaItem icon="person" label="Customer" value={demoJob.customerName} />
            <MetaItem icon="place" label="Location" value={demoJob.area} />
            <MetaItem icon="directions-walk" label="Distance" value={`${demoJob.distanceKm} km away`} />
            <MetaItem icon="access-time" label="Travel ETA" value={`~${demoJob.etaMin} min`} />
          </View>

          <View style={styles.descriptionBox}>
            <Text style={styles.descLabel}>Problem Description</Text>
            <Text style={styles.descText}>{demoJob.description}</Text>
          </View>

          {demoJob.photosCount > 0 && (
            <View style={styles.photosRow}>
              <MaterialIcons name="photo-camera" size={16} color={Colors.brand.primary} />
              <Text style={styles.photosText}>{demoJob.photosCount} photos attached</Text>
            </View>
          )}
        </GlassCard>

        {/* Earnings preview — customer payment only, no commission shown */}
        <GlassCard style={styles.earningsCard}>
          <View style={styles.earningsRow}>
            <View>
              <Text style={styles.earningsLabel}>Your Earnings</Text>
              <Text style={styles.earningsNote}>After job completion</Text>
            </View>
            <Text style={styles.earningsAmount}>{APP_CONFIG.currencySymbol} {demoJob.estimatedEarnings.toLocaleString()}</Text>
          </View>
        </GlassCard>

        {/* Safety Note */}
        <GlassCard style={styles.safetyCard}>
          <MaterialIcons name="verified-user" size={16} color={Colors.semantic.success} />
          <Text style={styles.safetyText}>Customer verified. Secure payment guaranteed upon job completion.</Text>
        </GlassCard>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable
          onPress={() => handleRespond(false)}
          disabled={responding}
          style={[styles.declineBtn, { opacity: responding ? 0.6 : 1 }]}
        >
          <MaterialIcons name="close" size={22} color={Colors.semantic.error} />
          <Text style={styles.declineBtnText}>Decline</Text>
        </Pressable>
        <Pressable
          onPress={() => handleRespond(true)}
          disabled={responding}
          style={[styles.acceptBtn, { opacity: responding ? 0.6 : 1 }]}
        >
          <MaterialIcons name="check" size={22} color="#FFF" />
          <Text style={styles.acceptBtnText}>{responding ? 'Accepting...' : 'Accept Job'}</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function MetaItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={metaStyles.item}>
      <MaterialIcons name={icon as any} size={16} color={Colors.brand.primary} />
      <View>
        <Text style={metaStyles.label}>{label}</Text>
        <Text style={metaStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const metaStyles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, width: '48%', marginBottom: 14 },
  label: { fontSize: 11, color: Colors.text.muted, includeFontPadding: false },
  value: { fontSize: 13, fontWeight: '600', color: Colors.text.primary, includeFontPadding: false },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  resultContainer: { flex: 1, backgroundColor: Colors.background.primary, alignItems: 'center', justifyContent: 'center', gap: 16 },
  acceptedIcon: { width: 140, height: 140, borderRadius: 70, backgroundColor: Colors.semantic.successBg, alignItems: 'center', justifyContent: 'center' },
  acceptedTitle: { fontSize: 28, fontWeight: '800', color: Colors.text.primary, includeFontPadding: false },
  acceptedSub: { fontSize: 15, color: Colors.text.secondary, includeFontPadding: false },
  notifHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.glass.borderLight },
  rippleWrap: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: Colors.brand.secondary },
  bellCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.brand.secondary, alignItems: 'center', justifyContent: 'center' },
  notifInfo: { gap: 6 },
  notifLabel: { fontSize: 18, fontWeight: '800', color: Colors.text.primary, includeFontPadding: false },
  timerSection: { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.glass.borderLight },
  timerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  timerLabel: { fontSize: 13, fontWeight: '500', includeFontPadding: false },
  timerCount: { fontSize: 18, fontWeight: '800', marginLeft: 4, includeFontPadding: false },
  timerBar: { height: 6, backgroundColor: Colors.glass.heavy, borderRadius: 3, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 3 },
  content: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 16, gap: 14 },
  jobCard: { gap: 0 },
  jobTitle: { fontSize: 20, fontWeight: '800', color: Colors.text.primary, marginBottom: 4, includeFontPadding: false },
  jobService: { fontSize: 14, color: Colors.brand.primary, fontWeight: '600', marginBottom: 16, includeFontPadding: false },
  jobMetaGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 },
  descriptionBox: { backgroundColor: Colors.glass.light, borderRadius: Radius.lg, padding: 12, marginBottom: 12 },
  descLabel: { fontSize: 12, fontWeight: '600', color: Colors.text.secondary, marginBottom: 6, includeFontPadding: false },
  descText: { fontSize: 13, color: Colors.text.primary, lineHeight: 20, includeFontPadding: false },
  photosRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  photosText: { fontSize: 13, color: Colors.brand.primary, fontWeight: '500', includeFontPadding: false },
  earningsCard: {},
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  earningsLabel: { fontSize: 15, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  earningsNote: { fontSize: 12, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  earningsAmount: { fontSize: 28, fontWeight: '800', color: Colors.brand.accent, includeFontPadding: false },
  safetyCard: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  safetyText: { flex: 1, fontSize: 12, color: Colors.text.secondary, lineHeight: 18, includeFontPadding: false },
  actionBar: { flexDirection: 'row', gap: 14, paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.glass.borderLight },
  declineBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, backgroundColor: Colors.semantic.errorBg, borderRadius: Radius.xl, borderWidth: 2, borderColor: Colors.semantic.error },
  declineBtnText: { fontSize: 16, fontWeight: '700', color: Colors.semantic.error, includeFontPadding: false },
  acceptBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, backgroundColor: Colors.semantic.success, borderRadius: Radius.xl },
  acceptBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF', includeFontPadding: false },
});

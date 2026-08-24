import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { FundiCard } from '@/components/feature/FundiCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { fundiService } from '@/services/fundiService';
import { Fundi } from '@/types';

type MatchState = 'searching' | 'found' | 'accepted';

export default function JobMatchingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { jobId } = useLocalSearchParams<{ jobId?: string }>();

  const [matchState, setMatchState] = useState<MatchState>('searching');
  const [matchedFundi, setMatchedFundi] = useState<Fundi | null>(null);
  const [countdown, setCountdown] = useState(30);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Simulate match after 4s
    const matchTimer = setTimeout(async () => {
      const res = await fundiService.matchFundi('plumbing', { latitude: -1.2921, longitude: 36.8219 });
      if (res.success && res.data) {
        setMatchedFundi(res.data);
        setMatchState('found');
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      }
    }, 4000);

    return () => clearTimeout(matchTimer);
  }, []);

  useEffect(() => {
    if (matchState !== 'found') return;
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [matchState]);

  const handleAccept = () => {
    setMatchState('accepted');
    setTimeout(() => {
      router.replace({ pathname: '/(customer)/job-tracking', params: { jobId: jobId || 'job_001' } });
    }, 2000);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {matchState === 'searching' && (
        <View style={styles.searchingArea}>
          <View style={styles.pulseContainer}>
            <Animated.View style={[styles.pulseRing3, { transform: [{ scale: pulseAnim }] }]} />
            <Animated.View style={[styles.pulseRing2, { transform: [{ scale: pulseAnim }] }]} />
            <Animated.View style={[styles.pulseRing1]} />
            <View style={styles.searchIcon}>
              <MaterialIcons name="search" size={40} color={Colors.brand.primary} />
            </View>
          </View>
          <Text style={styles.searchingTitle}>Finding the best Fundi for you...</Text>
          <Text style={styles.searchingSubtitle}>We are matching you with verified professionals nearby.</Text>
          <View style={styles.searchingSteps}>
            {['Checking availability', 'Verifying skills', 'Calculating distance'].map((s, i) => (
              <View key={s} style={styles.searchingStep}>
                <MaterialIcons name="check-circle" size={16} color={Colors.brand.accent} />
                <Text style={styles.searchingStepText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {matchState === 'found' && matchedFundi && (
        <Animated.View style={[styles.foundArea, { opacity: fadeAnim }]}>
          <View style={styles.foundHeader}>
            <View style={styles.successBadge}>
              <MaterialIcons name="check-circle" size={32} color={Colors.semantic.success} />
            </View>
            <Text style={styles.foundTitle}>Fundi Found!</Text>
            <Text style={styles.foundSubtitle}>Review and confirm your Fundi</Text>
          </View>

          <FundiCard fundi={matchedFundi} distance={2.3} eta="~18 min" />

          <GlassCard style={styles.jobSummary}>
            <Text style={styles.jobSummaryTitle}>Job Summary</Text>
            <View style={styles.summaryRow}>
              <MaterialIcons name="build" size={16} color={Colors.brand.primary} />
              <Text style={styles.summaryText}>Plumbing — Kitchen Sink Leak</Text>
            </View>
            <View style={styles.summaryRow}>
              <MaterialIcons name="location-on" size={16} color={Colors.brand.primary} />
              <Text style={styles.summaryText}>14 Riverside Drive, Westlands</Text>
            </View>
            <View style={styles.summaryRow}>
              <MaterialIcons name="schedule" size={16} color={Colors.brand.primary} />
              <Text style={styles.summaryText}>Urgent — Within 4 hours</Text>
            </View>
            <View style={styles.estimatedRow}>
              <Text style={styles.estimatedLabel}>Estimated Price</Text>
              <Text style={styles.estimatedValue}>KSh 3,500 – 6,000</Text>
            </View>
          </GlassCard>

          <View style={styles.countdownRow}>
            <MaterialIcons name="timer" size={18} color={Colors.semantic.warning} />
            <Text style={styles.countdownText}>Fundi expires in {countdown}s</Text>
          </View>

          <View style={styles.actionBtns}>
            <Button title="Confirm Fundi" onPress={handleAccept} fullWidth size="lg" variant="secondary" />
            <Pressable style={styles.declineBtn} onPress={() => setMatchState('searching')}>
              <Text style={styles.declineText}>Find another Fundi</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {matchState === 'accepted' && (
        <View style={styles.acceptedArea}>
          <View style={styles.successCircle}>
            <MaterialIcons name="check" size={56} color="#FFF" />
          </View>
          <Text style={styles.acceptedTitle}>Fundi Confirmed!</Text>
          <Text style={styles.acceptedSubtitle}>James is on his way. You will be notified when he arrives.</Text>
        </View>
      )}

      <Pressable onPress={() => router.back()} style={[styles.cancelBtn, { bottom: insets.bottom + 24 }]}>
        <Text style={styles.cancelText}>Cancel Request</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary, paddingHorizontal: 24 },
  searchingArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  pulseContainer: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  pulseRing3: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(14,165,233,0.08)' },
  pulseRing2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(14,165,233,0.12)' },
  pulseRing1: { position: 'absolute', width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(14,165,233,0.2)' },
  searchIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.background.elevated, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.brand.primary },
  searchingTitle: { fontSize: 22, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', includeFontPadding: false },
  searchingSubtitle: { fontSize: 14, color: Colors.text.secondary, textAlign: 'center', includeFontPadding: false },
  searchingSteps: { gap: 10, alignSelf: 'stretch' },
  searchingStep: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchingStepText: { fontSize: 14, color: Colors.text.secondary, includeFontPadding: false },
  foundArea: { flex: 1, paddingTop: 20 },
  foundHeader: { alignItems: 'center', marginBottom: 24, gap: 8 },
  successBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.semantic.successBg, alignItems: 'center', justifyContent: 'center' },
  foundTitle: { fontSize: 26, fontWeight: '800', color: Colors.text.primary, includeFontPadding: false },
  foundSubtitle: { fontSize: 14, color: Colors.text.secondary, includeFontPadding: false },
  jobSummary: { marginTop: 16, gap: 10 },
  jobSummaryTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.primary, marginBottom: 4, includeFontPadding: false },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryText: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  estimatedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.glass.border },
  estimatedLabel: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  estimatedValue: { fontSize: 15, fontWeight: '700', color: Colors.brand.secondary, includeFontPadding: false },
  countdownRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  countdownText: { fontSize: 14, color: Colors.semantic.warning, fontWeight: '600', includeFontPadding: false },
  actionBtns: { marginTop: 20, gap: 12 },
  declineBtn: { alignItems: 'center', paddingVertical: 14 },
  declineText: { fontSize: 14, color: Colors.text.secondary, includeFontPadding: false },
  acceptedArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  successCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.semantic.success, alignItems: 'center', justifyContent: 'center', ...Shadow.lg },
  acceptedTitle: { fontSize: 28, fontWeight: '800', color: Colors.text.primary, includeFontPadding: false },
  acceptedSubtitle: { fontSize: 15, color: Colors.text.secondary, textAlign: 'center', lineHeight: 24, includeFontPadding: false },
  cancelBtn: { position: 'absolute', alignSelf: 'center' },
  cancelText: { fontSize: 14, color: Colors.text.muted, includeFontPadding: false },
});

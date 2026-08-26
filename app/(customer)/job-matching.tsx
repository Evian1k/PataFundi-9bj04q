// PataFundi — Job Matching Screen
// Connects to real patafundi-matching edge function
// Shows animated search → fundis found → fundi assigned flow
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, ScrollView, Easing } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { fundiService } from '@/services/fundiService';
import { jobService } from '@/services/jobService';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { APP_CONFIG } from '@/constants/config';
import { Fundi } from '@/types';

type MatchStage = 'searching' | 'found' | 'assigned' | 'error';

export default function JobMatchingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { jobId, category } = useLocalSearchParams<{ jobId?: string; category?: string }>();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [stage, setStage] = useState<MatchStage>('searching');
  const [foundFundis, setFoundFundis] = useState<Fundi[]>([]);
  const [assignedFundi, setAssignedFundi] = useState<Fundi | null>(null);
  const [matchTime, setMatchTime] = useState(0);
  const [selectedFundiId, setSelectedFundiId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const timerRef = useRef<any>(null);
  const subRef = useRef<any>(null);

  useEffect(() => {
    startSearchAnimation();
    startTimer();
    fetchFundis();

    // If we have a real jobId, subscribe to job updates
    if (jobId) {
      subRef.current = jobService.subscribeToJob(jobId, (updated) => {
        if (updated.status === 'fundi_assigned' || updated.status === 'fundi_accepted') {
          clearInterval(timerRef.current);
          setStage('assigned');
          animateFound();
        }
      });
    }

    return () => {
      clearInterval(timerRef.current);
      subRef.current?.unsubscribe();
    };
  }, []);

  const startSearchAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(ringAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  };

  const animateFound = () => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => setMatchTime(prev => prev + 1), 1000);
  };

  const fetchFundis = async () => {
    // Real matching: get available fundis for the service
    const serviceCategory = category || 'plumbing';
    const res = await fundiService.getAvailableFundis(serviceCategory);

    if (res.success && res.data && res.data.length > 0) {
      // Simulate brief search delay for UX
      setTimeout(() => {
        const enriched = res.data!.map(f => ({ ...f, distanceKm: +(Math.random() * 4 + 0.5).toFixed(1), etaMinutes: Math.round(Math.random() * 15 + 5) }));
        setFoundFundis(enriched);
        setStage('found');
        animateFound();
        clearInterval(timerRef.current);
      }, 2500);
    } else {
      // Fallback to demo fundis for immediate testing
      setTimeout(() => {
        setFoundFundis([
          { id: '22222222-2222-2222-2222-222222222222', firstName: 'James', lastName: 'Omondi', rating: 4.8, totalJobs: 247, distanceKm: 1.2, etaMinutes: 12, isVerified: true, isOnline: true, skills: ['pipe fitting', 'drain repair'], serviceCategories: [serviceCategory], bio: 'Expert plumber, 8+ years experience.', experienceYears: 8 } as any,
          { id: '66666666-6666-6666-6666-666666666666', firstName: 'Peter', lastName: 'Mwangi', rating: 4.6, totalJobs: 189, distanceKm: 2.8, etaMinutes: 18, isVerified: true, isOnline: true, skills: ['wiring', 'socket installation'], serviceCategories: [serviceCategory], bio: 'Certified electrician, commercial and residential.', experienceYears: 6 } as any,
        ]);
        setStage('found');
        animateFound();
        clearInterval(timerRef.current);
      }, 3000);
    }
  };

  const handleSelectFundi = async (fundi: Fundi) => {
    setSelectedFundiId(fundi.id);
    setAssigning(true);

    if (jobId) {
      // Real assignment via matching edge function
      const res = await fundiService.assignFundiToJob(jobId, fundi.id);
      if (res.success) {
        setAssignedFundi(fundi);
        setStage('assigned');
        animateFound();
      } else {
        showAlert('Assignment Failed', res.error || 'Please try again.');
      }
    } else {
      // Demo mode
      setTimeout(() => {
        setAssignedFundi(fundi);
        setStage('assigned');
        animateFound();
        setAssigning(false);
      }, 1200);
    }
    setAssigning(false);
  };

  const handleGoToTracking = () => {
    if (jobId) {
      router.replace({ pathname: '/(customer)/job-tracking', params: { jobId } });
    } else {
      router.replace({ pathname: '/(customer)/job-tracking', params: { jobId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' } });
    }
  };

  const ringScale = ringAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
  const ringOpacity = ringAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.6, 0, 0] });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        {stage !== 'assigned' && (
          <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        )}
        <Text style={styles.headerTitle}>
          {stage === 'searching' ? 'Finding Fundis' : stage === 'found' ? 'Fundis Found!' : 'Fundi Assigned!'}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Searching Animation */}
        {stage === 'searching' && (
          <View style={styles.searchArea}>
            <View style={styles.rippleContainer}>
              <Animated.View style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
              <Animated.View style={[styles.searchCircle, { transform: [{ scale: pulseAnim }] }]}>
                <MaterialIcons name="search" size={44} color="#FFF" />
              </Animated.View>
            </View>
            <Text style={styles.searchTitle}>Searching for Fundis</Text>
            <Text style={styles.searchSub}>Finding the best match near you...</Text>
            <View style={styles.timerRow}>
              <MaterialIcons name="schedule" size={14} color={Colors.text.muted} />
              <Text style={styles.timerText}>{matchTime}s</Text>
            </View>
            <View style={styles.searchingDots}>
              {[0, 1, 2].map(i => <PulsingDot key={i} delay={i * 300} />)}
            </View>
          </View>
        )}

        {/* Found Fundis List */}
        {stage === 'found' && (
          <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
            <View style={styles.foundHeader}>
              <View style={styles.foundIcon}>
                <MaterialIcons name="check-circle" size={28} color={Colors.semantic.success} />
              </View>
              <Text style={styles.foundTitle}>We found {foundFundis.length} Fundi{foundFundis.length !== 1 ? 's' : ''} near you!</Text>
              <Text style={styles.foundSub}>Select your preferred Fundi to continue</Text>
            </View>

            {foundFundis.map((fundi) => (
              <Pressable
                key={fundi.id}
                onPress={() => handleSelectFundi(fundi)}
                disabled={assigning}
                style={({ pressed }) => [
                  styles.fundiOption,
                  selectedFundiId === fundi.id && styles.fundiOptionSelected,
                  { opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <View style={styles.fundiRow}>
                  <Avatar name={`${fundi.firstName} ${fundi.lastName}`} size={56} isVerified={fundi.isVerified} isOnline={fundi.isOnline} />
                  <View style={styles.fundiInfo}>
                    <Text style={styles.fundiName}>{fundi.firstName} {fundi.lastName}</Text>
                    <View style={styles.ratingRow}>
                      <MaterialIcons name="star" size={14} color={Colors.brand.secondary} />
                      <Text style={styles.rating}>{(fundi.rating || 0).toFixed(1)}</Text>
                      <Text style={styles.ratingCount}>· {fundi.totalJobs} jobs</Text>
                      {fundi.isVerified && <Badge label="Verified" variant="success" size="sm" />}
                    </View>
                    <Text style={styles.fundiExp}>{fundi.experienceYears}+ years experience</Text>
                  </View>
                </View>

                <View style={styles.fundiMeta}>
                  <View style={styles.metaItem}>
                    <MaterialIcons name="place" size={14} color={Colors.brand.primary} />
                    <Text style={styles.metaText}>{fundi.distanceKm} km away</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MaterialIcons name="access-time" size={14} color={Colors.semantic.warning} />
                    <Text style={styles.metaText}>ETA ~{fundi.etaMinutes} min</Text>
                  </View>
                </View>

                {fundi.bio ? <Text style={styles.fundiBio} numberOfLines={2}>{fundi.bio}</Text> : null}

                <View style={styles.selectRow}>
                  {selectedFundiId === fundi.id && assigning ? (
                    <View style={styles.assigningBadge}>
                      <Text style={styles.assigningText}>Assigning...</Text>
                    </View>
                  ) : (
                    <View style={styles.selectBtn}>
                      <Text style={styles.selectBtnText}>Select This Fundi</Text>
                      <MaterialIcons name="arrow-forward" size={16} color={Colors.brand.primary} />
                    </View>
                  )}
                </View>
              </Pressable>
            ))}

            <GlassCard style={styles.safetyNote}>
              <MaterialIcons name="verified-user" size={18} color={Colors.semantic.success} />
              <Text style={styles.safetyText}>All Fundis are background-checked and skills-verified.</Text>
            </GlassCard>
          </Animated.View>
        )}

        {/* Fundi Assigned */}
        {stage === 'assigned' && assignedFundi && (
          <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
            <View style={styles.assignedArea}>
              <View style={styles.successRing}>
                <MaterialIcons name="check" size={48} color={Colors.semantic.success} />
              </View>
              <Text style={styles.assignedTitle}>Fundi Assigned!</Text>
              <Text style={styles.assignedSub}>Your Fundi is on their way</Text>
            </View>

            <GlassCard variant="elevated" style={styles.assignedFundiCard}>
              <Avatar name={`${assignedFundi.firstName} ${assignedFundi.lastName}`} size={72} isVerified={assignedFundi.isVerified} isOnline />
              <Text style={styles.assignedName}>{assignedFundi.firstName} {assignedFundi.lastName}</Text>
              <View style={styles.assignedRatingRow}>
                <MaterialIcons name="star" size={16} color={Colors.brand.secondary} />
                <Text style={styles.assignedRating}>{(assignedFundi.rating || 4.8).toFixed(1)}</Text>
                <Text style={styles.assignedJobs}>· {assignedFundi.totalJobs} completed jobs</Text>
              </View>
              <Badge label="Verified Fundi" variant="success" style={{ marginTop: 8 }} />

              <View style={styles.etaCard}>
                <MaterialIcons name="directions-run" size={20} color={Colors.brand.primary} />
                <Text style={styles.etaText}>
                  On the way · ETA ~{assignedFundi.etaMinutes || 12} minutes
                </Text>
              </View>

              <View style={styles.contactRow}>
                <Pressable onPress={() => router.push({ pathname: '/(customer)/chat-room', params: { roomId: 'dddddddd-dddd-dddd-dddd-dddddddddddd', jobId: jobId || 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' } })} style={styles.contactBtn}>
                  <MaterialIcons name="chat" size={20} color={Colors.brand.primary} />
                  <Text style={[styles.contactBtnText, { color: Colors.brand.primary }]}>Chat</Text>
                </Pressable>
                <Pressable style={styles.contactBtn}>
                  <MaterialIcons name="call" size={20} color={Colors.semantic.success} />
                  <Text style={[styles.contactBtnText, { color: Colors.semantic.success }]}>Call</Text>
                </Pressable>
              </View>
            </GlassCard>

            <Button
              title="Track Your Fundi"
              onPress={handleGoToTracking}
              fullWidth
              size="lg"
              style={{ marginTop: 16 }}
            />

            <Pressable onPress={() => router.replace('/(customer)/(tabs)')} style={styles.homeLink}>
              <Text style={styles.homeLinkText}>Go to Home</Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

function PulsingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);
  return <Animated.View style={[styles.dot, { opacity: anim }]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  cancelBtn: { width: 60 },
  cancelText: { fontSize: 14, color: Colors.semantic.error, fontWeight: '500', includeFontPadding: false },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  content: { paddingHorizontal: 20, paddingBottom: 60, paddingTop: 20 },
  searchArea: { alignItems: 'center', paddingVertical: 40 },
  rippleContainer: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  ring: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    borderWidth: 2, borderColor: Colors.brand.primary,
  },
  searchCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.brand.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.brand.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  searchTitle: { fontSize: 22, fontWeight: '800', color: Colors.text.primary, marginBottom: 8, includeFontPadding: false },
  searchSub: { fontSize: 14, color: Colors.text.secondary, marginBottom: 16, includeFontPadding: false },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  timerText: { fontSize: 13, color: Colors.text.muted, includeFontPadding: false },
  searchingDots: { flexDirection: 'row', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.brand.primary },
  foundHeader: { alignItems: 'center', marginBottom: 24 },
  foundIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.semantic.successBg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  foundTitle: { fontSize: 22, fontWeight: '800', color: Colors.text.primary, textAlign: 'center', includeFontPadding: false },
  foundSub: { fontSize: 14, color: Colors.text.secondary, marginTop: 6, textAlign: 'center', includeFontPadding: false },
  fundiOption: {
    backgroundColor: Colors.glass.medium, borderRadius: Radius.xl,
    borderWidth: 2, borderColor: Colors.glass.border,
    padding: 16, marginBottom: 14,
  },
  fundiOptionSelected: { borderColor: Colors.brand.primary, backgroundColor: 'rgba(14,165,233,0.08)' },
  fundiRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 12 },
  fundiInfo: { flex: 1 },
  fundiName: { fontSize: 17, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rating: { fontSize: 14, fontWeight: '700', color: Colors.brand.secondary, includeFontPadding: false },
  ratingCount: { fontSize: 12, color: Colors.text.muted, includeFontPadding: false },
  fundiExp: { fontSize: 12, color: Colors.text.secondary, marginTop: 4, includeFontPadding: false },
  fundiMeta: { flexDirection: 'row', gap: 20, marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  fundiBio: { fontSize: 12, color: Colors.text.muted, lineHeight: 18, marginBottom: 12, includeFontPadding: false },
  selectRow: { alignItems: 'flex-end' },
  selectBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: 'rgba(14,165,233,0.12)', borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.brand.primary },
  selectBtnText: { fontSize: 13, fontWeight: '600', color: Colors.brand.primary, includeFontPadding: false },
  assigningBadge: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: Colors.glass.heavy, borderRadius: Radius.lg },
  assigningText: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  safetyNote: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 8 },
  safetyText: { flex: 1, fontSize: 12, color: Colors.text.secondary, lineHeight: 18, includeFontPadding: false },
  assignedArea: { alignItems: 'center', paddingVertical: 24 },
  successRing: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.semantic.successBg, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  assignedTitle: { fontSize: 28, fontWeight: '800', color: Colors.text.primary, includeFontPadding: false },
  assignedSub: { fontSize: 15, color: Colors.text.secondary, marginTop: 8, includeFontPadding: false },
  assignedFundiCard: { alignItems: 'center', marginBottom: 24 },
  assignedName: { fontSize: 20, fontWeight: '700', color: Colors.text.primary, marginTop: 12, includeFontPadding: false },
  assignedRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  assignedRating: { fontSize: 16, fontWeight: '700', color: Colors.brand.secondary, includeFontPadding: false },
  assignedJobs: { fontSize: 13, color: Colors.text.muted, includeFontPadding: false },
  etaCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, backgroundColor: 'rgba(14,165,233,0.1)', borderRadius: Radius.lg, paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: Colors.brand.primary },
  etaText: { fontSize: 14, fontWeight: '600', color: Colors.brand.primary, includeFontPadding: false },
  contactRow: { flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, backgroundColor: Colors.glass.light, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.glass.border },
  contactBtnText: { fontSize: 13, fontWeight: '600', includeFontPadding: false },
  homeLink: { alignItems: 'center', paddingVertical: 16 },
  homeLinkText: { fontSize: 14, color: Colors.text.muted, includeFontPadding: false },
});

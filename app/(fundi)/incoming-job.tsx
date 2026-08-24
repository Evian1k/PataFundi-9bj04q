import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { APP_CONFIG } from '@/constants/config';

export default function IncomingJobScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [timeLeft, setTimeLeft] = useState(30);
  const [responded, setResponded] = useState<'accepted' | 'declined' | null>(null);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }).start();
    Animated.timing(progressAnim, { toValue: 0, duration: 30000, useNativeDriver: false }).start();

    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          router.back();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = () => {
    setResponded('accepted');
    setTimeout(() => router.replace('/(fundi)/active-job'), 1500);
  };

  const handleDecline = () => {
    setResponded('declined');
    setTimeout(() => router.back(), 1000);
  };

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }]}>
      <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
        {/* Timer Bar */}
        <View style={styles.timerBar}>
          <Animated.View style={[styles.timerProgress, { width: progressWidth }]} />
        </View>

        <View style={styles.header}>
          <View style={styles.incomingBadge}>
            <MaterialIcons name="notifications-active" size={18} color={Colors.brand.secondary} />
            <Text style={styles.incomingLabel}>New Job Request</Text>
          </View>
          <Text style={styles.countdown}>{timeLeft}s</Text>
        </View>

        {responded ? (
          <View style={styles.respondedArea}>
            <MaterialIcons
              name={responded === 'accepted' ? 'check-circle' : 'cancel'}
              size={64}
              color={responded === 'accepted' ? Colors.semantic.success : Colors.semantic.error}
            />
            <Text style={styles.respondedText}>
              {responded === 'accepted' ? 'Job Accepted! Loading...' : 'Job Declined'}
            </Text>
          </View>
        ) : (
          <>
            {/* Customer */}
            <View style={styles.customerRow}>
              <Avatar name="Amina Wanjiku" size={52} />
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>Amina W.</Text>
                <View style={styles.ratingRow}>
                  <MaterialIcons name="star" size={13} color={Colors.brand.secondary} />
                  <Text style={styles.rating}>4.7 customer rating</Text>
                </View>
              </View>
              <View style={styles.distanceArea}>
                <Text style={styles.distance}>2.3 km</Text>
                <Text style={styles.eta}>~12 min</Text>
              </View>
            </View>

            {/* Job Details */}
            <GlassCard style={styles.jobCard}>
              <View style={styles.serviceRow}>
                <MaterialIcons name="water" size={22} color={Colors.brand.primary} />
                <Text style={styles.serviceLabel}>Plumbing</Text>
              </View>
              <Text style={styles.jobTitle}>Kitchen Sink Leak</Text>
              <Text style={styles.jobDesc}>My kitchen sink has been leaking for 2 days. Water pooling under the cabinet.</Text>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <MaterialIcons name="location-on" size={14} color={Colors.text.muted} />
                  <Text style={styles.detailText}>Westlands, Nairobi</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="schedule" size={14} color={Colors.semantic.warning} />
                  <Text style={[styles.detailText, { color: Colors.semantic.warning }]}>Urgent</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="photo-camera" size={14} color={Colors.text.muted} />
                  <Text style={styles.detailText}>2 photos attached</Text>
                </View>
              </View>
            </GlassCard>

            {/* Estimated Earnings */}
            <GlassCard style={styles.earningsCard}>
              <Text style={styles.earningsLabel}>Your Estimated Earnings</Text>
              <Text style={styles.earningsValue}>{APP_CONFIG.currencySymbol} 3,500 – 5,000</Text>
              <Text style={styles.earningsNote}>Payment released after customer confirms completion</Text>
            </GlassCard>

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable onPress={handleDecline} style={styles.declineBtn}>
                <MaterialIcons name="close" size={22} color={Colors.semantic.error} />
                <Text style={styles.declineText}>Decline</Text>
              </Pressable>
              <Pressable onPress={handleAccept} style={styles.acceptBtn}>
                <MaterialIcons name="check" size={22} color="#FFF" />
                <Text style={styles.acceptText}>Accept Job</Text>
              </Pressable>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(10,22,40,0.9)', justifyContent: 'flex-end' },
  card: { backgroundColor: Colors.background.secondary, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, borderWidth: 1, borderColor: Colors.glass.border },
  timerBar: { height: 4, backgroundColor: Colors.glass.heavy, borderRadius: 2, marginBottom: 16, overflow: 'hidden' },
  timerProgress: { height: 4, backgroundColor: Colors.semantic.warning, borderRadius: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  incomingBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.semantic.warningBg, paddingVertical: 8, paddingHorizontal: 14, borderRadius: Radius.full },
  incomingLabel: { fontSize: 13, fontWeight: '700', color: Colors.semantic.warning, includeFontPadding: false },
  countdown: { fontSize: 22, fontWeight: '800', color: Colors.semantic.error, includeFontPadding: false },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  rating: { fontSize: 12, color: Colors.text.secondary, includeFontPadding: false },
  distanceArea: { alignItems: 'flex-end' },
  distance: { fontSize: 16, fontWeight: '700', color: Colors.brand.primary, includeFontPadding: false },
  eta: { fontSize: 12, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  jobCard: { marginBottom: 12 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  serviceLabel: { fontSize: 13, fontWeight: '600', color: Colors.brand.primary, includeFontPadding: false },
  jobTitle: { fontSize: 17, fontWeight: '700', color: Colors.text.primary, marginBottom: 6, includeFontPadding: false },
  jobDesc: { fontSize: 13, color: Colors.text.secondary, lineHeight: 19, marginBottom: 12, includeFontPadding: false },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 12, color: Colors.text.muted, includeFontPadding: false },
  earningsCard: { marginBottom: 20 },
  earningsLabel: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  earningsValue: { fontSize: 24, fontWeight: '800', color: Colors.brand.accent, marginTop: 4, includeFontPadding: false },
  earningsNote: { fontSize: 11, color: Colors.text.muted, marginTop: 4, includeFontPadding: false },
  actions: { flexDirection: 'row', gap: 12 },
  declineBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, backgroundColor: Colors.semantic.errorBg, borderRadius: Radius.full, borderWidth: 2, borderColor: Colors.semantic.error },
  declineText: { fontSize: 15, fontWeight: '700', color: Colors.semantic.error, includeFontPadding: false },
  acceptBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, backgroundColor: Colors.semantic.success, borderRadius: Radius.full, ...Shadow.lg },
  acceptText: { fontSize: 16, fontWeight: '700', color: '#FFF', includeFontPadding: false },
  respondedArea: { alignItems: 'center', paddingVertical: 32, gap: 16 },
  respondedText: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { fundiService } from '@/services/fundiService';
import { Fundi } from '@/types';
import { APP_CONFIG } from '@/constants/config';

export default function FundiProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fundiId } = useLocalSearchParams<{ fundiId?: string }>();
  const [fundi, setFundi] = useState<Fundi | null>(null);

  useEffect(() => {
    fundiService.getFundiById(fundiId || 'fundi_001').then(res => {
      if (res.success && res.data) setFundi(res.data);
    });
  }, [fundiId]);

  if (!fundi) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Fundi Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <GlassCard variant="elevated" style={styles.profileCard}>
          <View style={styles.profileTop}>
            <Avatar name={`${fundi.firstName} ${fundi.lastName}`} size={80} isOnline={fundi.isOnline} isVerified={fundi.verificationStatus === 'verified'} />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{fundi.firstName} {fundi.lastName}</Text>
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={16} color={Colors.brand.secondary} />
                <Text style={styles.rating}>{fundi.rating.toFixed(1)}</Text>
                <Text style={styles.totalJobs}>· {fundi.totalJobs} jobs</Text>
              </View>
              <View style={styles.badgeRow}>
                <Badge label="Verified" variant="success" icon="verified" size="sm" />
                <Badge label={fundi.isOnline ? 'Online' : 'Offline'} variant={fundi.isOnline ? 'success' : 'neutral'} size="sm" />
              </View>
            </View>
          </View>

          {fundi.bio ? <Text style={styles.bio}>{fundi.bio}</Text> : null}

          <View style={styles.statsRow}>
            {[
              { label: 'Rating', value: fundi.rating.toFixed(1), icon: 'star', color: Colors.brand.secondary },
              { label: 'Jobs', value: fundi.totalJobs.toString(), icon: 'check-circle', color: Colors.semantic.success },
              { label: 'Years', value: `${fundi.experienceYears}yr`, icon: 'work-history', color: Colors.brand.primary },
            ].map(s => (
              <View key={s.label} style={styles.statItem}>
                <MaterialIcons name={s.icon as any} size={18} color={s.color} />
                <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Skills */}
        <GlassCard style={styles.skillsCard}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.tagsRow}>
            {fundi.skills.map(skill => (
              <View key={skill} style={styles.tag}>
                <Text style={styles.tagText}>{skill}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Service Areas */}
        <GlassCard style={styles.areasCard}>
          <Text style={styles.sectionTitle}>Service Areas</Text>
          <View style={styles.tagsRow}>
            {fundi.serviceAreas.map(area => (
              <View key={area} style={[styles.tag, styles.areaTag]}>
                <MaterialIcons name="location-on" size={12} color={Colors.brand.primary} />
                <Text style={[styles.tagText, { color: Colors.brand.primary }]}>{area}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Book Button */}
        <Button
          title={`Request ${fundi.firstName}`}
          onPress={() => router.push({ pathname: '/(customer)/job-create', params: { category: fundi.serviceCategories[0] } })}
          fullWidth
          size="lg"
          variant="primary"
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
  placeholder: { width: 40 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  profileCard: { marginBottom: 14 },
  profileTop: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', marginBottom: 16 },
  profileInfo: { flex: 1, gap: 6 },
  name: { fontSize: 20, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 14, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  totalJobs: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  badgeRow: { flexDirection: 'row', gap: 6 },
  bio: { fontSize: 14, color: Colors.text.secondary, lineHeight: 22, marginBottom: 16, includeFontPadding: false },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.glass.border },
  statItem: { alignItems: 'center', gap: 4 },
  statVal: { fontSize: 18, fontWeight: '800', includeFontPadding: false },
  statLabel: { fontSize: 11, color: Colors.text.muted, includeFontPadding: false },
  skillsCard: { marginBottom: 14 },
  areasCard: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.primary, marginBottom: 12, includeFontPadding: false },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: Colors.glass.medium, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.glass.border },
  tagText: { fontSize: 13, fontWeight: '500', color: Colors.text.secondary, includeFontPadding: false },
  areaTag: { flexDirection: 'row', alignItems: 'center', gap: 4, borderColor: 'rgba(14,165,233,0.3)', backgroundColor: 'rgba(14,165,233,0.08)' },
});

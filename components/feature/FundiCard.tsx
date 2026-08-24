import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Fundi } from '@/types';
import { APP_CONFIG } from '@/constants/config';

interface FundiCardProps {
  fundi: Partial<Fundi>;
  distance?: number;
  eta?: string;
  onPress?: () => void;
  variant?: 'compact' | 'full';
}

export function FundiCard({ fundi, distance, eta, onPress, variant = 'full' }: FundiCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }]}
    >
      <View style={styles.row}>
        <Avatar
          name={`${fundi.firstName} ${fundi.lastName}`}
          uri={fundi.avatarUrl}
          size={56}
          isOnline={fundi.isOnline}
          isVerified={fundi.verificationStatus === 'verified' || fundi.isVerified}
        />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{fundi.firstName} {fundi.lastName}</Text>
            {fundi.verificationStatus === 'verified' || fundi.isVerified ? (
              <MaterialIcons name="verified" size={16} color={Colors.brand.primary} />
            ) : null}
          </View>
          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={14} color={Colors.brand.secondary} />
            <Text style={styles.rating}>{(fundi.rating || 0).toFixed(1)}</Text>
            <Text style={styles.jobs}>· {fundi.totalJobs || 0} jobs</Text>
          </View>
          {variant === 'full' && fundi.skills && (
            <Text style={styles.skills} numberOfLines={1}>
              {fundi.skills.slice(0, 2).join(' · ')}
            </Text>
          )}
        </View>
        <View style={styles.distanceArea}>
          {distance !== undefined ? (
            <>
              <Text style={styles.distance}>{distance.toFixed(1)} km</Text>
              {eta ? <Text style={styles.eta}>{eta}</Text> : null}
            </>
          ) : null}
        </View>
      </View>
      {variant === 'full' && fundi.serviceAreas && (
        <View style={styles.areasRow}>
          <MaterialIcons name="location-on" size={12} color={Colors.text.muted} />
          <Text style={styles.areas} numberOfLines={1}>
            {(fundi.serviceAreas || []).slice(0, 3).join(', ')}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.glass.medium,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    padding: 16,
    marginBottom: 12,
    ...Shadow.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.text.primary, includeFontPadding: false },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 2 },
  rating: { fontSize: 13, fontWeight: '600', color: Colors.text.primary, includeFontPadding: false },
  jobs: { fontSize: 12, color: Colors.text.secondary, includeFontPadding: false },
  skills: { fontSize: 12, color: Colors.text.secondary, marginTop: 4, includeFontPadding: false },
  distanceArea: { alignItems: 'flex-end' },
  distance: { fontSize: 13, fontWeight: '600', color: Colors.brand.primary, includeFontPadding: false },
  eta: { fontSize: 11, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  areasRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 4 },
  areas: { fontSize: 12, color: Colors.text.muted, flex: 1, includeFontPadding: false },
});

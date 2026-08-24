import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { Badge } from '@/components/ui/Badge';
import { Job, JobStatus } from '@/types';
import { APP_CONFIG, SERVICE_CATEGORIES } from '@/constants/config';

const STATUS_CONFIG: Record<JobStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'brand' }> = {
  requested: { label: 'Requested', variant: 'brand' },
  matching: { label: 'Finding Fundi', variant: 'brand' },
  fundi_assigned: { label: 'Fundi Assigned', variant: 'info' },
  fundi_accepted: { label: 'Fundi Accepted', variant: 'info' },
  on_the_way: { label: 'On The Way', variant: 'warning' },
  arrived: { label: 'Arrived', variant: 'warning' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  completed: { label: 'Completed', variant: 'neutral' },
  customer_confirmed: { label: 'Confirmed', variant: 'success' },
  payment_processing: { label: 'Processing Payment', variant: 'warning' },
  payment_complete: { label: 'Paid', variant: 'success' },
  reviewed: { label: 'Reviewed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'error' },
  disputed: { label: 'Disputed', variant: 'error' },
};

interface JobCardProps {
  job: Job;
  onPress?: () => void;
  variant?: 'customer' | 'fundi' | 'admin';
}

export function JobCard({ job, onPress, variant = 'customer' }: JobCardProps) {
  const status = STATUS_CONFIG[job.status] || { label: job.status, variant: 'neutral' };
  const category = SERVICE_CATEGORIES.find(c => c.id === job.serviceCategory);
  const isActive = ['matching', 'fundi_assigned', 'fundi_accepted', 'on_the_way', 'arrived', 'in_progress'].includes(job.status);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isActive && styles.activeCard,
        { opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <MaterialIcons name={(category?.icon || 'build') as any} size={16} color={category?.color || Colors.brand.primary} />
          <Text style={styles.categoryLabel}>{category?.name || job.serviceCategory}</Text>
        </View>
        <Badge label={status.label} variant={status.variant} size="sm" />
      </View>
      <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{job.description}</Text>
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <MaterialIcons name="location-on" size={13} color={Colors.text.muted} />
          <Text style={styles.footerText} numberOfLines={1}>{job.location.area || job.location.city}</Text>
        </View>
        <View style={styles.footerItem}>
          <MaterialIcons name="schedule" size={13} color={Colors.text.muted} />
          <Text style={styles.footerText}>{formatDate(job.createdAt)}</Text>
        </View>
        {(job.agreedPrice || job.estimatedPrice) ? (
          <Text style={styles.price}>
            {APP_CONFIG.currencySymbol} {(job.agreedPrice || job.estimatedPrice.estimatedTotal).toLocaleString()}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString();
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
  activeCard: { borderColor: Colors.brand.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryLabel: { fontSize: 13, fontWeight: '500', color: Colors.text.secondary, includeFontPadding: false },
  title: { fontSize: 16, fontWeight: '600', color: Colors.text.primary, marginBottom: 4, includeFontPadding: false },
  description: { fontSize: 13, color: Colors.text.secondary, lineHeight: 19, marginBottom: 12, includeFontPadding: false },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  footerText: { fontSize: 12, color: Colors.text.muted, includeFontPadding: false, maxWidth: 100 },
  price: { marginLeft: 'auto', fontSize: 15, fontWeight: '700', color: Colors.brand.secondary, includeFontPadding: false },
});

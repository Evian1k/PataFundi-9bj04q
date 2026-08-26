// PataFundi — Fundi Profile Tab (real data from Supabase)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { fundiService } from '@/services/fundiService';
import { useAuth } from '@/hooks/useAuth';
import { APP_CONFIG } from '@/constants/config';

export default function FundiProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [fundiProfile, setFundiProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fundiService.getFundiById(user.id).then(res => {
      setLoading(false);
      if (res.success && res.data) setFundiProfile(res.data);
    });
  }, [user?.id]);

  const sections = [
    {
      title: 'Professional',
      items: [
        { icon: 'badge', label: 'Skills & Services', color: Colors.brand.primary },
        { icon: 'photo-library', label: 'Portfolio', color: Colors.brand.secondary },
        { icon: 'description', label: 'Documents', color: Colors.semantic.warning },
        { icon: 'star', label: 'Reviews & Ratings', color: Colors.brand.accent },
      ],
    },
    {
      title: 'Payments',
      items: [
        { icon: 'account-balance', label: 'Bank Details', color: Colors.brand.accent },
        { icon: 'phone-android', label: 'M-Pesa Number', color: '#00A651' },
        { icon: 'history', label: 'Payout History', color: Colors.brand.primary },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: 'person', label: 'Personal Information', color: Colors.brand.primary },
        { icon: 'notifications', label: 'Notifications', color: Colors.semantic.warning },
        { icon: 'lock', label: 'Security', color: Colors.semantic.error },
        { icon: 'help', label: 'Help & Support', color: Colors.text.secondary },
      ],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Profile</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <GlassCard variant="elevated" style={styles.profileCard}>
          <Avatar name={`${user?.firstName} ${user?.lastName}`} size={72} isVerified={fundiProfile?.isVerified} isOnline={fundiProfile?.isOnline} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.badgeRow}>
              <Badge label="Fundi" variant="info" />
              {fundiProfile?.verificationStatus === 'verified' ? (
                <Badge label="Verified" variant="success" />
              ) : (
                <Badge label="Pending Verification" variant="warning" />
              )}
            </View>
          </View>
        </GlassCard>

        {/* Stats */}
        {fundiProfile && (
          <View style={styles.statsRow}>
            <GlassCard style={styles.statCard}>
              <MaterialIcons name="star" size={20} color={Colors.brand.secondary} />
              <Text style={styles.statValue}>{(fundiProfile.rating || 0).toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <MaterialIcons name="check-circle" size={20} color={Colors.semantic.success} />
              <Text style={styles.statValue}>{fundiProfile.totalJobs || 0}</Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <MaterialIcons name="schedule" size={20} color={Colors.brand.primary} />
              <Text style={styles.statValue}>{fundiProfile.experienceYears || 0}y</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </GlassCard>
          </View>
        )}

        {sections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <GlassCard style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <Pressable key={item.label} style={[styles.menuItem, idx < section.items.length - 1 && styles.menuBorder]}>
                  <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                    <MaterialIcons name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <MaterialIcons name="chevron-right" size={18} color={Colors.text.muted} />
                </Pressable>
              ))}
            </GlassCard>
          </View>
        ))}

        <Pressable onPress={() => logout()} style={({ pressed }) => [styles.logoutBtn, { opacity: pressed ? 0.8 : 1 }]}>
          <MaterialIcons name="logout" size={18} color={Colors.semantic.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
        <Text style={styles.version}>PataFundi v{APP_CONFIG.version}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text.primary, paddingHorizontal: 20, paddingVertical: 14, includeFontPadding: false },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  profileCard: { alignItems: 'center', marginBottom: 20, gap: 8 },
  profileInfo: { alignItems: 'center', gap: 6 },
  profileName: { fontSize: 20, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  profileEmail: { fontSize: 13, color: Colors.text.muted, includeFontPadding: false },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.text.primary, includeFontPadding: false },
  statLabel: { fontSize: 11, color: Colors.text.muted, includeFontPadding: false },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: Colors.text.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8, includeFontPadding: false },
  sectionCard: { gap: 0 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.glass.borderLight },
  menuIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.text.primary, includeFontPadding: false },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, backgroundColor: Colors.semantic.errorBg, borderRadius: Radius.xl, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.semantic.error, includeFontPadding: false },
  version: { textAlign: 'center', fontSize: 12, color: Colors.text.muted, marginBottom: 20, includeFontPadding: false },
});

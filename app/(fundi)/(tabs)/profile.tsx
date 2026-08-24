import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';
import { Avatar } from '@/components/ui/Avatar';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';

export default function FundiProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();

  const handleLogout = () => {
    showAlert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/auth/login'); } },
    ]);
  };

  const MENU = [
    { icon: 'person', label: 'Personal Information' },
    { icon: 'build', label: 'Skills & Services' },
    { icon: 'location-on', label: 'Service Areas' },
    { icon: 'photo-library', label: 'Portfolio' },
    { icon: 'account-balance', label: 'Bank Details' },
    { icon: 'verified', label: 'Verification Documents' },
    { icon: 'star', label: 'Reviews & Ratings' },
    { icon: 'help', label: 'Help Center' },
    { icon: 'security', label: 'Security' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Profile</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <GlassCard variant="elevated" style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Avatar name={`${user?.firstName} ${user?.lastName}`} size={72} isVerified isOnline />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              <View style={styles.badgeRow}>
                <Badge label="Verified Fundi" variant="success" icon="verified" size="sm" />
              </View>
            </View>
          </View>
          <View style={styles.statsRow}>
            {[{ v: '4.8', l: 'Rating' }, { v: '247', l: 'Jobs' }, { v: '8 yrs', l: 'Experience' }].map(s => (
              <View key={s.l} style={styles.statItem}>
                <Text style={styles.statVal}>{s.v}</Text>
                <Text style={styles.statLbl}>{s.l}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        <GlassCard noPadding style={styles.menuCard}>
          {MENU.map((item, idx) => (
            <Pressable key={item.label} style={[styles.menuItem, idx < MENU.length - 1 && styles.menuItemBorder]} onPress={() => {}}>
              <View style={styles.menuIcon}>
                <MaterialIcons name={item.icon as any} size={18} color={Colors.brand.accent} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <MaterialIcons name="chevron-right" size={20} color={Colors.text.muted} />
            </Pressable>
          ))}
        </GlassCard>

        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={20} color={Colors.semantic.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text.primary, paddingHorizontal: 20, paddingVertical: 16, includeFontPadding: false },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  profileCard: { marginBottom: 20 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  profileInfo: { flex: 1, gap: 6 },
  name: { fontSize: 20, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  email: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  badgeRow: {},
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.glass.border },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: Colors.text.primary, includeFontPadding: false },
  statLbl: { fontSize: 12, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  menuCard: { marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.glass.borderLight },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(20,184,166,0.1)', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.text.primary, includeFontPadding: false },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, backgroundColor: Colors.semantic.errorBg, borderRadius: Radius.xl, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  logoutText: { fontSize: 15, fontWeight: '600', color: Colors.semantic.error, includeFontPadding: false },
});

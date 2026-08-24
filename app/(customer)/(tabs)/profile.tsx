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

const MENU_SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon: 'person', label: 'Personal Information', route: null },
      { icon: 'location-on', label: 'Saved Locations', route: null },
      { icon: 'payment', label: 'Payment Methods', route: '/(customer)/(tabs)/payments' },
    ],
  },
  {
    title: 'Activity',
    items: [
      { icon: 'work', label: 'Job History', route: '/(customer)/(tabs)/jobs' },
      { icon: 'receipt', label: 'Receipts', route: null },
      { icon: 'notifications', label: 'Notifications', route: '/(customer)/notifications' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help', label: 'Help Center', route: null },
      { icon: 'security', label: 'Security & Privacy', route: null },
      { icon: 'star', label: 'Rate the App', route: null },
    ],
  },
];

export default function CustomerProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();

  const handleLogout = () => {
    showAlert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/auth/login'); } },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Profile</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <GlassCard variant="elevated" style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Avatar name={`${user?.firstName} ${user?.lastName}`} size={72} isVerified={user?.isVerified} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <Badge label="Customer" variant="brand" size="sm" />
            </View>
          </View>
          <Pressable style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </Pressable>
        </GlassCard>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[{ label: 'Total Jobs', value: '2' }, { label: 'Reviews Given', value: '1' }, { label: 'Saved Fundis', value: '3' }].map(s => (
            <GlassCard key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Menu */}
        {MENU_SECTIONS.map(section => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            <GlassCard noPadding>
              {section.items.map((item, idx) => (
                <Pressable
                  key={item.label}
                  onPress={() => item.route ? router.push(item.route as any) : null}
                  style={({ pressed }) => [
                    styles.menuItem,
                    idx < section.items.length - 1 && styles.menuItemBorder,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <View style={styles.menuIcon}>
                    <MaterialIcons name={item.icon as any} size={20} color={Colors.brand.primary} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <MaterialIcons name="chevron-right" size={20} color={Colors.text.muted} />
                </Pressable>
              ))}
            </GlassCard>
          </View>
        ))}

        {/* Logout */}
        <Pressable onPress={handleLogout} style={({ pressed }) => [styles.logoutBtn, { opacity: pressed ? 0.7 : 1 }]}>
          <MaterialIcons name="logout" size={20} color={Colors.semantic.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.version}>PataFundi v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text.primary, paddingHorizontal: 20, paddingVertical: 16, includeFontPadding: false },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  profileCard: { marginBottom: 20 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 20, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  profileEmail: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  editBtn: {
    alignItems: 'center', paddingVertical: 12, borderRadius: Radius.lg,
    backgroundColor: Colors.glass.medium, borderWidth: 1, borderColor: Colors.glass.border,
  },
  editBtnText: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, includeFontPadding: false },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.brand.primary, includeFontPadding: false },
  statLabel: { fontSize: 11, color: Colors.text.muted, textAlign: 'center', includeFontPadding: false },
  menuSection: { marginBottom: 20 },
  menuSectionTitle: { fontSize: 13, fontWeight: '600', color: Colors.text.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, includeFontPadding: false },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.glass.borderLight },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(14,165,233,0.1)', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.text.primary, includeFontPadding: false },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, marginTop: 12, backgroundColor: Colors.semantic.errorBg, borderRadius: Radius.xl, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  logoutText: { fontSize: 15, fontWeight: '600', color: Colors.semantic.error, includeFontPadding: false },
  version: { textAlign: 'center', fontSize: 12, color: Colors.text.muted, marginTop: 24, includeFontPadding: false },
});

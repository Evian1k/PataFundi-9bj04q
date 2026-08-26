// PataFundi — Customer Profile Screen (real data)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { APP_CONFIG } from '@/constants/config';

export default function CustomerProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: 'person', label: 'Personal Information', color: Colors.brand.primary },
        { icon: 'place', label: 'Saved Locations', color: Colors.brand.accent },
        { icon: 'credit-card', label: 'Payment Methods', color: '#00A651' },
      ],
    },
    {
      title: 'Activity',
      items: [
        { icon: 'work', label: 'Job History', color: Colors.brand.secondary, onPress: () => router.push('/(customer)/(tabs)/jobs') },
        { icon: 'receipt', label: 'Payment History', color: Colors.brand.accent, onPress: () => router.push('/(customer)/(tabs)/payments') },
        { icon: 'notifications', label: 'Notifications', color: Colors.semantic.warning, onPress: () => router.push('/(customer)/notifications') },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help', label: 'Help Center', color: Colors.brand.primary },
        { icon: 'support-agent', label: 'Contact Support', color: Colors.semantic.success },
        { icon: 'policy', label: 'Privacy Policy', color: Colors.text.secondary },
      ],
    },
    {
      title: 'Security',
      items: [
        { icon: 'lock', label: 'Change Password', color: Colors.semantic.warning },
        { icon: 'devices', label: 'Active Sessions', color: Colors.text.secondary },
      ],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Profile</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <GlassCard variant="elevated" style={styles.profileCard}>
          <Avatar name={`${user?.firstName} ${user?.lastName}`} size={72} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            {user?.phone ? <Text style={styles.profilePhone}>{user.phone}</Text> : null}
          </View>
          <Badge label="Customer" variant="info" />
        </GlassCard>

        {menuSections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <GlassCard style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <Pressable
                  key={item.label}
                  onPress={(item as any).onPress}
                  style={({ pressed }) => [styles.menuItem, idx < section.items.length - 1 && styles.menuItemBorder, { opacity: pressed ? 0.7 : 1 }]}
                >
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

        {/* Logout */}
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
  profileCard: { alignItems: 'center', marginBottom: 28, gap: 8 },
  profileInfo: { alignItems: 'center', gap: 4 },
  profileName: { fontSize: 20, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  profileEmail: { fontSize: 13, color: Colors.text.muted, includeFontPadding: false },
  profilePhone: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: Colors.text.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8, includeFontPadding: false },
  sectionCard: { gap: 0 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.glass.borderLight },
  menuIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.text.primary, includeFontPadding: false },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, backgroundColor: Colors.semantic.errorBg, borderRadius: Radius.xl, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.semantic.error, includeFontPadding: false },
  version: { textAlign: 'center', fontSize: 12, color: Colors.text.muted, marginBottom: 20, includeFontPadding: false },
});

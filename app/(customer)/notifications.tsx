// PataFundi — Customer Notifications Screen (real data)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';
import { Notification } from '@/types';

const NOTIF_ICONS: Record<string, { icon: string; color: string }> = {
  job_update: { icon: 'work', color: Colors.brand.primary },
  payment: { icon: 'payments', color: Colors.brand.accent },
  new_job: { icon: 'notifications-active', color: Colors.brand.secondary },
  earnings: { icon: 'account-balance-wallet', color: Colors.brand.accent },
  system: { icon: 'info', color: Colors.text.secondary },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadNotifications(); }, [user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    setLoading(true);
    const res = await notificationService.getNotifications(user.id);
    setLoading(false);
    if (res.success && res.data) setNotifications(res.data);
  };

  const onRefresh = async () => { setRefreshing(true); await loadNotifications(); setRefreshing(false); };

  const markRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await notificationService.markAsRead(id);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderNotif = ({ item }: { item: Notification }) => {
    const meta = NOTIF_ICONS[item.type] || NOTIF_ICONS.system;
    return (
      <Pressable onPress={() => markRead(item.id)} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
        <GlassCard style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}>
          <View style={[styles.notifIcon, { backgroundColor: `${meta.color}20` }]}>
            <MaterialIcons name={meta.icon as any} size={22} color={meta.color} />
          </View>
          <View style={styles.notifContent}>
            <Text style={styles.notifTitle}>{item.title}</Text>
            <Text style={styles.notifBody}>{item.body}</Text>
            <Text style={styles.notifTime}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
          {!item.isRead && <View style={styles.unreadDot} />}
        </GlassCard>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && <View style={styles.badgeCircle}><Text style={styles.badgeText}>{unreadCount}</Text></View>}
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: 20 }}>
          {[1,2,3].map(i => <SkeletonLoader key={i} width="100%" height={80} style={{ borderRadius: 14, marginBottom: 10 }} />)}
        </View>
      ) : notifications.length === 0 ? (
        <EmptyState icon="notifications-none" title="No Notifications" message="You are all caught up! Notifications will appear here." />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderNotif}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 20, fontWeight: '800', color: Colors.text.primary, includeFontPadding: false },
  badgeCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.semantic.error, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#FFF', includeFontPadding: false },
  list: { paddingHorizontal: 20, paddingBottom: 60 },
  notifCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 10 },
  notifCardUnread: { borderColor: Colors.brand.primary, borderWidth: 1.5 },
  notifIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  notifBody: { fontSize: 13, color: Colors.text.secondary, lineHeight: 18, marginTop: 4, includeFontPadding: false },
  notifTime: { fontSize: 11, color: Colors.text.muted, marginTop: 6, includeFontPadding: false },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.brand.primary, marginTop: 4, flexShrink: 0 },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';
import { Notification } from '@/types';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    notificationService.getNotifications(user?.id || 'cust_001', 'customer').then(res => {
      if (res.success && res.data) setNotifications(res.data);
    });
  }, []);

  const iconMap: Record<string, string> = {
    job_update: 'work',
    payment: 'payment',
    payout: 'account-balance-wallet',
    support_ticket: 'headset-mic',
    incoming_job: 'notifications-active',
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        <Pressable><Text style={styles.markAll}>Mark all read</Text></Pressable>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={[styles.notifItem, !item.isRead && styles.unread]}>
            <View style={[styles.notifIcon, { backgroundColor: item.isRead ? Colors.glass.light : 'rgba(14,165,233,0.15)' }]}>
              <MaterialIcons name={(iconMap[item.type] || 'notifications') as any} size={20} color={item.isRead ? Colors.text.secondary : Colors.brand.primary} />
            </View>
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifBody}>{item.body}</Text>
              <Text style={styles.notifTime}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 20, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  markAll: { fontSize: 13, color: Colors.brand.primary, fontWeight: '500', includeFontPadding: false },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  notifItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.glass.borderLight },
  unread: { backgroundColor: 'rgba(14,165,233,0.04)', borderRadius: Radius.lg, paddingHorizontal: 12 },
  notifIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, marginBottom: 3, includeFontPadding: false },
  notifBody: { fontSize: 13, color: Colors.text.secondary, lineHeight: 19, includeFontPadding: false },
  notifTime: { fontSize: 11, color: Colors.text.muted, marginTop: 5, includeFontPadding: false },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.brand.primary, marginTop: 4, flexShrink: 0 },
});

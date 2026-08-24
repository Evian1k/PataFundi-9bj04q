import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';

const MOCK_CHATS = [
  {
    id: 'room_job_001',
    jobId: 'job_001',
    fundiName: 'James Omondi',
    jobTitle: 'Kitchen Sink Leak',
    lastMessage: 'I found the issue. The P-trap seal has worn out.',
    time: '2m ago',
    unread: 1,
    isOnline: true,
  },
];

export default function CustomerChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Messages</Text>
      {MOCK_CHATS.length === 0 ? (
        <EmptyState icon="chat-bubble-outline" title="No messages yet" description="Messages will appear here once you have an active job." />
      ) : (
        <FlatList
          data={MOCK_CHATS}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: '/(customer)/chat-room', params: { roomId: item.id, jobId: item.jobId } })}
              style={({ pressed }) => [styles.chatItem, { opacity: pressed ? 0.85 : 1 }]}
            >
              <Avatar name={item.fundiName} size={52} isOnline={item.isOnline} />
              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatName}>{item.fundiName}</Text>
                  <Text style={styles.chatTime}>{item.time}</Text>
                </View>
                <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
              </View>
              {item.unread > 0 ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
              ) : null}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text.primary, paddingHorizontal: 20, paddingVertical: 16, includeFontPadding: false },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  chatItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.glass.medium,
    borderRadius: Radius.xl, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.glass.border,
  },
  chatContent: { flex: 1 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  chatName: { fontSize: 15, fontWeight: '600', color: Colors.text.primary, includeFontPadding: false },
  chatTime: { fontSize: 12, color: Colors.text.muted, includeFontPadding: false },
  jobTitle: { fontSize: 12, color: Colors.brand.primary, marginBottom: 3, includeFontPadding: false },
  lastMessage: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  unreadBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.brand.primary, alignItems: 'center', justifyContent: 'center' },
  unreadText: { fontSize: 11, fontWeight: '700', color: '#FFF', includeFontPadding: false },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { Avatar } from '@/components/ui/Avatar';
import { chatService } from '@/services/chatService';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/types';

export default function ChatRoomScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { roomId, jobId } = useLocalSearchParams<{ roomId?: string; jobId?: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
  }, [roomId]);

  const loadMessages = async () => {
    const res = await chatService.getMessages(roomId || 'room_job_001');
    if (res.success && res.data) {
      setMessages(res.data);
      setTimeout(() => listRef.current?.scrollToEnd(), 100);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    const res = await chatService.sendMessage({
      roomId: roomId || 'room_job_001',
      senderId: user?.id || 'cust_001',
      senderRole: 'customer',
      type: 'text',
      content: input.trim(),
    });
    if (res.success && res.data) {
      setMessages(prev => [...prev, res.data!]);
      setInput('');
      setTimeout(() => listRef.current?.scrollToEnd(), 100);
      // Simulate fundi typing response
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    }
    setSending(false);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === (user?.id || 'cust_001');
    const isSystem = item.type === 'system';

    if (isSystem) {
      return (
        <View style={styles.systemMsg}>
          <Text style={styles.systemMsgText}>{item.content}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        {!isMe && <Avatar name="James Omondi" size={32} />}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.content}</Text>
          <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {isMe && <MaterialIcons name={item.readBy.length > 1 ? 'done-all' : 'done'} size={12} color={item.readBy.length > 1 ? Colors.brand.primary : Colors.text.muted} />}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
        </Pressable>
        <Avatar name="James Omondi" size={36} isOnline />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>James Omondi</Text>
          <Text style={styles.headerStatus}>Kitchen Sink Leak</Text>
        </View>
        <Pressable style={styles.callBtn}>
          <MaterialIcons name="call" size={22} color={Colors.semantic.success} />
        </Pressable>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={renderMessage}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd()}
        ListFooterComponent={isTyping ? (
          <View style={styles.typingIndicator}>
            <Avatar name="James Omondi" size={28} />
            <View style={styles.typingBubble}>
              {[0, 1, 2].map(i => <View key={i} style={styles.typingDot} />)}
            </View>
          </View>
        ) : null}
      />

      {/* Input */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable style={styles.attachBtn}>
          <MaterialIcons name="attach-file" size={22} color={Colors.text.secondary} />
        </Pressable>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor={Colors.text.muted}
          style={styles.chatInput}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={handleSend}
          disabled={!input.trim() || sending}
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
        >
          <MaterialIcons name="send" size={20} color={input.trim() ? '#FFF' : Colors.text.muted} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.glass.borderLight, gap: 12 },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 15, fontWeight: '600', color: Colors.text.primary, includeFontPadding: false },
  headerStatus: { fontSize: 12, color: Colors.text.muted, includeFontPadding: false },
  callBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  messageList: { padding: 16, gap: 12 },
  systemMsg: { alignSelf: 'center', backgroundColor: Colors.glass.light, borderRadius: Radius.full, paddingVertical: 6, paddingHorizontal: 14 },
  systemMsgText: { fontSize: 12, color: Colors.text.muted, textAlign: 'center', includeFontPadding: false },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowMe: { flexDirection: 'row-reverse' },
  bubble: { maxWidth: '75%', borderRadius: Radius.xl, padding: 12 },
  bubbleMe: { backgroundColor: Colors.brand.primary, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: Colors.glass.medium, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, color: Colors.text.secondary, lineHeight: 22, includeFontPadding: false },
  bubbleTextMe: { color: '#FFF' },
  bubbleTime: { fontSize: 10, color: Colors.text.muted, marginTop: 4, alignSelf: 'flex-end', includeFontPadding: false },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.7)' },
  typingIndicator: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  typingBubble: { flexDirection: 'row', gap: 4, backgroundColor: Colors.glass.medium, borderRadius: Radius.xl, padding: 14, alignItems: 'center' },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.text.secondary },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 12, gap: 10, borderTopWidth: 1, borderTopColor: Colors.glass.borderLight },
  attachBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  chatInput: { flex: 1, backgroundColor: Colors.glass.medium, borderRadius: Radius.xl, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: Colors.text.primary, maxHeight: 100, borderWidth: 1, borderColor: Colors.glass.border },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.brand.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: Colors.glass.medium },
});

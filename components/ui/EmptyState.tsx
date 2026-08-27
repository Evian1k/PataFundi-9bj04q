import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography } from '@/constants/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  message?: string;  // alias for description
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'inbox', title, description, message, actionLabel, onAction }: EmptyStateProps) {
  const body = description || message;
  return (
    <View style={styles.container}>
      <View style={styles.iconBg}>
        <MaterialIcons name={icon as any} size={40} color={Colors.text.muted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.description}>{body}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} variant="glass" size="md" style={{ marginTop: 16 }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  iconBg: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.glass.light,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '600', color: Colors.text.primary, textAlign: 'center', includeFontPadding: false },
  description: { fontSize: 14, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22, includeFontPadding: false },
});

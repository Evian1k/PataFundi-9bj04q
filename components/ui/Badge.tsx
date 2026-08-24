import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'brand';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, variant = 'neutral', icon, size = 'md' }: BadgeProps) {
  const variantStyles = {
    success: { bg: Colors.semantic.successBg, text: Colors.semantic.success },
    warning: { bg: Colors.semantic.warningBg, text: Colors.semantic.warning },
    error: { bg: Colors.semantic.errorBg, text: Colors.semantic.error },
    info: { bg: Colors.semantic.infoBg, text: Colors.semantic.info },
    neutral: { bg: Colors.glass.light, text: Colors.text.secondary },
    brand: { bg: 'rgba(14,165,233,0.15)', text: Colors.brand.primary },
  };

  const { bg, text } = variantStyles[variant];
  const fontSize = size === 'sm' ? 11 : 13;
  const padding = size === 'sm' ? { paddingVertical: 3, paddingHorizontal: 8 } : { paddingVertical: 5, paddingHorizontal: 12 };

  return (
    <View style={[styles.base, { backgroundColor: bg }, padding]}>
      {icon ? <MaterialIcons name={icon as any} size={size === 'sm' ? 11 : 13} color={text} style={{ marginRight: 4 }} /> : null}
      <Text style={[styles.text, { color: text, fontSize }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.full, alignSelf: 'flex-start' },
  text: { fontWeight: '600', includeFontPadding: false },
});

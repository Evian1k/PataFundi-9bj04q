import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Colors, Radius, Shadow } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'light' | 'medium' | 'heavy' | 'elevated';
  noPadding?: boolean;
}

export function GlassCard({ children, style, variant = 'medium', noPadding = false }: GlassCardProps) {
  const variantStyles: Record<string, ViewStyle> = {
    light: { backgroundColor: Colors.glass.light, borderColor: Colors.glass.borderLight },
    medium: { backgroundColor: Colors.glass.medium, borderColor: Colors.glass.border },
    heavy: { backgroundColor: Colors.glass.heavy, borderColor: Colors.glass.border },
    elevated: { backgroundColor: Colors.background.elevated, borderColor: Colors.glass.border },
  };

  return (
    <View style={[
      styles.base,
      variantStyles[variant],
      noPadding ? {} : styles.padding,
      Shadow.sm,
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  padding: {
    padding: 16,
  },
});

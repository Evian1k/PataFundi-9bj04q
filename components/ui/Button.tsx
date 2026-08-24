import React from 'react';
import { Pressable, Text, View, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, Radius, Shadow } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'glass';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: { backgroundColor: Colors.brand.primary, ...Shadow.brand },
    secondary: { backgroundColor: Colors.brand.secondary, ...Shadow.amber },
    ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.glass.border },
    danger: { backgroundColor: Colors.semantic.error },
    success: { backgroundColor: Colors.semantic.success },
    glass: { backgroundColor: Colors.glass.medium, borderWidth: 1, borderColor: Colors.glass.border },
  };

  const textColors: Record<ButtonVariant, string> = {
    primary: '#FFFFFF',
    secondary: '#0A1628',
    ghost: Colors.text.primary,
    danger: '#FFFFFF',
    success: '#FFFFFF',
    glass: Colors.text.primary,
  };

  const sizeStyles: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; minHeight: number }> = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 36 },
    md: { paddingVertical: 14, paddingHorizontal: 24, minHeight: 50 },
    lg: { paddingVertical: 18, paddingHorizontal: 32, minHeight: 58 },
  };

  const textSizes: Record<ButtonSize, number> = { sm: 13, md: 15, lg: 17 };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        { opacity: isDisabled ? 0.5 : pressed ? 0.82 : 1 },
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} size="small" />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
          <Text style={[
            styles.text,
            { color: textColors[variant], fontSize: textSizes[size] },
            textStyle,
          ]}>
            {title}
          </Text>
          {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { width: '100%' },
  pressed: { transform: [{ scale: 0.97 }] },
  content: { flexDirection: 'row', alignItems: 'center' },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
});

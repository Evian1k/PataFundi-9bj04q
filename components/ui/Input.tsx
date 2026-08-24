import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Radius } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  isPassword = false,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error
    ? Colors.semantic.error
    : isFocused
    ? Colors.brand.primary
    : Colors.glass.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrapper, { borderColor }]}>
        {leftIcon ? (
          <MaterialIcons name={leftIcon as any} size={20} color={Colors.text.secondary} style={styles.leftIcon} />
        ) : null}
        <TextInput
          {...props}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, leftIcon ? styles.inputWithLeftIcon : null]}
          placeholderTextColor={Colors.text.muted}
          selectionColor={Colors.brand.primary}
          accessibilityLabel={label || props.placeholder}
        />
        {isPassword ? (
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.rightIconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={Colors.text.secondary} />
          </Pressable>
        ) : rightIcon ? (
          <Pressable onPress={onRightIconPress} style={styles.rightIconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name={rightIcon as any} size={20} color={Colors.text.secondary} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <MaterialIcons name="error-outline" size={14} color={Colors.semantic.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 4 },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 8,
    includeFontPadding: false,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass.light,
    borderWidth: 1,
    borderRadius: Radius.lg,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  leftIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
    paddingVertical: 14,
    includeFontPadding: false,
  },
  inputWithLeftIcon: { paddingLeft: 4 },
  rightIconBtn: { padding: 4 },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  errorText: { fontSize: 12, color: Colors.semantic.error, includeFontPadding: false },
  hintText: { fontSize: 12, color: Colors.text.muted, marginTop: 6, includeFontPadding: false },
});

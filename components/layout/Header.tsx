import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Shadow } from '@/constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightContent?: React.ReactNode;
  transparent?: boolean;
  style?: ViewStyle;
  onBack?: () => void;
}

export function Header({ title, subtitle, showBack = false, rightContent, transparent = false, style, onBack }: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      { paddingTop: insets.top + 8 },
      !transparent && styles.solidBg,
      style,
    ]}>
      <View style={styles.content}>
        {showBack ? (
          <Pressable
            onPress={onBack || (() => router.back())}
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.7 : 1 }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
          </Pressable>
        ) : <View style={styles.placeholder} />}

        <View style={styles.titleArea}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>

        <View style={styles.right}>
          {rightContent || <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 12, paddingHorizontal: 16 },
  solidBg: {
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.borderLight,
  },
  content: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  titleArea: { flex: 1, alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '600', color: Colors.text.primary, includeFontPadding: false },
  subtitle: { fontSize: 12, color: Colors.text.secondary, marginTop: 2, includeFontPadding: false },
  right: { width: 40, alignItems: 'flex-end' },
  placeholder: { width: 40 },
});

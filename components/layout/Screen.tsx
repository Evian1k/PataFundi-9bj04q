import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar, ViewStyle, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  safeTop?: boolean;
  safeBottom?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  backgroundColor?: string;
}

export function Screen({
  children,
  scrollable = false,
  style,
  contentStyle,
  safeTop = true,
  safeBottom = true,
  refreshing = false,
  onRefresh,
  backgroundColor = Colors.background.primary,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const paddingTop = safeTop ? insets.top : 0;
  const paddingBottom = safeBottom ? Math.max(insets.bottom, 16) : 16;

  if (scrollable) {
    return (
      <View style={[styles.root, { backgroundColor }, style]}>
        <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            { paddingTop, paddingBottom },
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />
          ) : undefined}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor, paddingTop, paddingBottom }, style]}>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

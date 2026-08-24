import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/theme';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = 40, color = Colors.brand.primary, message, fullScreen = false }: LoadingSpinnerProps) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      })
    ).start();
  }, [rotation]);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const content = (
    <View style={styles.center}>
      <Animated.View style={[
        styles.spinner,
        { width: size, height: size, borderRadius: size / 2, borderColor: color, borderTopColor: 'transparent', transform: [{ rotate: spin }] },
      ]} />
      {message ? <Text style={[styles.message, { color }]}>{message}</Text> : null}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        {content}
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  spinner: { borderWidth: 3 },
  message: { fontSize: 14, fontWeight: '500', includeFontPadding: false },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});

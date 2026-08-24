import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';

interface AvatarProps {
  name?: string;
  uri?: string;
  size?: number;
  isOnline?: boolean;
  isVerified?: boolean;
  style?: ViewStyle;
}

export function Avatar({ name, uri, size = 44, isOnline, isVerified, style }: AvatarProps) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const fontSize = size * 0.38;
  const badgeSize = size * 0.32;
  const verifiedSize = size * 0.36;

  return (
    <View style={[{ width: size, height: size }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2, backgroundColor: Colors.background.elevated }]}>
          <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
        </View>
      )}
      {isOnline !== undefined ? (
        <View style={[
          styles.onlineDot,
          {
            width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2,
            backgroundColor: isOnline ? Colors.status.online : Colors.status.offline,
            bottom: 0, right: 0,
          },
        ]} />
      ) : null}
      {isVerified ? (
        <View style={[styles.verifiedBadge, { bottom: -2, right: -2 }]}>
          <MaterialIcons name="verified" size={verifiedSize} color={Colors.brand.primary} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {},
  placeholder: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.glass.border },
  initials: { color: Colors.text.primary, fontWeight: '600', includeFontPadding: false },
  onlineDot: { position: 'absolute', borderWidth: 2, borderColor: Colors.background.primary },
  verifiedBadge: { position: 'absolute' },
});

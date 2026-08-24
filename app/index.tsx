// PataFundi — Splash Screen & Role Router
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Colors, Typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    // Glow pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1.08, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Navigate after loading
    const timer = setTimeout(() => {
      if (!isLoading) {
        navigateBasedOnRole();
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [isLoading]);

  function navigateBasedOnRole() {
    if (!user) {
      router.replace('/onboarding');
      return;
    }
    switch (user.role) {
      case 'customer': router.replace('/(customer)/(tabs)'); break;
      case 'fundi': router.replace('/(fundi)/(tabs)'); break;
      case 'super_admin': router.replace('/(admin)/(tabs)'); break;
      case 'staff': router.replace('/(staff)'); break;
      default: router.replace('/onboarding');
    }
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/splash.png')}
        style={styles.bg}
        contentFit="cover"
        transition={0}
      />
      <View style={styles.overlay} />

      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Animated.View style={[styles.glowRing, { transform: [{ scale: glowPulse }] }]} />
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>P</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.textArea, { opacity: taglineOpacity }]}>
        <Text style={styles.appName}>PataFundi</Text>
        <Text style={styles.tagline}>Trusted Professionals, On Demand</Text>
      </Animated.View>

      <View style={styles.loadingDots}>
        {[0, 1, 2].map(i => <DotAnimation key={i} delay={i * 200} />)}
      </View>
    </View>
  );
}

function DotAnimation({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.2)).current;
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.2, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);
  return <Animated.View style={[styles.dot, { opacity }]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background.primary },
  bg: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,22,40,0.6)' },
  logoContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  glowRing: {
    position: 'absolute',
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(14,165,233,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.3)',
  },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoLetter: { fontSize: 52, fontWeight: '800', color: '#FFFFFF', includeFontPadding: false },
  textArea: { alignItems: 'center', gap: 8 },
  appName: { fontSize: 36, fontWeight: '800', color: Colors.text.primary, letterSpacing: 1, includeFontPadding: false },
  tagline: { fontSize: 15, color: Colors.text.secondary, fontWeight: '400', includeFontPadding: false },
  loadingDots: { position: 'absolute', bottom: 80, flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.brand.primary },
});

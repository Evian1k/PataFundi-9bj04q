import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, Animated, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    image: require('@/assets/images/onboarding1.png'),
    title: 'Find Trusted Fundis Instantly',
    subtitle: 'Connect with verified, skilled professionals near you. From plumbing to electrical — we have got you covered.',
    accent: Colors.brand.primary,
  },
  {
    id: '2',
    image: require('@/assets/images/onboarding2.png'),
    title: 'Every Fundi is Verified',
    subtitle: 'We background-check, skill-test, and verify every professional. Your safety and satisfaction are our priority.',
    accent: Colors.brand.accent,
  },
  {
    id: '3',
    image: require('@/assets/images/onboarding3.png'),
    title: 'Pay Securely, Every Time',
    subtitle: 'Funds are held safely until you confirm work is complete. M-Pesa, card, or wallet — your choice.',
    accent: Colors.brand.secondary,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/auth/login');
    }
  };

  const handleSkip = () => router.replace('/auth/login');

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item.image} style={styles.slideImage} contentFit="cover" transition={300} />
            <View style={styles.overlay} />
            <View style={styles.slideContent}>
              <View style={[styles.accentLine, { backgroundColor: item.accent }]} />
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
        keyExtractor={item => item.id}
      />

      {/* Bottom Controls */}
      <View style={styles.controls}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp' });
            const dotOpacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity: dotOpacity, backgroundColor: SLIDES[currentIndex]?.accent || Colors.brand.primary }]}
              />
            );
          })}
        </View>

        <View style={styles.btnRow}>
          {currentIndex < SLIDES.length - 1 ? (
            <>
              <Pressable onPress={handleSkip} style={({ pressed }) => [styles.skipBtn, { opacity: pressed ? 0.6 : 1 }]}>
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
              <Button title="Next" onPress={handleNext} size="md" style={styles.nextBtn} />
            </>
          ) : (
            <View style={styles.finalBtns}>
              <Button title="Get Started as Customer" onPress={() => router.push('/auth/signup?role=customer')} variant="primary" fullWidth />
              <Button title="Join as a Fundi" onPress={() => router.push('/auth/signup?role=fundi')} variant="glass" fullWidth style={{ marginTop: 12 }} />
              <Pressable onPress={() => router.push('/auth/login')} style={styles.loginLink}>
                <Text style={styles.loginLinkText}>Already have an account? <Text style={{ color: Colors.brand.primary }}>Sign In</Text></Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  slide: { width, height },
  slideImage: { width, height },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,22,40,0.55)',
  },
  slideContent: {
    position: 'absolute',
    bottom: 200,
    left: 32,
    right: 32,
  },
  accentLine: { width: 48, height: 4, borderRadius: 2, marginBottom: 20 },
  slideTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.text.primary,
    lineHeight: 38,
    marginBottom: 16,
    includeFontPadding: false,
  },
  slideSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 26,
    includeFontPadding: false,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0, right: 0,
    padding: 32,
    paddingBottom: 48,
    backgroundColor: Colors.background.overlay,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 24 },
  dot: { height: 8, borderRadius: 4 },
  btnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skipBtn: { padding: 8 },
  skipText: { fontSize: 15, color: Colors.text.secondary, fontWeight: '500', includeFontPadding: false },
  nextBtn: { flex: 1, marginLeft: 40 },
  finalBtns: { width: '100%' },
  loginLink: { alignItems: 'center', marginTop: 20 },
  loginLinkText: { fontSize: 14, color: Colors.text.secondary, includeFontPadding: false },
});

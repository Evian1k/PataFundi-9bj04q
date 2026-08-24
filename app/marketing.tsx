// PataFundi Public Marketing Website
// Promotes to: Customers, Fundis, Businesses
// NEVER exposes: Admin dashboards, Staff portals, Internal systems
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { SERVICE_CATEGORIES } from '@/constants/config';

const HOW_IT_WORKS = [
  { step: '1', title: 'Tell us what you need', desc: 'Choose the service, describe the problem, and tell us your location.', icon: 'search' },
  { step: '2', title: 'We find your Fundi', desc: 'We instantly match you with verified, skilled professionals nearby.', icon: 'person-search' },
  { step: '3', title: 'Fundi arrives & works', desc: 'Your Fundi arrives, does the work, and you confirm when satisfied.', icon: 'build' },
  { step: '4', title: 'Pay securely', desc: 'Pay only after confirming work is complete. M-Pesa, card, or wallet.', icon: 'payment' },
];

const TRUST_POINTS = [
  { icon: 'verified', title: 'Background Checked', desc: 'Every Fundi undergoes identity verification and background screening.' },
  { icon: 'star', title: 'Skill Tested', desc: 'Fundis pass skill assessments before joining the platform.' },
  { icon: 'security', title: 'Insured Work', desc: 'All jobs are covered by our service guarantee.' },
  { icon: 'lock', title: 'Secure Payments', desc: 'Funds are held safely until you confirm work is complete.' },
];

const FAQ = [
  { q: 'How quickly can I get a Fundi?', a: 'Emergency requests are typically matched within 15 minutes. Standard requests within 1-4 hours.' },
  { q: 'What if I am not satisfied with the work?', a: 'We have a satisfaction guarantee. Report any issues within 24 hours and we will resolve them.' },
  { q: 'How does payment work?', a: 'You pay after confirming the work is complete. We support M-Pesa, credit cards, and our wallet.' },
  { q: 'Is it safe to let a Fundi into my home?', a: 'Every Fundi is ID-verified, background-checked, and rated by past customers. Their profiles show full history.' },
];

export default function MarketingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
      {/* Nav */}
      <View style={styles.nav}>
        <View style={styles.navLogo}>
          <View style={styles.logoCircle}><Text style={styles.logoLetter}>P</Text></View>
          <Text style={styles.logoText}>PataFundi</Text>
        </View>
        <Button title="Sign In" onPress={() => router.push('/auth/login')} size="sm" variant="glass" />
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTag}>Trusted · Verified · On Demand</Text>
        <Text style={styles.heroTitle}>Find a Skilled Fundi{'\n'}Near You, Instantly</Text>
        <Text style={styles.heroSubtitle}>Connect with verified plumbers, electricians, cleaners, and more — all background-checked and ready to help today.</Text>
        <View style={styles.heroBtns}>
          <Button title="Find a Fundi" onPress={() => router.push('/auth/signup?role=customer')} fullWidth size="lg" variant="secondary" />
          <Button title="Become a Fundi" onPress={() => router.push('/auth/signup?role=fundi')} fullWidth size="lg" variant="ghost" style={{ marginTop: 12 }} />
        </View>
        <View style={styles.heroStats}>
          {[['14,800+', 'Happy Customers'], ['2,900+', 'Verified Fundis'], ['89,000+', 'Jobs Completed'], ['4.8★', 'Average Rating']].map(([v, l]) => (
            <View key={l} style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{v}</Text>
              <Text style={styles.heroStatLabel}>{l}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services We Cover</Text>
        <Text style={styles.sectionSubtitle}>From urgent repairs to home improvements — we have a verified professional for every need.</Text>
        <View style={styles.servicesGrid}>
          {SERVICE_CATEGORIES.slice(0, 8).map(cat => (
            <Pressable key={cat.id} onPress={() => router.push('/auth/signup?role=customer')} style={({ pressed }) => [styles.serviceCard, { opacity: pressed ? 0.85 : 1 }]}>
              <View style={[styles.serviceIcon, { backgroundColor: `${cat.color}20` }]}>
                <MaterialIcons name={cat.icon as any} size={24} color={cat.color} />
              </View>
              <Text style={styles.serviceName}>{cat.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* How It Works */}
      <View style={[styles.section, styles.darkSection]}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        {HOW_IT_WORKS.map((item, i) => (
          <View key={item.step} style={styles.howItem}>
            <View style={styles.howStep}><Text style={styles.howStepText}>{item.step}</Text></View>
            <View style={styles.howContent}>
              <View style={styles.howIconBg}>
                <MaterialIcons name={item.icon as any} size={20} color={Colors.brand.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.howTitle}>{item.title}</Text>
                <Text style={styles.howDesc}>{item.desc}</Text>
              </View>
            </View>
            {i < HOW_IT_WORKS.length - 1 && <View style={styles.howConnector} />}
          </View>
        ))}
      </View>

      {/* Safety & Trust */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety & Trust First</Text>
        <Text style={styles.sectionSubtitle}>Your safety is not an afterthought. It is built into every step of how PataFundi works.</Text>
        {TRUST_POINTS.map(point => (
          <GlassCard key={point.title} style={styles.trustCard}>
            <View style={styles.trustIcon}>
              <MaterialIcons name={point.icon as any} size={22} color={Colors.brand.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.trustTitle}>{point.title}</Text>
              <Text style={styles.trustDesc}>{point.desc}</Text>
            </View>
          </GlassCard>
        ))}
      </View>

      {/* Become a Fundi */}
      <View style={[styles.section, styles.fundiSection]}>
        <MaterialIcons name="build" size={36} color={Colors.brand.accent} />
        <Text style={styles.fundiTitle}>Are You a Skilled Professional?</Text>
        <Text style={styles.fundiDesc}>Join thousands of Fundis earning good income doing what they love. Set your own schedule and build your reputation.</Text>
        <View style={styles.fundiBenefits}>
          {['Earn flexible income', 'Build your reputation', 'Get verified badge', 'Instant payments'].map(b => (
            <View key={b} style={styles.fundiBenefit}>
              <MaterialIcons name="check-circle" size={16} color={Colors.brand.accent} />
              <Text style={styles.fundiBenefitText}>{b}</Text>
            </View>
          ))}
        </View>
        <Button title="Apply as a Fundi" onPress={() => router.push('/auth/signup?role=fundi')} fullWidth size="lg" variant="success" style={{ marginTop: 16 }} />
      </View>

      {/* FAQ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {FAQ.map((item, i) => (
          <Pressable key={i} onPress={() => setExpandedFaq(expandedFaq === i ? null : i)} style={styles.faqItem}>
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{item.q}</Text>
              <MaterialIcons name={expandedFaq === i ? 'expand-less' : 'expand-more'} size={22} color={Colors.text.secondary} />
            </View>
            {expandedFaq === i && <Text style={styles.faqAnswer}>{item.a}</Text>}
          </Pressable>
        ))}
      </View>

      {/* Footer CTA */}
      <View style={[styles.section, styles.footerCta]}>
        <Text style={styles.footerCtaTitle}>Ready to get started?</Text>
        <Button title="Get Started Today" onPress={() => router.push('/auth/signup')} fullWidth size="lg" variant="secondary" />
        <Pressable onPress={() => router.push('/auth/login')} style={{ alignItems: 'center', marginTop: 16 }}>
          <Text style={styles.footerLoginLink}>Already have an account? Sign In →</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.footerLogo}>PataFundi</Text>
        <Text style={styles.footerTagline}>Trusted Professionals, On Demand</Text>
        <Text style={styles.footerLinks}>For Customers · For Fundis · For Businesses</Text>
        <Text style={styles.footerCopy}>© 2026 PataFundi. All rights reserved.</Text>
        <Text style={styles.footerContact}>support@patafundi.com</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  navLogo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.brand.primary, alignItems: 'center', justifyContent: 'center' },
  logoLetter: { fontSize: 18, fontWeight: '800', color: '#FFF', includeFontPadding: false },
  logoText: { fontSize: 18, fontWeight: '800', color: Colors.text.primary, includeFontPadding: false },
  hero: { padding: 24, paddingTop: 16, paddingBottom: 36 },
  heroTag: { fontSize: 12, fontWeight: '700', color: Colors.brand.primary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16, includeFontPadding: false },
  heroTitle: { fontSize: 34, fontWeight: '800', color: Colors.text.primary, lineHeight: 42, marginBottom: 16, includeFontPadding: false },
  heroSubtitle: { fontSize: 16, color: Colors.text.secondary, lineHeight: 26, marginBottom: 28, includeFontPadding: false },
  heroBtns: { marginBottom: 32 },
  heroStats: { flexDirection: 'row', justifyContent: 'space-between' },
  heroStat: { alignItems: 'center' },
  heroStatVal: { fontSize: 18, fontWeight: '800', color: Colors.brand.secondary, includeFontPadding: false },
  heroStatLabel: { fontSize: 11, color: Colors.text.muted, textAlign: 'center', marginTop: 3, includeFontPadding: false },
  section: { padding: 24, paddingVertical: 36 },
  darkSection: { backgroundColor: Colors.background.secondary },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: Colors.text.primary, marginBottom: 10, includeFontPadding: false },
  sectionSubtitle: { fontSize: 15, color: Colors.text.secondary, lineHeight: 24, marginBottom: 24, includeFontPadding: false },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  serviceCard: { width: '22%', alignItems: 'center', gap: 8 },
  serviceIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  serviceName: { fontSize: 11, color: Colors.text.secondary, textAlign: 'center', includeFontPadding: false },
  howItem: { marginBottom: 4 },
  howStep: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.brand.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  howStepText: { fontSize: 14, fontWeight: '800', color: '#FFF', includeFontPadding: false },
  howContent: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 8 },
  howIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.glass.medium, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  howTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, marginBottom: 4, includeFontPadding: false },
  howDesc: { fontSize: 13, color: Colors.text.secondary, lineHeight: 20, includeFontPadding: false },
  howConnector: { width: 2, height: 24, backgroundColor: Colors.glass.border, marginLeft: 15, marginVertical: 8 },
  trustCard: { flexDirection: 'row', gap: 14, marginBottom: 12, alignItems: 'flex-start' },
  trustIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(20,184,166,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  trustTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.primary, marginBottom: 4, includeFontPadding: false },
  trustDesc: { fontSize: 13, color: Colors.text.secondary, lineHeight: 20, includeFontPadding: false },
  fundiSection: { backgroundColor: Colors.background.secondary, alignItems: 'center', gap: 12 },
  fundiTitle: { fontSize: 24, fontWeight: '800', color: Colors.text.primary, textAlign: 'center', includeFontPadding: false },
  fundiDesc: { fontSize: 15, color: Colors.text.secondary, textAlign: 'center', lineHeight: 24, includeFontPadding: false },
  fundiBenefits: { alignSelf: 'stretch', gap: 10 },
  fundiBenefit: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fundiBenefitText: { fontSize: 14, color: Colors.text.secondary, includeFontPadding: false },
  faqItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.glass.borderLight },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text.primary, includeFontPadding: false },
  faqAnswer: { fontSize: 14, color: Colors.text.secondary, marginTop: 12, lineHeight: 22, includeFontPadding: false },
  footerCta: { alignItems: 'center', backgroundColor: Colors.background.secondary },
  footerCtaTitle: { fontSize: 22, fontWeight: '800', color: Colors.text.primary, marginBottom: 20, includeFontPadding: false },
  footerLoginLink: { fontSize: 14, color: Colors.brand.primary, includeFontPadding: false },
  footer: { padding: 24, alignItems: 'center', gap: 6 },
  footerLogo: { fontSize: 22, fontWeight: '800', color: Colors.text.primary, includeFontPadding: false },
  footerTagline: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  footerLinks: { fontSize: 12, color: Colors.brand.primary, marginTop: 8, includeFontPadding: false },
  footerCopy: { fontSize: 12, color: Colors.text.muted, marginTop: 8, includeFontPadding: false },
  footerContact: { fontSize: 12, color: Colors.text.muted, includeFontPadding: false },
});

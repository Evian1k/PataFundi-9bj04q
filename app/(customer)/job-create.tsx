import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { jobService } from '@/services/jobService';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { SERVICE_CATEGORIES, JOB_URGENCY, APP_CONFIG } from '@/constants/config';
import { UrgencyLevel, PriceEstimate } from '@/types';

const STEPS = ['Service', 'Details', 'Location', 'Schedule', 'Review'];

export default function JobCreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form state
  const [category, setCategory] = useState(categoryParam || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('today');
  const [address, setAddress] = useState('14 Riverside Drive, Westlands, Nairobi');
  const [estimate, setEstimate] = useState<PriceEstimate | null>(null);

  const selectedCategory = SERVICE_CATEGORIES.find(c => c.id === category);
  const selectedUrgency = JOB_URGENCY.find(u => u.id === urgency);

  const calcEstimate = () => {
    if (category) {
      const est = jobService.calculatePriceEstimate(category, urgency, 2.5);
      setEstimate(est);
    }
  };

  const handleNext = () => {
    if (step === 0 && !category) { showAlert('Select Service', 'Please choose a service type.'); return; }
    if (step === 1 && !title.trim()) { showAlert('Add Title', 'Please briefly describe the problem.'); return; }
    if (step === 3) calcEstimate();
    if (step < STEPS.length - 1) setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!user?.id) { showAlert('Error', 'Not logged in.'); return; }
    setLoading(true);
    const result = await jobService.createJob({
      customerId: user.id,
      serviceCategory: category,
      title,
      description,
      urgency,
      location: { latitude: -1.2921, longitude: 36.8219, address, area: 'Westlands', city: 'Nairobi' },
      estimatedPrice: estimate!,
    });
    setLoading(false);
    if (result.success) {
      router.replace({ pathname: '/(customer)/job-matching', params: { jobId: result.data?.id } });
    } else {
      showAlert('Error', result.error || 'Failed to create job.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => step > 0 ? setStep(s => s - 1) : router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>New Job Request</Text>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="close" size={22} color={Colors.text.secondary} />
        </Pressable>
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.progressItem}>
            <View style={[styles.progressDot, i <= step && { backgroundColor: Colors.brand.primary }]}>
              {i < step ? <MaterialIcons name="check" size={12} color="#FFF" /> : <Text style={styles.progressNum}>{i + 1}</Text>}
            </View>
            <Text style={[styles.progressLabel, i === step && { color: Colors.brand.primary }]}>{s}</Text>
            {i < STEPS.length - 1 && <View style={[styles.progressLine, i < step && { backgroundColor: Colors.brand.primary }]} />}
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Step 0: Service */}
        {step === 0 && (
          <View>
            <Text style={styles.stepTitle}>What service do you need?</Text>
            <View style={styles.categoryGrid}>
              {SERVICE_CATEGORIES.map(cat => (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategory(cat.id)}
                  style={[styles.categoryOption, category === cat.id && { borderColor: cat.color, backgroundColor: `${cat.color}15` }]}
                >
                  <MaterialIcons name={cat.icon as any} size={28} color={cat.color} />
                  <Text style={[styles.categoryOptionName, category === cat.id && { color: cat.color }]}>{cat.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Describe the problem</Text>
            <Text style={styles.stepSub}>Give us a clear title for your job</Text>
            <GlassCard style={styles.inputCard}>
              <Text style={styles.inputLabel}>Job Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Kitchen sink is leaking badly"
                placeholderTextColor={Colors.text.muted}
                style={styles.textInput}
                maxLength={80}
              />
            </GlassCard>
            <GlassCard style={styles.inputCard}>
              <Text style={styles.inputLabel}>Description (optional)</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Any additional details that will help the Fundi..."
                placeholderTextColor={Colors.text.muted}
                style={[styles.textInput, { height: 100 }]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </GlassCard>
            <GlassCard style={[styles.inputCard, { backgroundColor: Colors.semantic.infoBg }]}>
              <View style={styles.photoRow}>
                <MaterialIcons name="add-photo-alternate" size={24} color={Colors.semantic.info} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.photoTitle}>Add Photos (optional)</Text>
                  <Text style={styles.photoSub}>Photos help Fundis prepare the right tools</Text>
                </View>
                <Pressable style={styles.photoBtn}>
                  <Text style={styles.photoBtnText}>Upload</Text>
                </Pressable>
              </View>
            </GlassCard>
          </View>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Where is the job?</Text>
            <GlassCard style={styles.mapPlaceholder}>
              <MaterialIcons name="map" size={40} color={Colors.text.muted} />
              <Text style={styles.mapText}>Map View</Text>
              <Text style={styles.mapSub}>Location picker — GPS integration needed</Text>
            </GlassCard>
            <GlassCard style={styles.inputCard}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                placeholderTextColor={Colors.text.muted}
                style={styles.textInput}
              />
            </GlassCard>
            <View style={styles.savedLocations}>
              <Text style={styles.savedTitle}>Saved Locations</Text>
              {[{ label: 'Home', address: '14 Riverside Drive, Westlands' }, { label: 'Office', address: 'Upperhill, Nairobi CBD' }].map(loc => (
                <Pressable key={loc.label} onPress={() => setAddress(loc.address)} style={styles.savedItem}>
                  <MaterialIcons name={loc.label === 'Home' ? 'home' : 'business'} size={18} color={Colors.brand.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.savedLabel}>{loc.label}</Text>
                    <Text style={styles.savedAddress}>{loc.address}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={18} color={Colors.text.muted} />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>How urgent is this?</Text>
            {JOB_URGENCY.map(u => (
              <Pressable key={u.id} onPress={() => setUrgency(u.id as UrgencyLevel)} style={[styles.urgencyOption, urgency === u.id && { borderColor: u.color }]}>
                <View style={[styles.urgencyDot, { backgroundColor: u.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.urgencyLabel, urgency === u.id && { color: u.color }]}>{u.label}</Text>
                  <Text style={styles.urgencyDesc}>{u.description}</Text>
                </View>
                {urgency === u.id && <MaterialIcons name="check-circle" size={22} color={u.color} />}
                <Text style={[styles.urgencyMultiplier, { color: u.color }]}>
                  {u.multiplier > 1 ? `+${Math.round((u.multiplier - 1) * 100)}%` : 'Standard'}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <View>
            <Text style={styles.stepTitle}>Review your request</Text>
            <GlassCard variant="elevated" style={styles.reviewCard}>
              <ReviewRow icon="build" label="Service" value={selectedCategory?.name || category} />
              <ReviewRow icon="description" label="Title" value={title} />
              <ReviewRow icon="location-on" label="Location" value={address} />
              <ReviewRow icon="schedule" label="Urgency" value={`${selectedUrgency?.label} — ${selectedUrgency?.description}`} />
            </GlassCard>

            {estimate && (
              <GlassCard style={styles.priceCard}>
                <Text style={styles.priceTitle}>Price Estimate</Text>
                <Text style={styles.priceNote}>{estimate.note}</Text>
                <View style={styles.priceBreakdown}>
                  <PriceLine label="Base rate" value={estimate.baseRate} />
                  <PriceLine label={`Travel fee`} value={estimate.travelFee + estimate.distanceFee} />
                  {estimate.urgencyMultiplier > 1 && <PriceLine label={`Urgency (${estimate.urgencyLabel})`} value={Math.round((estimate.urgencyMultiplier - 1) * estimate.baseRate)} />}
                </View>
                <View style={styles.priceRange}>
                  <Text style={styles.priceRangeLabel}>Estimated Range</Text>
                  <Text style={styles.priceRangeValue}>{APP_CONFIG.currencySymbol} {estimate.minTotal.toLocaleString()} – {estimate.maxTotal.toLocaleString()}</Text>
                </View>
                <Text style={styles.priceDisclaimer}>Final price agreed with Fundi. Payment only after work is confirmed.</Text>
              </GlassCard>
            )}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {step < STEPS.length - 1 ? (
          <Button title="Continue" onPress={handleNext} fullWidth size="lg" />
        ) : (
          <Button title="Submit Job Request" onPress={handleSubmit} loading={loading} fullWidth size="lg" variant="secondary" />
        )}
      </View>
    </View>
  );
}

function ReviewRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <MaterialIcons name={icon as any} size={18} color={Colors.brand.primary} />
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function PriceLine({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.priceLine}>
      <Text style={styles.priceLineLabel}>{label}</Text>
      <Text style={styles.priceLineValue}>{APP_CONFIG.currencySymbol} {value.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: Colors.text.primary, textAlign: 'center', includeFontPadding: false },
  progressRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16 },
  progressItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  progressDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.glass.heavy, alignItems: 'center', justifyContent: 'center' },
  progressNum: { fontSize: 11, fontWeight: '700', color: Colors.text.secondary, includeFontPadding: false },
  progressLabel: { fontSize: 10, color: Colors.text.muted, marginLeft: 4, includeFontPadding: false },
  progressLine: { flex: 1, height: 2, backgroundColor: Colors.glass.border, marginHorizontal: 4 },
  content: { paddingHorizontal: 20, paddingBottom: 100 },
  stepTitle: { fontSize: 22, fontWeight: '800', color: Colors.text.primary, marginBottom: 8, includeFontPadding: false },
  stepSub: { fontSize: 14, color: Colors.text.secondary, marginBottom: 20, includeFontPadding: false },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  categoryOption: {
    width: '47%', alignItems: 'center', padding: 16,
    backgroundColor: Colors.glass.medium, borderRadius: Radius.xl,
    borderWidth: 2, borderColor: Colors.glass.border, gap: 8,
  },
  categoryOptionName: { fontSize: 12, fontWeight: '500', color: Colors.text.secondary, textAlign: 'center', includeFontPadding: false },
  inputCard: { marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: '500', color: Colors.text.secondary, marginBottom: 8, includeFontPadding: false },
  textInput: { fontSize: 15, color: Colors.text.primary, paddingVertical: 4, includeFontPadding: false },
  photoRow: { flexDirection: 'row', alignItems: 'center' },
  photoTitle: { fontSize: 14, fontWeight: '600', color: Colors.semantic.info, includeFontPadding: false },
  photoSub: { fontSize: 12, color: Colors.text.secondary, marginTop: 2, includeFontPadding: false },
  photoBtn: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: Colors.semantic.info, borderRadius: Radius.lg },
  photoBtnText: { fontSize: 13, fontWeight: '600', color: '#FFF', includeFontPadding: false },
  mapPlaceholder: {
    height: 160, alignItems: 'center', justifyContent: 'center',
    marginBottom: 14, gap: 8, backgroundColor: Colors.background.tertiary,
  },
  mapText: { fontSize: 15, fontWeight: '600', color: Colors.text.secondary, includeFontPadding: false },
  mapSub: { fontSize: 12, color: Colors.text.muted, includeFontPadding: false },
  savedLocations: { marginTop: 8 },
  savedTitle: { fontSize: 14, fontWeight: '600', color: Colors.text.secondary, marginBottom: 10, includeFontPadding: false },
  savedItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.glass.borderLight },
  savedLabel: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, includeFontPadding: false },
  savedAddress: { fontSize: 12, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  urgencyOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.glass.medium, borderRadius: Radius.xl,
    borderWidth: 2, borderColor: Colors.glass.border,
    padding: 16, marginBottom: 12,
  },
  urgencyDot: { width: 12, height: 12, borderRadius: 6 },
  urgencyLabel: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, includeFontPadding: false },
  urgencyDesc: { fontSize: 12, color: Colors.text.secondary, marginTop: 2, includeFontPadding: false },
  urgencyMultiplier: { fontSize: 12, fontWeight: '700', includeFontPadding: false },
  reviewCard: { marginBottom: 16, gap: 12 },
  reviewRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  reviewLabel: { fontSize: 13, fontWeight: '600', color: Colors.text.secondary, width: 70, includeFontPadding: false },
  reviewValue: { flex: 1, fontSize: 13, color: Colors.text.primary, includeFontPadding: false },
  priceCard: { marginBottom: 20 },
  priceTitle: { fontSize: 17, fontWeight: '700', color: Colors.text.primary, marginBottom: 4, includeFontPadding: false },
  priceNote: { fontSize: 12, color: Colors.brand.accent, marginBottom: 16, includeFontPadding: false },
  priceBreakdown: { gap: 8, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.glass.border },
  priceLine: { flexDirection: 'row', justifyContent: 'space-between' },
  priceLineLabel: { fontSize: 13, color: Colors.text.secondary, includeFontPadding: false },
  priceLineValue: { fontSize: 13, color: Colors.text.primary, fontWeight: '500', includeFontPadding: false },
  priceRange: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  priceRangeLabel: { fontSize: 14, fontWeight: '600', color: Colors.text.secondary, includeFontPadding: false },
  priceRangeValue: { fontSize: 18, fontWeight: '800', color: Colors.brand.secondary, includeFontPadding: false },
  priceDisclaimer: { fontSize: 11, color: Colors.text.muted, lineHeight: 16, includeFontPadding: false },
  footer: { paddingHorizontal: 20, paddingTop: 16, backgroundColor: Colors.background.primary, borderTopWidth: 1, borderTopColor: Colors.glass.borderLight },
});

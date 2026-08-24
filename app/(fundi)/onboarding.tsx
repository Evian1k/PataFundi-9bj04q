import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { fundiService } from '@/services/fundiService';
import { SERVICE_CATEGORIES } from '@/constants/config';
import { useAlert } from '@/template';

const STEPS = ['Welcome', 'Personal', 'Skills', 'Service Areas', 'Documents', 'Review'];

export default function FundiOnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');

  const toggleSkill = (id: string) => {
    setSelectedSkills(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fundiService.submitFundiApplication({ serviceCategories: selectedSkills, bio, experienceYears: parseInt(experience) || 0, documents: [] });
    setLoading(false);
    if (res.success) {
      showAlert('Application Submitted!', res.message || 'We will review and contact you within 24 hours.', [
        { text: 'Go to Dashboard', onPress: () => router.replace('/(fundi)/(tabs)') },
      ]);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {step > 0 && (
          <Pressable onPress={() => setStep(s => s - 1)} style={styles.backBtn}>
            <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text.primary} />
          </Pressable>
        )}
        <Text style={styles.headerTitle}>Become a Fundi</Text>
        <Text style={styles.stepCount}>{step + 1}/{STEPS.length}</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {step === 0 && (
          <View style={styles.welcomeArea}>
            <View style={styles.welcomeIcon}><MaterialIcons name="verified" size={56} color={Colors.brand.accent} /></View>
            <Text style={styles.welcomeTitle}>Join PataFundi</Text>
            <Text style={styles.welcomeText}>Earn money doing what you love. Thousands of customers are looking for skilled professionals like you.</Text>
            {[['Verified badge', 'Build trust with customers'], ['Instant payments', 'Get paid after each job'], ['Flexible schedule', 'Work when you want']].map(([t, d]) => (
              <GlassCard key={t} style={styles.benefitCard}>
                <MaterialIcons name="check-circle" size={20} color={Colors.brand.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.benefitTitle}>{t}</Text>
                  <Text style={styles.benefitDesc}>{d}</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Personal Details</Text>
            <GlassCard style={{ gap: 16 }}>
              {[['Full Name', 'James Omondi'], ['Phone Number', '+254 7XX XXX XXX'], ['Email', 'james@email.com'], ['National ID', 'ID Number']].map(([label, placeholder]) => (
                <View key={label}>
                  <Text style={styles.inputLabel}>{label}</Text>
                  <TextInput placeholder={placeholder} placeholderTextColor={Colors.text.muted} style={styles.textInput} />
                </View>
              ))}
            </GlassCard>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Skills & Services</Text>
            <Text style={styles.stepSub}>Select all services you can offer</Text>
            <View style={styles.skillsGrid}>
              {SERVICE_CATEGORIES.map(cat => (
                <Pressable
                  key={cat.id}
                  onPress={() => toggleSkill(cat.id)}
                  style={[styles.skillChip, selectedSkills.includes(cat.id) && { borderColor: cat.color, backgroundColor: `${cat.color}15` }]}
                >
                  <MaterialIcons name={cat.icon as any} size={18} color={selectedSkills.includes(cat.id) ? cat.color : Colors.text.secondary} />
                  <Text style={[styles.skillChipText, selectedSkills.includes(cat.id) && { color: cat.color }]}>{cat.name}</Text>
                  {selectedSkills.includes(cat.id) && <MaterialIcons name="check" size={14} color={cat.color} />}
                </Pressable>
              ))}
            </View>
            <GlassCard style={{ marginTop: 16, gap: 12 }}>
              <Text style={styles.inputLabel}>Bio (optional)</Text>
              <TextInput value={bio} onChangeText={setBio} placeholder="Tell customers about your experience..." placeholderTextColor={Colors.text.muted} style={[styles.textInput, { height: 80 }]} multiline textAlignVertical="top" />
              <Text style={styles.inputLabel}>Years of Experience</Text>
              <TextInput value={experience} onChangeText={setExperience} placeholder="e.g. 5" keyboardType="number-pad" placeholderTextColor={Colors.text.muted} style={styles.textInput} />
            </GlassCard>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>Service Areas</Text>
            <Text style={styles.stepSub}>Which areas in Nairobi do you serve?</Text>
            {['Westlands', 'Parklands', 'CBD', 'Upperhill', 'Karen', 'Langata', 'Kilimani', 'Lavington', 'Embakasi', 'Ruaka'].map(area => (
              <Pressable key={area} style={styles.areaItem}>
                <MaterialIcons name="location-on" size={16} color={Colors.brand.primary} />
                <Text style={styles.areaText}>{area}</Text>
                <MaterialIcons name="add-circle-outline" size={20} color={Colors.text.muted} />
              </Pressable>
            ))}
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={styles.stepTitle}>Documents</Text>
            <Text style={styles.stepSub}>Required for verification</Text>
            {[{ title: 'National ID', desc: 'Front and back', required: true }, { title: 'Certificate/License', desc: 'Professional qualification', required: false }, { title: 'Profile Photo', desc: 'Clear face photo', required: true }].map(doc => (
              <GlassCard key={doc.title} style={styles.docCard}>
                <View style={styles.docRow}>
                  <MaterialIcons name="upload-file" size={24} color={Colors.brand.primary} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.docTitleRow}>
                      <Text style={styles.docTitle}>{doc.title}</Text>
                      {doc.required && <Badge label="Required" variant="error" size="sm" />}
                    </View>
                    <Text style={styles.docDesc}>{doc.desc}</Text>
                  </View>
                  <Pressable style={styles.uploadBtn}>
                    <Text style={styles.uploadBtnText}>Upload</Text>
                  </Pressable>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {step === 5 && (
          <View>
            <Text style={styles.stepTitle}>Review Application</Text>
            <GlassCard variant="elevated" style={{ gap: 14 }}>
              <ReviewItem icon="build" label="Skills" value={selectedSkills.length > 0 ? `${selectedSkills.length} services selected` : 'None selected'} />
              <ReviewItem icon="description" label="Bio" value={bio || 'Not provided'} />
              <ReviewItem icon="work" label="Experience" value={experience ? `${experience} years` : 'Not provided'} />
            </GlassCard>
            <GlassCard style={{ marginTop: 16, backgroundColor: Colors.semantic.infoBg, borderColor: 'rgba(59,130,246,0.3)' }}>
              <MaterialIcons name="info" size={18} color={Colors.semantic.info} />
              <Text style={styles.reviewNote}>Our team will review your application within 24 hours. You will receive an email confirmation.</Text>
            </GlassCard>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {step < STEPS.length - 1
          ? <Button title="Continue" onPress={() => setStep(s => s + 1)} fullWidth size="lg" variant="success" />
          : <Button title="Submit Application" onPress={handleSubmit} loading={loading} fullWidth size="lg" variant="secondary" />
        }
      </View>
    </View>
  );
}

function ReviewItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <MaterialIcons name={icon as any} size={16} color={Colors.brand.accent} />
      <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text.secondary, width: 80, includeFontPadding: false } as any}>{label}</Text>
      <Text style={{ flex: 1, fontSize: 13, color: Colors.text.primary, includeFontPadding: false } as any}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: Colors.text.primary, textAlign: 'center', includeFontPadding: false },
  stepCount: { fontSize: 13, color: Colors.text.muted, includeFontPadding: false },
  progressBar: { height: 3, backgroundColor: Colors.glass.border, marginHorizontal: 16, borderRadius: 2, marginBottom: 8 },
  progressFill: { height: 3, backgroundColor: Colors.brand.accent, borderRadius: 2 },
  content: { paddingHorizontal: 20, paddingBottom: 100 },
  welcomeArea: { alignItems: 'center', paddingTop: 16, gap: 14 },
  welcomeIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(20,184,166,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  welcomeTitle: { fontSize: 28, fontWeight: '800', color: Colors.text.primary, includeFontPadding: false },
  welcomeText: { fontSize: 15, color: Colors.text.secondary, textAlign: 'center', lineHeight: 24, includeFontPadding: false },
  benefitCard: { flexDirection: 'row', gap: 12, alignSelf: 'stretch' },
  benefitTitle: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, includeFontPadding: false },
  benefitDesc: { fontSize: 12, color: Colors.text.muted, marginTop: 2, includeFontPadding: false },
  stepTitle: { fontSize: 22, fontWeight: '800', color: Colors.text.primary, marginBottom: 8, paddingTop: 8, includeFontPadding: false },
  stepSub: { fontSize: 14, color: Colors.text.secondary, marginBottom: 20, includeFontPadding: false },
  inputLabel: { fontSize: 12, fontWeight: '500', color: Colors.text.secondary, marginBottom: 6, includeFontPadding: false },
  textInput: { fontSize: 15, color: Colors.text.primary, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.glass.border, includeFontPadding: false },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  skillChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: Colors.glass.medium, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.glass.border },
  skillChipText: { fontSize: 13, fontWeight: '500', color: Colors.text.secondary, includeFontPadding: false },
  areaItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.glass.borderLight },
  areaText: { flex: 1, fontSize: 15, color: Colors.text.primary, includeFontPadding: false },
  docCard: { marginBottom: 12 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  docTitle: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, includeFontPadding: false },
  docDesc: { fontSize: 12, color: Colors.text.muted, includeFontPadding: false },
  uploadBtn: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: Colors.glass.heavy, borderRadius: Radius.lg },
  uploadBtnText: { fontSize: 12, fontWeight: '600', color: Colors.brand.primary, includeFontPadding: false },
  reviewNote: { flex: 1, fontSize: 13, color: Colors.semantic.info, lineHeight: 20, includeFontPadding: false },
  footer: { paddingHorizontal: 20, paddingTop: 16, backgroundColor: Colors.background.primary, borderTopWidth: 1, borderTopColor: Colors.glass.borderLight },
});

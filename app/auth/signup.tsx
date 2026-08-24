import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Radius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';

export default function SignupScreen() {
  const router = useRouter();
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const { setUser } = useAuth();
  const { showAlert } = useAlert();

  const [role, setRole] = useState<'customer' | 'fundi'>(roleParam === 'fundi' ? 'fundi' : 'customer');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);

  const update = (field: keyof typeof form, val: string) => setForm(prev => ({ ...prev, [field]: val }));

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.firstName.trim()) e.firstName = 'First name required';
    if (!form.lastName.trim()) e.lastName = 'Last name required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (!form.phone.trim()) e.phone = 'Phone number required';
    if (form.password.length < 6) e.password = 'At least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    const result = await authService.signup({ ...form, role });
    setLoading(false);
    if (result.success && result.data) {
      router.push({ pathname: '/auth/otp', params: { phone: form.phone, userId: result.data.id, role } });
    } else {
      showAlert('Sign Up Failed', result.error || 'Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join thousands of Kenyans using PataFundi</Text>

        {/* Role Selector */}
        <View style={styles.roleSelector}>
          {(['customer', 'fundi'] as const).map(r => (
            <Pressable
              key={r}
              onPress={() => setRole(r)}
              style={[styles.roleBtn, role === r && { borderColor: Colors.role[r], backgroundColor: `${Colors.role[r]}20` }]}
            >
              <Text style={[styles.roleBtnText, role === r && { color: Colors.role[r] }]}>
                {r === 'customer' ? 'I need services' : 'I offer services'}
              </Text>
              <Text style={[styles.roleBtnSub, role === r && { color: Colors.role[r] }]}>
                {r === 'customer' ? 'Customer' : 'Fundi'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.nameRow}>
          <Input label="First Name" placeholder="Amina" value={form.firstName} onChangeText={v => update('firstName', v)} error={errors.firstName} containerStyle={{ flex: 1 }} />
          <Input label="Last Name" placeholder="Wanjiku" value={form.lastName} onChangeText={v => update('lastName', v)} error={errors.lastName} containerStyle={{ flex: 1, marginLeft: 12 }} />
        </View>
        <Input label="Email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={v => update('email', v)} leftIcon="email" error={errors.email} containerStyle={{ marginTop: 16 }} />
        <Input label="Phone Number" placeholder="+254 712 345 678" keyboardType="phone-pad" value={form.phone} onChangeText={v => update('phone', v)} leftIcon="phone" error={errors.phone} containerStyle={{ marginTop: 16 }} />
        <Input label="Password" placeholder="Min 6 characters" isPassword value={form.password} onChangeText={v => update('password', v)} leftIcon="lock" error={errors.password} containerStyle={{ marginTop: 16 }} />
        <Input label="Confirm Password" placeholder="Repeat password" isPassword value={form.confirmPassword} onChangeText={v => update('confirmPassword', v)} leftIcon="lock" error={errors.confirmPassword} containerStyle={{ marginTop: 16 }} />

        <Button title={`Create ${role === 'fundi' ? 'Fundi' : 'Customer'} Account`} onPress={handleSignup} loading={loading} fullWidth size="lg" style={{ marginTop: 28 }} />

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Pressable onPress={() => router.replace('/auth/login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </Pressable>
        </View>

        <Text style={styles.terms}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  content: { padding: 24, paddingTop: 56, paddingBottom: 48 },
  back: { marginBottom: 24 },
  backText: { fontSize: 15, color: Colors.brand.primary, fontWeight: '500', includeFontPadding: false },
  title: { fontSize: 30, fontWeight: '800', color: Colors.text.primary, marginBottom: 8, includeFontPadding: false },
  subtitle: { fontSize: 15, color: Colors.text.secondary, marginBottom: 28, includeFontPadding: false },
  roleSelector: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  roleBtn: {
    flex: 1, padding: 16, borderRadius: Radius.xl,
    borderWidth: 2, borderColor: Colors.glass.border,
    backgroundColor: Colors.glass.light, alignItems: 'center',
  },
  roleBtnText: { fontSize: 13, fontWeight: '600', color: Colors.text.secondary, includeFontPadding: false },
  roleBtnSub: { fontSize: 11, color: Colors.text.muted, marginTop: 3, includeFontPadding: false },
  nameRow: { flexDirection: 'row' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { fontSize: 14, color: Colors.text.secondary, includeFontPadding: false },
  loginLink: { fontSize: 14, color: Colors.brand.primary, fontWeight: '600', includeFontPadding: false },
  terms: { fontSize: 12, color: Colors.text.muted, textAlign: 'center', marginTop: 20, lineHeight: 18, includeFontPadding: false },
});

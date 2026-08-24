import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Radius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useAlert } from '@/template';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  useAuthRedirect();
  const { showAlert } = useAlert();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    const result = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (result.success) {
      // Navigation handled by splash re-render on auth state change
    } else {
      showAlert('Login Failed', result.error || 'Please check your credentials.');
    }
  };

  // Quick demo logins
  const demoAccounts = [
    { label: 'Customer Demo', email: 'customer@test.com', password: '123456', color: Colors.role.customer },
    { label: 'Fundi Demo', email: 'fundi@test.com', password: '123456', color: Colors.role.fundi },
    { label: 'Super Admin', email: 'admin@patafundi.com', password: 'admin123', color: Colors.role.admin },
    { label: 'Staff (Support)', email: 'support@patafundi.com', password: '123456', color: Colors.role.staff },
  ];

  const quickLogin = async (demoEmail: string, demoPassword: string) => {
    setLoading(true);
    const result = await login(demoEmail, demoPassword);
    setLoading(false);
    if (!result.success) {
      showAlert('Error', result.error || 'Login failed.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>P</Text>
          </View>
          <Text style={styles.appName}>PataFundi</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            leftIcon="email"
            error={errors.email}
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            isPassword
            value={password}
            onChangeText={setPassword}
            leftIcon="lock"
            error={errors.password}
            containerStyle={{ marginTop: 16 }}
          />
          <Pressable onPress={() => router.push('/auth/forgot-password')} style={styles.forgotLink}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>
          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            style={{ marginTop: 24 }}
            size="lg"
          />
        </View>

        {/* Demo Quick Login */}
        <View style={styles.demoSection}>
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Quick Demo Access</Text>
            <View style={styles.divider} />
          </View>
          <View style={styles.demoGrid}>
            {demoAccounts.map(acc => (
              <Pressable
                key={acc.email}
                onPress={() => quickLogin(acc.email, acc.password)}
                style={({ pressed }) => [styles.demoBtn, { borderColor: acc.color, opacity: pressed ? 0.7 : 1 }]}
              >
                <View style={[styles.demoDot, { backgroundColor: acc.color }]} />
                <Text style={[styles.demoBtnText, { color: acc.color }]}>{acc.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don&apos;t have an account? </Text>
          <Pressable onPress={() => router.push('/auth/signup')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </Pressable>
        </View>

        {/* Marketing Link */}
        <Pressable onPress={() => router.push('/marketing')} style={styles.marketingLink}>
          <Text style={styles.marketingText}>Learn about PataFundi →</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  content: { padding: 24, paddingTop: 64, paddingBottom: 48 },
  logoArea: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  logoLetter: { fontSize: 38, fontWeight: '800', color: '#FFF', includeFontPadding: false },
  appName: { fontSize: 28, fontWeight: '800', color: Colors.text.primary, includeFontPadding: false },
  subtitle: { fontSize: 15, color: Colors.text.secondary, marginTop: 6, includeFontPadding: false },
  form: { marginBottom: 32 },
  forgotLink: { alignSelf: 'flex-end', marginTop: 12 },
  forgotText: { fontSize: 13, color: Colors.brand.primary, fontWeight: '500', includeFontPadding: false },
  demoSection: { marginBottom: 32 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.glass.border },
  dividerText: { fontSize: 12, color: Colors.text.muted, includeFontPadding: false },
  demoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  demoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: Radius.lg, borderWidth: 1,
    backgroundColor: Colors.glass.light,
    flex: 1, minWidth: '45%',
  },
  demoDot: { width: 8, height: 8, borderRadius: 4 },
  demoBtnText: { fontSize: 12, fontWeight: '600', includeFontPadding: false },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  signupText: { fontSize: 14, color: Colors.text.secondary, includeFontPadding: false },
  signupLink: { fontSize: 14, color: Colors.brand.primary, fontWeight: '600', includeFontPadding: false },
  marketingLink: { alignItems: 'center' },
  marketingText: { fontSize: 13, color: Colors.text.muted, includeFontPadding: false },
});

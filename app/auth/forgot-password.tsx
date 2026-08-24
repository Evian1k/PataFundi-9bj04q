import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/authService';
import { useAlert } from '@/template';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.includes('@')) {
      showAlert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    const result = await authService.forgotPassword(email);
    setLoading(false);
    if (result.success) setSent(true);
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.successIcon}>
          <Text style={styles.successEmoji}>✉️</Text>
        </View>
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitle}>
          We sent a password reset link to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>
        <Button title="Back to Login" onPress={() => router.replace('/auth/login')} fullWidth size="lg" style={{ marginTop: 32 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your email and we will send you a reset link.</Text>
      <Input
        label="Email Address"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        leftIcon="email"
        containerStyle={{ marginTop: 32 }}
      />
      <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} fullWidth size="lg" style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary, padding: 24, paddingTop: 64 },
  back: { marginBottom: 32 },
  backText: { fontSize: 15, color: Colors.brand.primary, fontWeight: '500', includeFontPadding: false },
  title: { fontSize: 30, fontWeight: '800', color: Colors.text.primary, marginBottom: 12, includeFontPadding: false },
  subtitle: { fontSize: 15, color: Colors.text.secondary, lineHeight: 24, includeFontPadding: false },
  successIcon: { alignItems: 'center', marginBottom: 32, marginTop: 40 },
  successEmoji: { fontSize: 64 },
  email: { color: Colors.text.primary, fontWeight: '600' },
});

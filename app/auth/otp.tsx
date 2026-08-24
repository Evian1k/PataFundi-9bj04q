import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Radius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';

export default function OtpScreen() {
  const router = useRouter();
  const { phone, userId, role } = useLocalSearchParams<{ phone: string; userId: string; role: string }>();
  const { setUser } = useAuth();
  const { showAlert } = useAlert();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (val: string, idx: number) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length > 1) {
      // Paste handling
      const newOtp = [...otp];
      for (let i = 0; i < 6 && i < digits.length; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);
      inputs.current[5]?.focus();
      return;
    }
    const newOtp = [...otp];
    newOtp[idx] = digits;
    setOtp(newOtp);
    if (digits && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      showAlert('Incomplete', 'Please enter the 6-digit code.');
      return;
    }
    setLoading(true);
    const result = await authService.verifyOtp({ phone: phone || '', otp: code });
    setLoading(false);
    if (result.success) {
      // For demo, navigate based on role
      if (role === 'fundi') {
        router.replace('/(fundi)/onboarding');
      } else {
        router.replace('/(customer)/(tabs)');
      }
    } else {
      showAlert('Verification Failed', result.error || 'Invalid code. Try 123456 for demo.');
    }
  };

  const handleResend = async () => {
    setResendTimer(60);
    showAlert('Code Sent', `A new verification code has been sent to ${phone}`);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Verify Phone</Text>
      <Text style={styles.subtitle}>
        We sent a 6-digit code to{'\n'}
        <Text style={styles.phone}>{phone}</Text>
      </Text>
      <Text style={styles.demoHint}>Demo: use any 6 digits e.g. 123456</Text>

      <View style={styles.otpRow}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={el => { inputs.current[i] = el; }}
            value={digit}
            onChangeText={val => handleChange(val, i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            maxLength={6}
            keyboardType="number-pad"
            style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
            selectionColor={Colors.brand.primary}
            accessibilityLabel={`OTP digit ${i + 1}`}
          />
        ))}
      </View>

      <Button title="Verify Code" onPress={handleVerify} loading={loading} fullWidth size="lg" style={{ marginTop: 32 }} />

      <View style={styles.resendRow}>
        <Text style={styles.resendText}>
          {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Did not receive it? '}
        </Text>
        {resendTimer === 0 ? (
          <Pressable onPress={handleResend}>
            <Text style={styles.resendLink}>Resend</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary, padding: 24, paddingTop: 64 },
  back: { marginBottom: 32 },
  backText: { fontSize: 15, color: Colors.brand.primary, fontWeight: '500', includeFontPadding: false },
  title: { fontSize: 30, fontWeight: '800', color: Colors.text.primary, marginBottom: 12, includeFontPadding: false },
  subtitle: { fontSize: 15, color: Colors.text.secondary, lineHeight: 24, marginBottom: 8, includeFontPadding: false },
  phone: { color: Colors.text.primary, fontWeight: '600' },
  demoHint: { fontSize: 12, color: Colors.brand.accent, marginBottom: 40, includeFontPadding: false },
  otpRow: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  otpInput: {
    width: 48, height: 58, borderRadius: Radius.lg,
    backgroundColor: Colors.glass.light,
    borderWidth: 1.5, borderColor: Colors.glass.border,
    textAlign: 'center', fontSize: 24, fontWeight: '700',
    color: Colors.text.primary,
  },
  otpInputFilled: { borderColor: Colors.brand.primary, backgroundColor: 'rgba(14,165,233,0.1)' },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 4 },
  resendText: { fontSize: 14, color: Colors.text.secondary, includeFontPadding: false },
  resendLink: { fontSize: 14, color: Colors.brand.primary, fontWeight: '600', includeFontPadding: false },
});

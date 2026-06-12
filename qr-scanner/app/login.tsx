import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiUrl } from '@/constants/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Please enter your email.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    const loginUrlCandidates = [apiUrl('/api/login')];
    let lastErrMsg = '';

    try {
      for (const loginUrl of loginUrlCandidates) {
        try {
          const res = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: trimmedEmail, password }),
          });

          const raw = await res.text();
          let payload: { message?: string; data?: { token?: string }; status?: boolean } | null = null;
          try {
            payload = raw ? JSON.parse(raw) : null;
          } catch {
            payload = { message: raw || 'Login failed' };
          }

          if (!res.ok) {
            if ([404, 502, 503].includes(res.status)) {
              lastErrMsg = payload?.message || `HTTP ${res.status}`;
              continue;
            }

            setError(payload?.message || 'Login failed');
            return;
          }

          const token = payload?.data?.token;
          if (!token) {
            setError(payload?.message || 'Login failed');
            return;
          }

          (globalThis as unknown as { token?: string }).token = token;
          router.replace('/(tabs)');
          return;
        } catch (err) {
          lastErrMsg = err instanceof Error ? err.message : String(err);
        }
      }

      Alert.alert(
        'Network request failed',
        `Could not reach your login API.\n\nTried:\n${loginUrlCandidates
          .map((u) => `- ${u}`)
          .join('\n')}\n\nDetails: ${lastErrMsg || 'Unknown error'}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={styles.hero}>
        <View style={styles.heroGlowTop} />
        <View style={styles.heroGlowBottom} />

        <SafeAreaView edges={['top']} style={styles.heroSafe}>
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <Ionicons name="search" size={22} color="#fff" />
            </View>
            <Text style={styles.brandName}>FindBack</Text>
          </View>

          <Text style={styles.heroTitle}>
            Welcome{'\n'}back.
          </Text>
          <Text style={styles.heroSubtitle}>
            Sign in to scan QR codes, look up found items, and help reunite belongings with their owners.
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="qr-code-outline" size={16} color="#93c5fd" />
              </View>
              <Text style={styles.featureText}>Instant QR scanning</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#93c5fd" />
              </View>
              <Text style={styles.featureText}>Secure staff access</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView
        style={styles.formArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.formScroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.formSheet}>
            <View style={styles.formHeader}>
              <View style={styles.formHeaderIcon}>
                <Ionicons name="log-in-outline" size={22} color="#09090b" />
              </View>
              <View style={styles.formHeaderText}>
                <Text style={styles.formTitle}>Sign in</Text>
                <Text style={styles.formSubtitle}>Enter your credentials to continue</Text>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color="#a1a1aa" style={styles.inputIcon} />
                <TextInput
                  placeholder="you@example.com"
                  placeholderTextColor="#a1a1aa"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  autoComplete="email"
                  style={styles.input}
                  onChangeText={(v) => { setEmail(v); setError(''); }}
                  value={email}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#a1a1aa" style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#a1a1aa"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  style={[styles.input, styles.inputWithToggle]}
                  onChangeText={(v) => { setPassword(v); setError(''); }}
                  value={password}
                />
                <Pressable
                  style={styles.toggleBtn}
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#71717a"
                  />
                </Pressable>
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                isSubmitting && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Sign in</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  hero: {
    flex: 1,
    minHeight: 280,
    backgroundColor: '#09090b',
    overflow: 'hidden',
  },
  heroGlowTop: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(37, 99, 235, 0.35)',
  },
  heroGlowBottom: {
    position: 'absolute',
    bottom: -30,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
  },
  heroSafe: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'flex-end',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 38,
    marginBottom: 12,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: 24,
  },
  featureList: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '500',
  },
  formArea: {
    backgroundColor: '#fafafa',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    flexShrink: 0,
  },
  formScroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  formSheet: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 24,
  },
  formHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formHeaderText: {
    flex: 1,
    paddingTop: 2,
  },
  formTitle: {
    color: '#09090b',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  formSubtitle: {
    color: '#71717a',
    fontSize: 14,
    lineHeight: 20,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    color: '#09090b',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    paddingVertical: 14,
    paddingLeft: 42,
    paddingRight: 14,
    color: '#09090b',
    backgroundColor: '#fff',
    fontSize: 15,
  },
  inputWithToggle: {
    paddingRight: 46,
  },
  toggleBtn: {
    position: 'absolute',
    right: 10,
    padding: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#09090b',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }

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
            // If the host/route is wrong, try the next candidate; otherwise show the real error.
            if ([404, 502, 503].includes(res.status)) {
              lastErrMsg = payload?.message || `HTTP ${res.status}`;
              continue;
            }

            Alert.alert('Error', payload?.message || 'Login failed');
            return;
          }

          // Keep token storage simple for now; avoid untyped globals under `strict` TS.
          const token = payload?.data?.token;
          if (!token) {
            Alert.alert('Error', payload?.message || 'Login failed');
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.appName}>Lost &amp; Found</Text>
          <Text style={styles.subtitle}>Scan codes to reunite items with their owners.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign in</Text>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={styles.input}
            onChangeText={setEmail}
            value={email}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#64748b"
            secureTextEntry
            style={styles.input}
            onChangeText={setPassword}
            value={password}
          />

          <Pressable
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 12,
    alignItems: 'center',
  },
  logoWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    marginBottom: 16,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  appName: {
    color: '#0f172a',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: 8,
    color: '#475569',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});

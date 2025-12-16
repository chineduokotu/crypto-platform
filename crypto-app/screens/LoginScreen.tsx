import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import apiClient from '../utils/api';
import { authStorage } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/login.php', {
        email,
        password,
      });

      if (response.data.success) {
        const { userId, fullName, kycCompleted } = response.data;

        await authStorage.setUserData({
          userId: userId.toString(),
          fullName,
          kycCompleted,
        });

        if (!kycCompleted) {
          navigation.replace('KYC');
        } else {
          navigation.replace('Dashboard');
        }
      } else {
        Alert.alert('Login Failed', response.data.error || 'Invalid credentials');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ['#111827', '#1f2937', '#374151'] : [colors.primary, colors.secondary, '#3b82f6']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Theme Toggle */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={styles.themeToggle}
        >
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={24}
            color={isDark ? '#fbbf24' : '#fff'}
          />
        </TouchableOpacity>

        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={32} color="#fff" />
          </View>

          <Text style={[styles.title, isDark && styles.textDark]}>Welcome Back</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>Sign in to your account</Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.textDark]}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.textDark]}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isDark && styles.inputDark, { paddingRight: 50 }]}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, isDark && styles.textDark]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  iconText: {
    fontSize: 32,
  },
  cardDark: {
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
  },
  textDark: {
    color: '#f9fafb',
  },
  subtitleDark: {
    color: '#9ca3af',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: borderRadius.md,
    paddingLeft: 45,
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: '#111827',
  },
  inputDark: {
    backgroundColor: '#374151',
    color: '#f9fafb',
  },
  button: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

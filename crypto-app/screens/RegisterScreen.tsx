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
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import apiClient from '../utils/api';
import { authStorage } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

export default function RegisterScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/register.php', {
        fullName,
        email,
        password,
        confirmPassword,
      });

      if (response.data.success) {
        await authStorage.setUserData({
          userId: response.data.userId.toString(),
          fullName,
          kycCompleted: false,
        });

        navigation.replace('KYC');
      } else {
        Alert.alert('Registration Failed', response.data.error || 'Something went wrong');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
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

        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={[styles.card, isDark && styles.cardDark]}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-add" size={32} color="#fff" />
            </View>

            <Text style={[styles.title, isDark && styles.textDark]}>Create Account</Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>Join our crypto platform</Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, isDark && styles.textDark]}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

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
                  placeholder="Create password"
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

            <View style={styles.inputContainer}>
              <Text style={[styles.label, isDark && styles.textDark]}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isDark && styles.inputDark, { paddingRight: 50 }]}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
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
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.footerText, isDark && styles.textDark]}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  },
  scrollView: {
    flexGrow: 1,
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

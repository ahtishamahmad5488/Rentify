import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { login as loginApi } from '../../utils/api/authApi';
import { useAuthStore } from '../../store/useAuthStore';
import { showToast } from '../../utils/toastUtils';
import { getApiError } from '../../utils/helpers';

const PRIMARY = '#0B5FFF';
const NAVY = '#061A4D';
const BG = '#F6F8FC';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const setUser = useAuthStore(s => s.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimEmail = email.trim().toLowerCase();
    if (!trimEmail || !password) {
      showToast(
        'error',
        'Missing fields',
        'Please enter your email and password.',
      );
      return;
    }
    setLoading(true);
    try {
      const res = await loginApi(trimEmail, password);
      setUser(res.user, res.token);
    } catch (err: any) {
      showToast('error', 'Login failed', getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandRow}>
          <View style={styles.brandDot} />
          <Text style={styles.brandName}>Rentify</Text>
        </View>

        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.sub}>Sign in to find your perfect rental</Text>

        {/* Card */}
        <View style={styles.card}>
          {/* Email */}
          <Text style={styles.label}>Email address</Text>
          <View style={styles.inputRow}>
            <Mail size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <Text style={[styles.label, { marginTop: hp('2.2%') }]}>
            Password
          </Text>
          <View style={styles.inputRow}>
            <Lock size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPw}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPw(v => !v)}
              style={styles.eyeBtn}
            >
              {showPw ? (
                <EyeOff size={18} color="#9CA3AF" />
              ) : (
                <Eye size={18} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotRow}
            onPress={() => navigation.navigate('forgot-password')}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign up link */}
        <View style={styles.signupRow}>
          <Text style={styles.signupPrompt}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('signup')}>
            <Text style={styles.signupLink}>Create one</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: BG },
  container: {
    flexGrow: 1,
    paddingHorizontal: wp('6%'),
    paddingTop: hp('8%'),
    paddingBottom: hp('6%'),
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('5%'),
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY,
    marginRight: 7,
  },
  brandName: {
    fontSize: wp('5%'),
    fontWeight: '800',
    color: NAVY,
    letterSpacing: 0.5,
  },
  heading: {
    fontSize: wp('7.5%'),
    fontWeight: '800',
    color: NAVY,
    marginBottom: hp('0.8%'),
  },
  sub: {
    fontSize: wp('3.8%'),
    color: '#6B7280',
    marginBottom: hp('4%'),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: wp('5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  label: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    color: '#374151',
    marginBottom: hp('0.8%'),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: wp('3.5%'),
    backgroundColor: '#F9FAFB',
    height: hp('6%'),
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: wp('3.8%'),
    color: '#111827',
  },
  eyeBtn: { padding: 4 },
  forgotRow: { alignSelf: 'flex-end', marginTop: hp('1.2%') },
  forgotText: {
    fontSize: wp('3.4%'),
    color: PRIMARY,
    fontWeight: '600',
  },
  btn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    height: hp('6.5%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('3%'),
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: wp('4.2%') },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('3.5%'),
  },
  signupPrompt: { fontSize: wp('3.8%'), color: '#6B7280' },
  signupLink: { fontSize: wp('3.8%'), color: PRIMARY, fontWeight: '700' },
});

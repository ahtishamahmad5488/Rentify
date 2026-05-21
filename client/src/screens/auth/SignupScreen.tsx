import React, {useState} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import {Eye, EyeOff, Mail, Lock, User} from 'lucide-react-native';
import {register as registerApi} from '../../utils/api/authApi';
import {useAuthStore} from '../../store/useAuthStore';
import {showToast} from '../../utils/toastUtils';
import {getApiError} from '../../utils/helpers';

const PRIMARY = '#0B5FFF';
const NAVY = '#061A4D';
const BG = '#F6F8FC';

export default function SignupScreen() {
  const navigation = useNavigation<any>();
  const setUser = useAuthStore(s => s.setUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    const trimName = name.trim();
    const trimEmail = email.trim().toLowerCase();

    if (!trimName || !trimEmail || !password) {
      showToast('error', 'Missing fields', 'All fields are required.');
      return;
    }
    if (password.length < 6) {
      showToast('error', 'Too short', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      showToast('error', 'Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerApi(trimName, trimEmail, password);
      setUser(res.user, res.token);
      showToast('success', 'Account created!', 'Welcome to Rentify.');
      navigation.replace('drawer-navigation');
    } catch (err: any) {
      showToast('error', 'Signup failed', getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Brand */}
        <View style={styles.brandRow}>
          <View style={styles.brandDot} />
          <Text style={styles.brandName}>Rentify</Text>
        </View>

        <Text style={styles.heading}>Create account</Text>
        <Text style={styles.sub}>Join thousands of renters across Pakistan</Text>

        {/* Card */}
        <View style={styles.card}>
          {/* Name */}
          <Text style={styles.label}>Full name</Text>
          <View style={styles.inputRow}>
            <User size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ali Ahmed"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email */}
          <Text style={[styles.label, {marginTop: hp('2%')}]}>Email address</Text>
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
          <Text style={[styles.label, {marginTop: hp('2%')}]}>Password</Text>
          <View style={styles.inputRow}>
            <Lock size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, {flex: 1}]}
              placeholder="Min. 6 characters"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPw}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPw(v => !v)} style={styles.eyeBtn}>
              {showPw ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={[styles.label, {marginTop: hp('2%')}]}>Confirm password</Text>
          <View style={styles.inputRow}>
            <Lock size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, {flex: 1}]}
              placeholder="Repeat password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showConfirm}
              value={confirm}
              onChangeText={setConfirm}
            />
            <TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={styles.eyeBtn}>
              {showConfirm ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
            </TouchableOpacity>
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginPrompt}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('login')}>
            <Text style={styles.loginLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: BG},
  container: {
    flexGrow: 1,
    paddingHorizontal: wp('6%'),
    paddingTop: hp('7%'),
    paddingBottom: hp('6%'),
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('4%'),
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
    marginBottom: hp('3.5%'),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: wp('5%'),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
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
  inputIcon: {marginRight: 8},
  input: {
    flex: 1,
    fontSize: wp('3.8%'),
    color: '#111827',
  },
  eyeBtn: {padding: 4},
  btn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    height: hp('6.5%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('3%'),
    shadowColor: PRIMARY,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {opacity: 0.6},
  btnText: {color: '#fff', fontWeight: '700', fontSize: wp('4.2%')},
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('3.5%'),
  },
  loginPrompt: {fontSize: wp('3.8%'), color: '#6B7280'},
  loginLink: {fontSize: wp('3.8%'), color: PRIMARY, fontWeight: '700'},
});

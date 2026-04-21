// @ts-nocheck
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { login as loginApi } from '../../utils/api/authApi';
import { useAuthStore } from '../../store/useAuthStore';
import { showToast } from '../../utils/toastUtils';
import googleLogo from '../../assets/images/icons/google.png';
import appleLogo from '../../assets/images/icons/apple.png';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showToast('error', 'Missing fields', 'Enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await loginApi(email.trim().toLowerCase(), password);
      setUser(res.user, res.token);
      navigation.replace('drawer-navigation');
    } catch (err: any) {
      showToast('error', 'Login failed', err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.firstSection}>
        <Text style={styles.headerText}>Welcome Back</Text>
        <View style={styles.headerUnderline} />
        <Text style={styles.subtitleText}>
          Sign in to find your perfect rental property.
        </Text>

        <View style={styles.socialLoginContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialButtonText}>Login with </Text>
            <Image source={googleLogo} style={styles.logoStyle} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialButtonText}>Login with </Text>
            <Image source={appleLogo} style={styles.logoStyle} />
          </TouchableOpacity>
        </View>

        <View style={styles.orSection}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>Or sign in with email</Text>
          <View style={styles.orLine} />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.label, { marginTop: hp('2%') }]}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={{ alignSelf: 'flex-end', marginTop: hp('1%') }}
            onPress={() => navigation.navigate('forgot-password')}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.secondSection}>
        <TouchableOpacity
          style={[styles.loginBtn, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginPrompt}>
          <Text style={styles.loginPromptText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('signup')}>
            <Text style={styles.loginLinkText}> Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: wp('6%'), backgroundColor: 'white' },
  firstSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  secondSection: { flex: 0.4, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: hp('10%') },
  headerText: { fontSize: wp('7%'), fontWeight: '700', color: '#333' },
  headerUnderline: { height: hp('0.4%'), width: wp('20%'), backgroundColor: '#4F46E5', marginTop: hp('1%'), marginBottom: hp('1.5%') },
  subtitleText: { fontSize: wp('4%'), color: '#666', marginBottom: hp('4%'), textAlign: 'center' },
  socialLoginContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: wp('2%') },
  socialButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: wp('43.5%'), height: hp('6%'), borderWidth: 1, borderColor: '#ddd', borderRadius: 50, gap: wp('2%') },
  socialButtonText: { fontSize: wp('3.8%'), color: '#333' },
  logoStyle: { width: wp('4.5%'), height: wp('4.5%'), resizeMode: 'contain' },
  orSection: { flexDirection: 'row', alignItems: 'center', width: '90%', marginVertical: hp('3%') },
  orLine: { flex: 1, height: 1, backgroundColor: '#D3D3D3' },
  orText: { marginHorizontal: wp('3%'), fontSize: wp('3.6%'), color: '#777' },
  formSection: { width: '100%' },
  label: { fontSize: wp('3.8%'), color: '#333', marginBottom: hp('0.8%'), fontWeight: '500' },
  input: { height: hp('6%'), borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, paddingHorizontal: wp('4%'), fontSize: wp('4%'), color: '#333', backgroundColor: '#fafafa' },
  forgotText: { color: '#4F46E5', fontSize: wp('3.5%'), fontWeight: '600' },
  loginBtn: { width: '100%', height: hp('6.5%'), backgroundColor: '#4F46E5', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: wp('4.2%') },
  loginPrompt: { flexDirection: 'row', alignItems: 'center', marginTop: hp('2.5%') },
  loginPromptText: { fontSize: wp('3.8%'), color: '#999' },
  loginLinkText: { fontSize: wp('3.8%'), color: '#4F46E5', fontWeight: '600' },
});

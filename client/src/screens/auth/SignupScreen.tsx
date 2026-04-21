// @ts-nocheck
import {
  ActivityIndicator,
  Image,
  ScrollView,
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
import { register as registerApi } from '../../utils/api/authApi';
import { useAuthStore } from '../../store/useAuthStore';
import { showToast } from '../../utils/toastUtils';
import googleLogo from '../../assets/images/icons/google.png';
import appleLogo from '../../assets/images/icons/apple.png';

export default function SignupScreen() {
  const navigation = useNavigation<any>();
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      showToast('error', 'Missing fields', 'All fields are required.');
      return;
    }
    if (password !== confirm) {
      showToast('error', 'Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      showToast('error', 'Too short', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await registerApi(name.trim(), email.trim().toLowerCase(), password);
      setUser(res.user, res.token);
      showToast('success', 'Welcome!', 'Account created successfully.');
      navigation.replace('drawer-navigation');
    } catch (err: any) {
      showToast('error', 'Signup failed', err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.headerText}>Create Account</Text>
      <View style={styles.headerUnderline} />
      <Text style={styles.subtitle}>Join Rentify and find your perfect rental.</Text>

      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialBtn}>
          <Text style={styles.socialText}>Continue with </Text>
          <Image source={googleLogo} style={styles.logo} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <Text style={styles.socialText}>Continue with </Text>
          <Image source={appleLogo} style={styles.logo} />
        </TouchableOpacity>
      </View>

      <View style={styles.orRow}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>Or sign up with email</Text>
        <View style={styles.orLine} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} placeholder="John Doe" placeholderTextColor="#aaa" value={name} onChangeText={setName} />

        <Text style={[styles.label, { marginTop: hp('2%') }]}>Email</Text>
        <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor="#aaa" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

        <Text style={[styles.label, { marginTop: hp('2%') }]}>Password</Text>
        <TextInput style={styles.input} placeholder="Min. 6 characters" placeholderTextColor="#aaa" secureTextEntry value={password} onChangeText={setPassword} />

        <Text style={[styles.label, { marginTop: hp('2%') }]}>Confirm Password</Text>
        <TextInput style={styles.input} placeholder="Repeat password" placeholderTextColor="#aaa" secureTextEntry value={confirm} onChangeText={setConfirm} />
      </View>

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.6 }, { marginTop: hp('4%') }]}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
      </TouchableOpacity>

      <View style={styles.loginPrompt}>
        <Text style={styles.promptText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('login')}>
          <Text style={styles.linkText}> Log in</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: wp('6%'), paddingTop: hp('8%'), paddingBottom: hp('6%'), backgroundColor: '#fff', alignItems: 'center' },
  headerText: { fontSize: wp('7%'), fontWeight: '700', color: '#333' },
  headerUnderline: { height: hp('0.4%'), width: wp('22%'), backgroundColor: '#4F46E5', marginTop: hp('1%'), marginBottom: hp('1.5%') },
  subtitle: { fontSize: wp('4%'), color: '#666', marginBottom: hp('3.5%'), textAlign: 'center' },
  socialRow: { flexDirection: 'row', width: '100%', gap: wp('2%') },
  socialBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: hp('6%'), borderWidth: 1, borderColor: '#ddd', borderRadius: 50, gap: 4 },
  socialText: { fontSize: wp('3.6%'), color: '#333' },
  logo: { width: wp('4.5%'), height: wp('4.5%'), resizeMode: 'contain' },
  orRow: { flexDirection: 'row', alignItems: 'center', width: '90%', marginVertical: hp('3%') },
  orLine: { flex: 1, height: 1, backgroundColor: '#ddd' },
  orText: { marginHorizontal: wp('3%'), fontSize: wp('3.5%'), color: '#888' },
  form: { width: '100%' },
  label: { fontSize: wp('3.8%'), fontWeight: '500', color: '#333', marginBottom: hp('0.8%') },
  input: { height: hp('6%'), borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, paddingHorizontal: wp('4%'), fontSize: wp('4%'), color: '#333', backgroundColor: '#fafafa' },
  btn: { width: '100%', height: hp('6.5%'), backgroundColor: '#4F46E5', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: wp('4.2%') },
  loginPrompt: { flexDirection: 'row', marginTop: hp('3%') },
  promptText: { color: '#999', fontSize: wp('3.8%') },
  linkText: { color: '#4F46E5', fontWeight: '600', fontSize: wp('3.8%') },
});

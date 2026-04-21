// @ts-nocheck
import React, { useState } from 'react';
import {
  ActivityIndicator, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { forgotPassword } from '../../utils/api/authApi';
import { showToast } from '../../utils/toastUtils';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      showToast('error', 'Missing', 'Enter your email address.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      showToast('success', 'OTP Sent', 'Check your email for the 6-digit code.');
      navigation.navigate('otp-verify', { email: email.trim().toLowerCase() });
    } catch (err: any) {
      showToast('error', 'Error', err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <ArrowLeft size={wp('6%')} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>Forgot Password?</Text>
      <View style={styles.underline} />
      <Text style={styles.subtitle}>
        Enter your registered email and we&apos;ll send you a 6-digit OTP.
      </Text>

      <Text style={styles.label}>Email address</Text>
      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.6 }]}
        onPress={handleSend}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send OTP</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: wp('6%'), paddingTop: hp('8%') },
  back: { marginBottom: hp('3%') },
  title: { fontSize: wp('7%'), fontWeight: '700', color: '#333' },
  underline: { height: hp('0.4%'), width: wp('24%'), backgroundColor: '#4F46E5', marginTop: hp('1%'), marginBottom: hp('1.5%') },
  subtitle: { fontSize: wp('4%'), color: '#666', marginBottom: hp('4%'), lineHeight: 22 },
  label: { fontSize: wp('3.8%'), fontWeight: '500', color: '#333', marginBottom: hp('1%') },
  input: { height: hp('6%'), borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, paddingHorizontal: wp('4%'), fontSize: wp('4%'), backgroundColor: '#fafafa', color: '#333' },
  btn: { marginTop: hp('4%'), height: hp('6.5%'), backgroundColor: '#4F46E5', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: wp('4.2%') },
});

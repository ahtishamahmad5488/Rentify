// @ts-nocheck
/**
 * OTP Verification screen — used for password reset flow only.
 * Receives { email } from ForgotPasswordScreen.
 */
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { verifyOTP, forgotPassword } from '../../utils/api/authApi';
import { showToast } from '../../utils/toastUtils';

export default function OtpVerifyResetScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const email: string = route.params?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
    if (!val && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      showToast('error', 'Incomplete', 'Enter the full 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      await verifyOTP(email, code);
      navigation.navigate('create-password', { email, otp: code });
    } catch (err: any) {
      showToast('error', 'Invalid OTP', err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await forgotPassword(email);
      showToast('success', 'Resent', 'A new OTP has been sent.');
    } catch {
      showToast('error', 'Failed', 'Could not resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <ArrowLeft size={wp('6%')} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>Enter OTP</Text>
      <View style={styles.underline} />
      <Text style={styles.subtitle}>
        We sent a 6-digit code to{'\n'}
        <Text style={{ color: '#4F46E5', fontWeight: '600' }}>{email}</Text>
      </Text>

      <View style={styles.otpRow}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={(r) => { inputs.current[i] = r; }}
            style={[styles.otpBox, digit && styles.otpBoxFilled]}
            value={digit}
            onChangeText={(v) => handleChange(v, i)}
            maxLength={1}
            keyboardType="numeric"
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.6 }]}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify OTP</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResend} disabled={resending} style={{ marginTop: hp('3%') }}>
        <Text style={styles.resendText}>
          {resending ? 'Sending…' : "Didn't receive it? Resend OTP"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: wp('6%'), paddingTop: hp('8%'), alignItems: 'center' },
  back: { alignSelf: 'flex-start', marginBottom: hp('3%') },
  title: { fontSize: wp('7%'), fontWeight: '700', color: '#333' },
  underline: { height: hp('0.4%'), width: wp('18%'), backgroundColor: '#4F46E5', marginTop: hp('1%'), marginBottom: hp('1.5%') },
  subtitle: { fontSize: wp('4%'), color: '#666', textAlign: 'center', marginBottom: hp('5%'), lineHeight: 24 },
  otpRow: { flexDirection: 'row', gap: wp('3%') },
  otpBox: { width: wp('12%'), height: wp('14%'), borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10, textAlign: 'center', fontSize: wp('6%'), fontWeight: '700', color: '#333', backgroundColor: '#fafafa' },
  otpBoxFilled: { borderColor: '#4F46E5', backgroundColor: '#EEF0FF' },
  btn: { marginTop: hp('5%'), width: '100%', height: hp('6.5%'), backgroundColor: '#4F46E5', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: wp('4.2%') },
  resendText: { color: '#4F46E5', fontSize: wp('3.8%'), fontWeight: '600' },
});

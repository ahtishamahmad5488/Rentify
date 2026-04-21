// @ts-nocheck
import React, { useState } from 'react';
import {
  ActivityIndicator, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { resetPassword } from '../../utils/api/authApi';
import { showToast } from '../../utils/toastUtils';

export default function CreatePasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const email: string = route.params?.email || '';
  const otp: string = route.params?.otp || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    if (!newPassword || !confirm) {
      showToast('error', 'Missing', 'Fill both fields.');
      return;
    }
    if (newPassword !== confirm) {
      showToast('error', 'Mismatch', 'Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      showToast('error', 'Too short', 'Minimum 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      setDone(true);
    } catch (err: any) {
      showToast('error', 'Failed', err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <CheckCircle2 size={72} color="#22C55E" />
        <Text style={[styles.title, { marginTop: 20 }]}>Password Reset!</Text>
        <Text style={styles.subtitle}>Your password has been updated successfully.</Text>
        <TouchableOpacity
          style={[styles.btn, { marginTop: hp('4%') }]}
          onPress={() => navigation.replace('login')}
        >
          <Text style={styles.btnText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <ArrowLeft size={wp('6%')} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>New Password</Text>
      <View style={styles.underline} />
      <Text style={styles.subtitle}>Set a new password for your account.</Text>

      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Min. 6 characters"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <Text style={[styles.label, { marginTop: hp('2%') }]}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Repeat password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.6 }]}
        onPress={handleReset}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Set Password</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: wp('6%'), paddingTop: hp('8%') },
  back: { marginBottom: hp('3%') },
  title: { fontSize: wp('7%'), fontWeight: '700', color: '#333' },
  underline: { height: hp('0.4%'), width: wp('22%'), backgroundColor: '#4F46E5', marginTop: hp('1%'), marginBottom: hp('1.5%') },
  subtitle: { fontSize: wp('4%'), color: '#666', marginBottom: hp('4%') },
  label: { fontSize: wp('3.8%'), fontWeight: '500', color: '#333', marginBottom: hp('1%') },
  input: { height: hp('6%'), borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, paddingHorizontal: wp('4%'), fontSize: wp('4%'), backgroundColor: '#fafafa', color: '#333' },
  btn: { marginTop: hp('4%'), height: hp('6.5%'), backgroundColor: '#4F46E5', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: wp('4.2%') },
});

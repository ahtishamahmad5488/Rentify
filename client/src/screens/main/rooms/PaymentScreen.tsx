import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, CreditCard, CheckCircle2 } from 'lucide-react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { processPayment } from '../../../utils/api/bookingApi';
import { getCurrentFirebaseUser } from '../../../utils/firebase';

export default function PaymentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const booking = route.params?.booking;

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<{ txn: string } | null>(null);

  // ─── Card UI helpers (purely visual — no real validation needed) ─────────
  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();
  const formatExpiry = (v: string) => {
    const cleaned = v.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length < 3) return cleaned;
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
  };

  const handlePay = async () => {
    if (!cardNumber || !cardHolder || !expiry || !cvv) {
      Alert.alert('Incomplete', 'Please fill in all card details.');
      return;
    }
    try {
      setProcessing(true);
      const user = getCurrentFirebaseUser();
      const result = await processPayment({
        bookingId: booking._id,
        tenantUid: user?.uid || booking.tenantUid || 'demo-tenant',
        method: 'CARD',
      });
      setSuccess({ txn: result.payment.transactionId });
    } catch (e: any) {
      Alert.alert('Payment failed', e?.response?.data?.message || e.message);
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, styles.center]}>
        <CheckCircle2 size={80} color="#22C55E" />
        <Text style={styles.successTitle}>Payment Successful</Text>
        <Text style={styles.successSub}>Your booking is confirmed.</Text>
        <View style={styles.txnBox}>
          <Text style={styles.txnLabel}>Transaction ID</Text>
          <Text style={styles.txnValue}>{success.txn}</Text>
        </View>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.navigate('drawer-navigation' as never)}
        >
          <Text style={styles.doneText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={wp('6%')} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Payment</Text>
        <View style={{ width: wp('6%') }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.cardPreview}>
          <CreditCard color="#fff" size={28} />
          <Text style={styles.cardNum}>
            {cardNumber || '•••• •••• •••• ••••'}
          </Text>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.cardLabel}>HOLDER</Text>
              <Text style={styles.cardValue}>{cardHolder || 'YOUR NAME'}</Text>
            </View>
            <View>
              <Text style={styles.cardLabel}>EXPIRES</Text>
              <Text style={styles.cardValue}>{expiry || 'MM/YY'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={styles.input}
          value={cardNumber}
          onChangeText={(t) => setCardNumber(formatCard(t))}
          placeholder="1234 5678 9012 3456"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Card Holder</Text>
        <TextInput
          style={styles.input}
          value={cardHolder}
          onChangeText={setCardHolder}
          placeholder="John Doe"
          autoCapitalize="characters"
        />

        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Expiry</Text>
            <TextInput
              style={styles.input}
              value={expiry}
              onChangeText={(t) => setExpiry(formatExpiry(t))}
              placeholder="MM/YY"
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={styles.input}
              value={cvv}
              onChangeText={(v) => setCvv(v.replace(/\D/g, '').slice(0, 4))}
              placeholder="123"
              keyboardType="numeric"
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryText}>Amount</Text>
          <Text style={styles.summaryAmount}>
            Rs. {Number(booking?.totalAmount || 0).toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.payBtn, processing && { opacity: 0.6 }]}
          onPress={handlePay}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payText}>Pay Now</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: hp('5%') },
  center: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: wp('4%'), paddingBottom: hp('1.2%'), paddingTop: hp('2%'),
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  title: { fontSize: wp('4.4%'), fontWeight: '700', color: '#000' },
  cardPreview: {
    backgroundColor: '#1f1f3a', borderRadius: 16, padding: 22, marginBottom: 20,
  },
  cardNum: { color: '#fff', fontSize: 22, letterSpacing: 2, marginTop: 24 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  cardLabel: { color: '#bbb', fontSize: 10 },
  cardValue: { color: '#fff', fontSize: 13, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', marginTop: 12, marginBottom: 6, color: '#333' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fafafa',
  },
  summary: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 24, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#eee',
  },
  summaryText: { fontSize: 15, color: '#333' },
  summaryAmount: { fontSize: 18, fontWeight: '700', color: '#4F46E5' },
  payBtn: {
    backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 10,
    alignItems: 'center', marginTop: 20,
  },
  payText: { color: '#fff', fontWeight: '700' },
  successTitle: { fontSize: 22, fontWeight: '700', marginTop: 20 },
  successSub: { color: '#666', marginTop: 6 },
  txnBox: {
    backgroundColor: '#F5F5FA', padding: 14, borderRadius: 10, marginTop: 20, alignItems: 'center',
  },
  txnLabel: { color: '#666', fontSize: 12 },
  txnValue: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  doneBtn: {
    marginTop: 24, backgroundColor: '#4F46E5', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 8,
  },
  doneText: { color: '#fff', fontWeight: '700' },
});

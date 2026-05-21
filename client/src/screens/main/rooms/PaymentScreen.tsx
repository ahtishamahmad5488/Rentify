import React, {useState} from 'react';
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
import {useNavigation, useRoute} from '@react-navigation/native';
import {ArrowLeft, CreditCard, CheckCircle2, Lock} from 'lucide-react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {processPayment} from '../../../utils/api/bookingApi';
import {useAuthStore} from '../../../store/useAuthStore';
import {formatPrice, getApiError} from '../../../utils/helpers';

const PRIMARY = '#0B5FFF';
const NAVY = '#061A4D';
const BG = '#F6F8FC';
const CARD_BG = '#1A237E';

export default function PaymentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const booking = route.params?.booking;
  const user = useAuthStore(s => s.user);

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.name?.toUpperCase() || '');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<{txn: string} | null>(null);

  const formatCard = (v: string) =>
    v
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, '$1 ')
      .trim();

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
    if (!booking?._id) {
      Alert.alert('Error', 'Booking information is missing.');
      return;
    }

    try {
      setProcessing(true);
      const result = await processPayment({
        bookingId: booking._id,
        userId: user?._id || booking.userId || 'demo-user',
        method: 'CARD',
      });
      setSuccess({txn: result?.payment?._id || result?.payment?.transactionId || 'TXN-' + Date.now()});
    } catch (e: any) {
      Alert.alert('Payment failed', getApiError(e));
    } finally {
      setProcessing(false);
    }
  };

  // ── Success State ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <CheckCircle2 size={56} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successSub}>Your booking is confirmed and ready.</Text>

        <View style={styles.txnCard}>
          <Text style={styles.txnLabel}>Transaction ID</Text>
          <Text style={styles.txnValue}>{success.txn}</Text>
          <View style={styles.txnDivider} />
          <Text style={styles.txnLabel}>Amount Paid</Text>
          <Text style={styles.txnAmount}>
            {formatPrice(booking?.totalAmount || 0)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.navigate('drawer-navigation' as never)}>
          <Text style={styles.doneBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Card masked display ────────────────────────────────────────────────────
  const displayCard = cardNumber || '•••• •••• •••• ••••';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={NAVY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{width: 36}} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Amount */}
        <View style={styles.amountBanner}>
          <Text style={styles.amountLabel}>Total to pay</Text>
          <Text style={styles.amountValue}>
            {formatPrice(booking?.totalAmount || 0)}
          </Text>
        </View>

        {/* Card Preview */}
        <View style={styles.cardPreview}>
          <View style={styles.cardHeader}>
            <CreditCard size={26} color="rgba(255,255,255,0.9)" />
            <Text style={styles.cardBankLabel}>RENTIFY PAY</Text>
          </View>
          <Text style={styles.cardNum}>{displayCard}</Text>
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardMeta}>CARD HOLDER</Text>
              <Text style={styles.cardValue}>
                {cardHolder || 'YOUR NAME'}
              </Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.cardMeta}>EXPIRES</Text>
              <Text style={styles.cardValue}>{expiry || 'MM/YY'}</Text>
            </View>
          </View>
        </View>

        {/* Card Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Card Details</Text>

          <Text style={styles.label}>Card Number</Text>
          <TextInput
            style={styles.input}
            value={cardNumber}
            onChangeText={t => setCardNumber(formatCard(t))}
            placeholder="1234 5678 9012 3456"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />

          <Text style={[styles.label, {marginTop: hp('2%')}]}>Card Holder</Text>
          <TextInput
            style={styles.input}
            value={cardHolder}
            onChangeText={setCardHolder}
            placeholder="JOHN DOE"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
          />

          <View style={styles.halfRow}>
            <View style={{flex: 1}}>
              <Text style={styles.label}>Expiry</Text>
              <TextInput
                style={styles.input}
                value={expiry}
                onChangeText={t => setExpiry(formatExpiry(t))}
                placeholder="MM/YY"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
            <View style={{width: 12}} />
            <View style={{flex: 1}}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                value={cvv}
                onChangeText={v => setCvv(v.replace(/\D/g, '').slice(0, 4))}
                placeholder="•••"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Secure note */}
        <View style={styles.secureRow}>
          <Lock size={13} color="#9CA3AF" />
          <Text style={styles.secureText}>
            Your payment is secured with 256-bit SSL encryption
          </Text>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          style={[styles.payBtn, processing && styles.btnDisabled]}
          onPress={handlePay}
          disabled={processing}
          activeOpacity={0.85}>
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payBtnText}>
              Pay {formatPrice(booking?.totalAmount || 0)}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: BG},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('5.5%'),
    paddingBottom: hp('1.5%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {fontSize: wp('4.5%'), fontWeight: '800', color: NAVY},
  content: {padding: wp('4.5%'), gap: 14},

  // Amount Banner
  amountBanner: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  amountLabel: {color: 'rgba(255,255,255,0.8)', fontSize: wp('3.5%')},
  amountValue: {
    color: '#fff',
    fontSize: wp('7%'),
    fontWeight: '900',
    marginTop: 4,
  },

  // Card Preview
  cardPreview: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    shadowColor: CARD_BG,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBankLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: wp('3%'),
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardNum: {
    color: '#fff',
    fontSize: wp('5.5%'),
    letterSpacing: 3,
    marginTop: hp('2.5%'),
    marginBottom: hp('2%'),
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardMeta: {color: 'rgba(255,255,255,0.6)', fontSize: wp('2.5%'), fontWeight: '600'},
  cardValue: {color: '#fff', fontSize: wp('3.5%'), fontWeight: '700', marginTop: 2},

  // Form
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  formTitle: {fontSize: wp('4%'), fontWeight: '800', color: NAVY, marginBottom: 12},
  label: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    fontSize: wp('4%'),
    color: '#111827',
  },
  halfRow: {flexDirection: 'row', marginTop: hp('2%')},

  // Secure
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  secureText: {fontSize: wp('3%'), color: '#9CA3AF'},

  // Pay Button
  payBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    height: hp('7%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('2%'),
    shadowColor: PRIMARY,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  btnDisabled: {opacity: 0.6},
  payBtnText: {color: '#fff', fontWeight: '800', fontSize: wp('4.2%')},

  // Success
  successContainer: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successTitle: {
    fontSize: wp('6%'),
    fontWeight: '900',
    color: NAVY,
    marginTop: 20,
  },
  successSub: {color: '#6B7280', marginTop: 6, fontSize: wp('3.8%'), textAlign: 'center'},
  txnCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  txnLabel: {fontSize: wp('3.2%'), color: '#9CA3AF', fontWeight: '600'},
  txnValue: {
    fontSize: wp('3.6%'),
    fontWeight: '700',
    color: NAVY,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  txnDivider: {height: 1, backgroundColor: '#F3F4F6', width: '100%', marginVertical: 14},
  txnAmount: {fontSize: wp('5.5%'), fontWeight: '900', color: '#10B981', marginTop: 4},
  doneBtn: {
    marginTop: 24,
    backgroundColor: PRIMARY,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: PRIMARY,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  doneBtnText: {color: '#fff', fontWeight: '800', fontSize: wp('4%')},
});

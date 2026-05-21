import React, {useMemo, useState} from 'react';
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
import {ArrowLeft, CalendarCheck, MapPin, Home} from 'lucide-react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {createBooking} from '../../../utils/api/bookingApi';
import {useAuthStore} from '../../../store/useAuthStore';
import {formatPrice, getApiError} from '../../../utils/helpers';

const PRIMARY = '#0B5FFF';
const NAVY = '#061A4D';
const BG = '#F6F8FC';

export default function BookingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const property = route.params?.property;
  const user = useAuthStore(s => s.user);

  const [checkInDate, setCheckInDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [durationMonths, setDurationMonths] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(
    () => (property?.price || 0) * (Number(durationMonths) || 1),
    [property, durationMonths],
  );

  const handleConfirm = async () => {
    if (!user) {
      Alert.alert('Login required', 'Please login to book a property.');
      return;
    }
    if (!property?._id) {
      Alert.alert('Error', 'Property information is missing.');
      return;
    }

    const dur = Number(durationMonths);
    if (!checkInDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Invalid date', 'Enter date in YYYY-MM-DD format.');
      return;
    }
    if (!dur || dur < 1) {
      Alert.alert('Invalid duration', 'Duration must be at least 1 month.');
      return;
    }

    try {
      setSubmitting(true);
      const booking = await createBooking({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        propertyId: property._id,
        checkInDate,
        durationMonths: dur,
      });
      navigation.replace('payment', {booking});
    } catch (e: any) {
      Alert.alert('Booking failed', getApiError(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (!property) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No property selected.</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIconBtn}>
          <ArrowLeft size={20} color={NAVY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Property</Text>
        <View style={{width: 36}} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Property Summary Card */}
        <View style={styles.propertyCard}>
          <View style={styles.propertyIconBox}>
            <Home size={22} color={PRIMARY} />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.propertyTitle} numberOfLines={2}>
              {property.title}
            </Text>
            <View style={styles.locRow}>
              <MapPin size={12} color="#9CA3AF" />
              <Text style={styles.locText}>
                {property.area ? `${property.area}, ` : ''}
                {property.city}
              </Text>
            </View>
            <Text style={styles.propertyPrice}>
              {formatPrice(property.price)} / month
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Booking Details</Text>

          <Text style={styles.label}>Check-in date</Text>
          <TextInput
            style={styles.input}
            value={checkInDate}
            onChangeText={setCheckInDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
          <Text style={styles.hint}>Format: 2026-06-01</Text>

          <Text style={[styles.label, {marginTop: hp('2%')}]}>
            Duration (months)
          </Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() =>
                setDurationMonths(d => String(Math.max(1, Number(d) - 1)))
              }>
              <Text style={styles.counterBtnText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.counterInput}
              value={durationMonths}
              onChangeText={v => setDurationMonths(v.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              textAlign="center"
            />
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() =>
                setDurationMonths(d => String(Number(d) + 1))
              }>
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Monthly rent</Text>
            <Text style={styles.summaryValue}>{formatPrice(property.price)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{durationMonths} month(s)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmBtn, submitting && styles.btnDisabled]}
          onPress={handleConfirm}
          disabled={submitting}
          activeOpacity={0.85}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <CalendarCheck size={18} color="#fff" />
              <Text style={styles.confirmBtnText}>Confirm & Proceed to Payment</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: BG},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG},
  errorText: {color: '#6B7280', fontSize: wp('4%')},
  backBtn: {
    marginTop: 12,
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backBtnText: {color: '#fff', fontWeight: '700'},
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
  backIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {fontSize: wp('4.5%'), fontWeight: '800', color: NAVY},
  content: {padding: wp('4.5%'), gap: 14},

  // Property Card
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  propertyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: PRIMARY + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyTitle: {fontSize: wp('4%'), fontWeight: '700', color: NAVY, lineHeight: 20},
  locRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 3},
  locText: {fontSize: wp('3.2%'), color: '#9CA3AF'},
  propertyPrice: {
    fontSize: wp('3.8%'),
    fontWeight: '700',
    color: PRIMARY,
    marginTop: 4,
  },

  // Form Card
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  formTitle: {fontSize: wp('4%'), fontWeight: '800', color: NAVY, marginBottom: 14},
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
  hint: {fontSize: wp('3%'), color: '#9CA3AF', marginTop: 4},
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: PRIMARY + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {fontSize: 20, color: PRIMARY, fontWeight: '700'},
  counterInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: NAVY,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {fontSize: wp('3.8%'), color: '#6B7280'},
  summaryValue: {fontSize: wp('3.8%'), fontWeight: '600', color: NAVY},
  divider: {height: 1, backgroundColor: '#F3F4F6', marginVertical: 8},
  totalLabel: {fontSize: wp('4.2%'), fontWeight: '800', color: NAVY},
  totalValue: {fontSize: wp('5%'), fontWeight: '900', color: PRIMARY},

  // Button
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PRIMARY,
    borderRadius: 14,
    height: hp('7%'),
    marginBottom: hp('2%'),
    shadowColor: PRIMARY,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  btnDisabled: {opacity: 0.6},
  confirmBtnText: {color: '#fff', fontWeight: '800', fontSize: wp('4%')},
});

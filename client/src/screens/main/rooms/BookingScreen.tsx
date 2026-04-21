import React, { useMemo, useState } from 'react';
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
import { ArrowLeft, CalendarCheck } from 'lucide-react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { createBooking } from '../../../utils/api/bookingApi';
import { getCurrentFirebaseUser } from '../../../utils/firebase';

export default function BookingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const property = route.params?.property;

  const [checkInDate, setCheckInDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [durationMonths, setDurationMonths] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(
    () => (Number(property?.pricePerMonth || 0) * Number(durationMonths || 1)),
    [property, durationMonths],
  );

  const handleConfirm = async () => {
    const user = getCurrentFirebaseUser();
    if (!user && !__DEV__) {
      Alert.alert('Login required', 'Please login to continue booking.');
      return;
    }

    try {
      setSubmitting(true);
      const booking = await createBooking({
        tenantUid: user?.uid || 'demo-tenant',
        tenantName: user?.displayName || 'Demo Tenant',
        tenantEmail: user?.email || 'demo@rentify.app',
        propertyId: property._id,
        checkInDate,
        durationMonths: Number(durationMonths) || 1,
      });
      navigation.replace('payment', { booking });
    } catch (e: any) {
      Alert.alert('Booking failed', e?.response?.data?.message || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!property) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>No property selected.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={wp('6%')} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Book Property</Text>
        <View style={{ width: wp('6%') }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.card}>
          <Text style={styles.propertyName}>{property.name}</Text>
          <Text style={styles.propertyMeta}>
            {property.area}, {property.city}
          </Text>
          <Text style={styles.price}>
            Rs. {Number(property.pricePerMonth).toLocaleString()} / month
          </Text>
        </View>

        <Text style={styles.label}>Check-in date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={checkInDate}
          onChangeText={setCheckInDate}
          placeholder="2026-04-15"
        />

        <Text style={styles.label}>Duration (months)</Text>
        <TextInput
          style={styles.input}
          value={durationMonths}
          onChangeText={setDurationMonths}
          keyboardType="numeric"
        />

        <View style={styles.summary}>
          <Text style={styles.summaryText}>Total amount</Text>
          <Text style={styles.summaryAmount}>Rs. {total.toLocaleString()}</Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, submitting && { opacity: 0.6 }]}
          onPress={handleConfirm}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <CalendarCheck color="#fff" size={18} />
              <Text style={styles.btnText}>Confirm & Pay</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: hp('5%') },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: wp('4%'), paddingBottom: hp('1.2%'), paddingTop: hp('2%'),
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  title: { fontSize: wp('4.4%'), fontWeight: '700', color: '#000' },
  card: {
    backgroundColor: '#F5F5FA', padding: 14, borderRadius: 10, marginBottom: 18,
  },
  propertyName: { fontSize: 16, fontWeight: '700' },
  propertyMeta: { color: '#666', marginTop: 2 },
  price: { color: '#4F46E5', fontWeight: '700', marginTop: 6 },
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
  btn: {
    flexDirection: 'row', backgroundColor: '#4F46E5', paddingVertical: 14,
    borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 24,
  },
  btnText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
});

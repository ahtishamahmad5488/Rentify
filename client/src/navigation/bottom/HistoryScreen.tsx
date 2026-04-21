import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { listMyBookings, Booking } from '../../utils/api/bookingApi';
import { getCurrentFirebaseUser } from '../../utils/firebase';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  CONFIRMED: '#22C55E',
  CANCELLED: '#EF4444',
  COMPLETED: '#0EA5E9',
};

export default function HistoryScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const uid = getCurrentFirebaseUser()?.uid || 'demo-tenant';
      const list = await listMyBookings(uid);
      setBookings(list || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Booking History</Text>
      <FlatList
        data={bookings}
        keyExtractor={(b) => b._id}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
          />
        }
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', color: '#777', marginTop: 60 }}>
            You haven&apos;t booked anything yet.
          </Text>
        )}
        renderItem={({ item }) => {
          const property = item.property || {};
          const cover = property.images?.[0]?.secure_url;
          return (
            <View style={styles.card}>
              {cover ? (
                <Image source={{ uri: cover }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, { backgroundColor: '#eee' }]} />
              )}
              <View style={{ flex: 1, padding: 10 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {property.name || 'Property'}
                </Text>
                <Text style={styles.meta}>
                  {property.city ? `${property.city} · ` : ''}
                  {item.durationMonths} mo · Check-in {item.checkInDate?.slice(0, 10)}
                </Text>
                <Text style={styles.amount}>
                  Rs. {item.totalAmount.toLocaleString()}
                </Text>
                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: STATUS_COLORS[item.status] || '#666' },
                    ]}
                  >
                    <Text style={styles.badgeText}>{item.status}</Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          item.paymentStatus === 'PAID' ? '#22C55E' : '#9CA3AF',
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>{item.paymentStatus}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: wp('4%'), paddingTop: hp('2%') },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  card: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#eee', borderRadius: 10, marginBottom: 10, overflow: 'hidden',
  },
  thumb: { width: 100, height: 100 },
  name: { fontWeight: '700', fontSize: 14 },
  meta: { color: '#666', fontSize: 12, marginTop: 2 },
  amount: { color: '#4F46E5', fontWeight: '700', marginTop: 4 },
  badgeRow: { flexDirection: 'row', marginTop: 6 },
  badge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginRight: 6,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});

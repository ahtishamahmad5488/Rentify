import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {CalendarCheck, Package} from 'lucide-react-native';
import {listMyBookings, Booking} from '../../utils/api/bookingApi';
import {useAuthStore} from '../../store/useAuthStore';
import {resolveImageUrl, formatPrice} from '../../utils/helpers';

const PRIMARY = '#0B5FFF';
const NAVY = '#061A4D';
const BG = '#F6F8FC';

const STATUS_STYLE: Record<string, {bg: string; text: string}> = {
  PENDING:   {bg: '#FEF3C7', text: '#92400E'},
  CONFIRMED: {bg: '#D1FAE5', text: '#065F46'},
  CANCELLED: {bg: '#FEE2E2', text: '#991B1B'},
  COMPLETED: {bg: '#DBEAFE', text: '#1E40AF'},
};

const PAY_STYLE: Record<string, {bg: string; text: string}> = {
  PAID:     {bg: '#D1FAE5', text: '#065F46'},
  UNPAID:   {bg: '#F3F4F6', text: '#6B7280'},
  REFUNDED: {bg: '#EDE9FE', text: '#5B21B6'},
};

export default function HistoryScreen() {
  const user = useAuthStore(s => s.user);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }
    try {
      setError('');
      const list = await listMyBookings(user._id);
      setBookings(list || []);
    } catch {
      setError('Failed to load bookings. Pull to refresh.');
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?._id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Booking History</Text>

      <FlatList
        data={bookings}
        keyExtractor={b => b._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            colors={[PRIMARY]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyBox}>
            <Package size={52} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyText}>
              {error || "Properties you book will appear here"}
            </Text>
          </View>
        )}
        renderItem={({item}) => <BookingCard booking={item} />}
      />
    </View>
  );
}

function BookingCard({booking}: {booking: Booking}) {
  const property = booking.property || {};
  const coverUrl = resolveImageUrl(property.images);

  const statusStyle = STATUS_STYLE[booking.status] || {bg: '#F3F4F6', text: '#6B7280'};
  const payStyle = PAY_STYLE[booking.paymentStatus] || PAY_STYLE.UNPAID;

  return (
    <View style={styles.card}>
      {/* Image */}
      {coverUrl ? (
        <Image source={{uri: coverUrl}} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <CalendarCheck size={24} color="#D1D5DB" />
        </View>
      )}

      {/* Info */}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {property.title || 'Property'}
        </Text>
        <Text style={styles.cardMeta}>
          {property.city || ''}
          {property.city && booking.durationMonths ? ' · ' : ''}
          {booking.durationMonths ? `${booking.durationMonths} month(s)` : ''}
        </Text>

        {booking.checkInDate ? (
          <Text style={styles.cardDate}>
            Check-in: {booking.checkInDate.slice(0, 10)}
          </Text>
        ) : null}

        <Text style={styles.cardAmount}>
          {formatPrice(booking.totalAmount)}
        </Text>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, {backgroundColor: statusStyle.bg}]}>
            <Text style={[styles.badgeText, {color: statusStyle.text}]}>
              {booking.status}
            </Text>
          </View>
          <View style={[styles.badge, {backgroundColor: payStyle.bg}]}>
            <Text style={[styles.badgeText, {color: payStyle.text}]}>
              {booking.paymentStatus}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: BG},
  center: {justifyContent: 'center', alignItems: 'center'},
  loadingText: {color: '#9CA3AF', marginTop: 12},
  pageTitle: {
    fontSize: wp('5.5%'),
    fontWeight: '800',
    color: NAVY,
    paddingHorizontal: wp('4.5%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('1%'),
  },
  listContent: {
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('12%'),
    gap: 12,
  },

  // Empty
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: hp('10%'),
    gap: 10,
  },
  emptyTitle: {fontSize: wp('4.5%'), fontWeight: '700', color: NAVY},
  emptyText: {fontSize: wp('3.5%'), color: '#9CA3AF', textAlign: 'center'},

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  thumb: {
    width: wp('26%'),
    height: '100%',
    minHeight: hp('14%'),
  },
  thumbPlaceholder: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    padding: 12,
    gap: 3,
  },
  cardTitle: {
    fontSize: wp('3.8%'),
    fontWeight: '700',
    color: NAVY,
  },
  cardMeta: {
    fontSize: wp('3.2%'),
    color: '#9CA3AF',
  },
  cardDate: {
    fontSize: wp('3.2%'),
    color: '#6B7280',
  },
  cardAmount: {
    fontSize: wp('4%'),
    fontWeight: '800',
    color: PRIMARY,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: wp('2.8%'),
    fontWeight: '700',
  },
});

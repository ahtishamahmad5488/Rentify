// @ts-nocheck
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { Search, MapPin, Home, CalendarDays } from 'lucide-react-native';
import { getMyProperties } from '../../utils/api/propertyApi';

const getImageUrl = (property: any) => {
  const img = property?.images?.[0];
  if (!img) return 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?q=80&w=800';
  if (typeof img === 'string') return img;
  return img.secure_url || img.url || img.uri || 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?q=80&w=800';
};

const getStatusStyle = (status: string) => {
  const s = String(status || 'PENDING').toUpperCase();
  if (s === 'APPROVED')        return { bg: '#DCFCE7', text: '#166534', label: 'APPROVED' };
  if (s === 'REJECTED')        return { bg: '#FEE2E2', text: '#991B1B', label: 'REJECTED' };
  if (s === 'PENDING_REVIEW')  return { bg: '#DBEAFE', text: '#1E40AF', label: 'UNDER REVIEW' };
  return                              { bg: '#FEF3C7', text: '#92400E', label: 'PENDING' };
};

export default function AllUserListScreen({ navigation }: any) {
  const [properties, setProperties] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMyProperties = async () => {
    try {
      const response = await getMyProperties();
      // response shape: { success, data: { properties: [...], pagination: {...} } }
      const list =
        response?.data?.properties ||
        response?.properties ||
        (Array.isArray(response?.data) ? response.data : null) ||
        [];
      setProperties(Array.isArray(list) ? list : []);
    } catch (error: any) {
      console.log('Error fetching my properties:', error?.response?.data || error.message);
      setProperties([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadMyProperties(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadMyProperties();
  };

  const filteredProperties = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter((item: any) =>
      item?.title?.toLowerCase?.().includes(q) ||
      item?.city?.toLowerCase?.().includes(q) ||
      item?.area?.toLowerCase?.().includes(q) ||
      item?.address?.toLowerCase?.().includes(q) ||
      item?.status?.toLowerCase?.().includes(q),
    );
  }, [query, properties]);

  const renderProperty = ({ item }: any) => {
    const status = getStatusStyle(item.status);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation?.navigate?.('room-details', { property: item })}
      >
        <Image source={{ uri: getImageUrl(item) }} style={styles.image} />
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.titleText} numberOfLines={1}>
              {item.title || 'Untitled Property'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <MapPin size={wp('3.8%')} color="#6B7280" />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.area ? `${item.area}, ` : ''}{item.city || item.address || 'Location not provided'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoChip}>
              <Home size={wp('3.8%')} color="#0B5FFF" />
              <Text style={styles.infoText}>{item.propertyType || 'Property'}</Text>
            </View>
            <View style={styles.infoChip}>
              <CalendarDays size={wp('3.8%')} color="#0B5FFF" />
              <Text style={styles.infoText}>
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'New'}
              </Text>
            </View>
          </View>

          <Text style={styles.priceText}>
            PKR {Number(item.price || 0).toLocaleString()} / month
          </Text>
          <Text style={styles.noteText}>
            {status.label === 'APPROVED'
              ? 'Your property is visible to users.'
              : status.label === 'REJECTED'
              ? 'Your property was rejected by admin.'
              : status.label === 'UNDER REVIEW'
              ? 'Updated — awaiting re-approval.'
              : 'Waiting for admin approval.'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>My Listed Properties</Text>
      <Text style={styles.screenSubTitle}>Track your submitted properties and approval status</Text>

      <View style={styles.searchBar}>
        <Search size={wp('5%')} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, city or status"
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#0B5FFF" size="large" />
          <Text style={styles.loadingText}>Loading your properties...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProperties}
          keyExtractor={(item: any) => item._id}
          renderItem={renderProperty}
          contentContainerStyle={[styles.listContent, filteredProperties.length === 0 && { flex: 1 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No properties found</Text>
              <Text style={styles.emptyText}>
                Properties you list will appear here with their approval status.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FC', paddingHorizontal: wp('4%'), paddingTop: hp('2%') },
  screenTitle: { fontSize: wp('6%'), fontWeight: '800', color: '#061A4D' },
  screenSubTitle: { marginTop: hp('0.5%'), fontSize: wp('3.5%'), color: '#6B7280', marginBottom: hp('2%') },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'), paddingHorizontal: wp('3%'), height: hp('6%'),
    marginBottom: hp('1.5%'), borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, marginLeft: wp('2%'), fontSize: wp('3.8%'), color: '#111827', padding: 0 },
  listContent: { paddingBottom: hp('3%') },
  card: {
    backgroundColor: '#fff', borderRadius: 18, marginBottom: hp('1.8%'),
    overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 }, shadowRadius: 10,
  },
  image: { width: '100%', height: hp('18%'), backgroundColor: '#E5E7EB' },
  content: { padding: wp('4%') },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: wp('2%'), alignItems: 'center' },
  titleText: { flex: 1, fontSize: wp('4.6%'), fontWeight: '800', color: '#111827' },
  statusBadge: { paddingHorizontal: wp('2.5%'), paddingVertical: hp('0.5%'), borderRadius: 999 },
  statusText: { fontSize: wp('2.8%'), fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: hp('1%') },
  metaText: { marginLeft: wp('1%'), flex: 1, fontSize: wp('3.4%'), color: '#6B7280' },
  infoRow: { flexDirection: 'row', marginTop: hp('1.3%'), gap: wp('2%') },
  infoChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF4FF',
    borderRadius: 999, paddingHorizontal: wp('2.5%'), paddingVertical: hp('0.6%'),
  },
  infoText: { marginLeft: wp('1%'), color: '#0B5FFF', fontSize: wp('3.1%'), fontWeight: '700' },
  priceText: { marginTop: hp('1.3%'), fontSize: wp('4.4%'), color: '#0B5FFF', fontWeight: '900' },
  noteText: { marginTop: hp('0.8%'), fontSize: wp('3.2%'), color: '#6B7280' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: hp('1%'), color: '#6B7280', fontSize: wp('3.5%') },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: wp('8%') },
  emptyTitle: { fontSize: wp('4.8%'), fontWeight: '800', color: '#111827' },
  emptyText: { marginTop: hp('1%'), textAlign: 'center', color: '#6B7280', fontSize: wp('3.5%'), lineHeight: 20 },
});

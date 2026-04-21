import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Slider from '../../components/Slider';
import { Heart, MapPin, Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { fetchProperties, Property, PropertyQuery } from '../../utils/api/propertyApi';

const FACILITY_OPTIONS = ['WiFi', 'AC', 'Furniture', 'Parking', 'Laundry', 'Kitchen'];
const RADIUS_OPTIONS = [2, 5, 10];

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<PropertyQuery>({});
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Capture user location once for radius search.
  useEffect(() => {
    Geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, []);

  const load = useCallback(async () => {
    try {
      const merged: PropertyQuery = { ...filters, q: query || undefined };
      if (filters.radiusKm && coords) {
        merged.lat = coords.lat;
        merged.lng = coords.lng;
      }
      const res = await fetchProperties(merged);
      setProperties(res || []);
    } catch (e) {
      setProperties([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, query, coords]);

  useEffect(() => {
    load();
  }, [load]);

  const renderRoom = ({ item }: { item: Property }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() => navigation.navigate('room-details', { propertyId: item._id })}
    >
      <View style={styles.imageContainer}>
        {item.images?.[0]?.secure_url ? (
          <Image source={{ uri: item.images[0].secure_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, { backgroundColor: '#eee' }]} />
        )}
        <TouchableOpacity style={styles.heartIcon}>
          <Heart color="#6B7280" size={wp('5%')} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.roomName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.locRow}>
          <MapPin size={11} color="#6B7280" />
          <Text style={styles.location} numberOfLines={1}>
            {' '}{item.area}, {item.city}
          </Text>
        </View>
        <Text style={styles.newPrice}>
          Rs. {item.pricePerMonth?.toLocaleString()}
          <Text style={styles.priceUnit}> /mo</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Slider />

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={18} color="#777" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search properties..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={load}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowFilters(true)}
        >
          <SlidersHorizontal size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.title}>
          {filters.radiusKm ? `Within ${filters.radiusKm} km` : 'Latest Properties'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={properties}
          renderItem={renderRoom}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
            />
          }
          ListEmptyComponent={() => (
            <Text style={{ textAlign: 'center', color: '#777', marginTop: 40 }}>
              No properties found.
            </Text>
          )}
        />
      )}

      {/* ─── Filter Modal ──────────────────────────────────── */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={22} color="#000" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Radius from your location</Text>
            <View style={styles.chipRow}>
              {RADIUS_OPTIONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, filters.radiusKm === r && styles.chipActive]}
                  onPress={() =>
                    setFilters((f) => ({ ...f, radiusKm: f.radiusKm === r ? undefined : r }))
                  }
                >
                  <Text style={[styles.chipText, filters.radiusKm === r && styles.chipTextActive]}>
                    {r} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Price (PKR)</Text>
            <View style={{ flexDirection: 'row' }}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 6 }]}
                placeholder="Min"
                keyboardType="numeric"
                value={filters.minPrice?.toString() || ''}
                onChangeText={(t) =>
                  setFilters((f) => ({ ...f, minPrice: t ? Number(t) : undefined }))
                }
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Max"
                keyboardType="numeric"
                value={filters.maxPrice?.toString() || ''}
                onChangeText={(t) =>
                  setFilters((f) => ({ ...f, maxPrice: t ? Number(t) : undefined }))
                }
              />
            </View>

            <Text style={styles.label}>Room Type</Text>
            <View style={styles.chipRow}>
              {(['Private', 'Shared'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, filters.roomType === t && styles.chipActive]}
                  onPress={() =>
                    setFilters((f) => ({ ...f, roomType: f.roomType === t ? undefined : t }))
                  }
                >
                  <Text style={[styles.chipText, filters.roomType === t && styles.chipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Facilities</Text>
            <View style={styles.chipRow}>
              {FACILITY_OPTIONS.map((f) => {
                const active = filters.facilities?.includes(f);
                return (
                  <TouchableOpacity
                    key={f}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() =>
                      setFilters((cur) => {
                        const list = cur.facilities || [];
                        return {
                          ...cur,
                          facilities: list.includes(f)
                            ? list.filter((x) => x !== f)
                            : [...list, f],
                        };
                      })
                    }
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{f}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', marginTop: 18 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#eee', marginRight: 6 }]}
                onPress={() => { setFilters({}); }}
              >
                <Text style={{ color: '#333', fontWeight: '600' }}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#4F46E5' }]}
                onPress={() => setShowFilters(false)}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('1%'),
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginTop: hp('1.5%') },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5FA', borderRadius: 10, paddingHorizontal: 12,
  },
  searchInput: { flex: 1, paddingVertical: 8, marginLeft: 6 },
  filterBtn: {
    backgroundColor: '#4F46E5', padding: 12, borderRadius: 10, marginLeft: 8,
  },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: hp('2%'), marginBottom: hp('1%'),
  },
  title: { fontSize: wp('4%'), fontWeight: '600', color: '#0F172A' },
  row: { justifyContent: 'space-between', marginBottom: hp('1%') },
  card: {
    backgroundColor: '#fff', width: wp('44.8%'),
    borderRadius: wp('3%'), borderWidth: 0.5, borderColor: 'lightgrey',
  },
  imageContainer: { position: 'relative' },
  image: {
    width: '100%', height: hp('14%'),
    borderTopLeftRadius: wp('3%'), borderTopRightRadius: wp('3%'),
  },
  heartIcon: {
    position: 'absolute', top: hp('1%'), right: wp('2%'),
    backgroundColor: '#fff', padding: wp('1.5%'), borderRadius: wp('5%'),
  },
  cardContent: { padding: wp('3%') },
  roomName: { fontSize: wp('3.8%'), fontWeight: '600', color: '#111827' },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  location: { color: '#6B7280', fontSize: wp('3.2%') },
  newPrice: { fontSize: wp('4%'), fontWeight: '700', color: '#4F46E5', marginTop: 6 },
  priceUnit: { fontSize: wp('3%'), color: '#666', fontWeight: '400' },
  // modal
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 20,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', marginTop: 12, marginBottom: 6, color: '#333' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, borderColor: '#ccc', marginRight: 6, marginBottom: 6,
  },
  chipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  chipText: { color: '#333', fontSize: 12 },
  chipTextActive: { color: '#fff' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 9, backgroundColor: '#fafafa', marginTop: 4,
  },
  modalBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
  },
});

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  X,
  Heart,
  Building2,
  Home,
  BedDouble,
  Users,
  Sparkles,
} from 'lucide-react-native';
import {
  fetchProperties,
  Property,
  PropertyQuery,
} from '../../utils/api/propertyApi';
import { resolveImageUrl, formatPrice } from '../../utils/helpers';
import { useAuthStore } from '../../store/useAuthStore';
import { useFavoriteStore } from '../../store/useFavoriteStore';
import { useActivityStore, ViewedEntry } from '../../store/useActivityStore';

const PRIMARY = '#0B5FFF';
const NAVY = '#061A4D';
const BG = '#F6F8FC';

const PROPERTY_TYPES = [
  { key: '', label: 'All', icon: Building2 },
  { key: 'Apartment', label: 'Apartment', icon: Building2 },
  { key: 'House', label: 'House', icon: Home },
  { key: 'Room', label: 'Room', icon: BedDouble },
  { key: 'Shared', label: 'Shared', icon: Users },
];

const CITIES = [
  '',
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Multan',
  'Faisalabad',
  'Peshawar',
];

function scoreProperty(property: Property, views: ViewedEntry[]): number {
  if (!views.length) return 0;
  let score = 0;
  const cityMap: Record<string, number> = {};
  const areaMap: Record<string, number> = {};
  const typeMap: Record<string, number> = {};
  const prices: number[] = [];
  const facilSet = new Set<string>();

  for (const v of views) {
    if (v.city) cityMap[v.city] = (cityMap[v.city] || 0) + 1;
    if (v.area) areaMap[v.area] = (areaMap[v.area] || 0) + 1;
    if (v.propertyType) typeMap[v.propertyType] = (typeMap[v.propertyType] || 0) + 1;
    if (v.price > 0) prices.push(v.price);
    for (const f of v.facilities) facilSet.add(f);
  }

  const topCity = Object.entries(cityMap).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topType = Object.entries(typeMap).sort((a, b) => b[1] - a[1])[0]?.[0];
  const avgPrice = prices.length ? prices.reduce((s, n) => s + n, 0) / prices.length : 0;

  if (topCity && property.city === topCity) score += 30;
  if (property.area && areaMap[property.area]) score += 20;
  if (topType && property.propertyType === topType) score += 20;
  if (avgPrice > 0 && property.price) {
    const pct = Math.abs(property.price - avgPrice) / avgPrice;
    score += pct < 0.2 ? 20 : pct < 0.5 ? 10 : 0;
  }
  const overlap = (property.facilities || []).filter(f => facilSet.has(f)).length;
  score += Math.min(overlap * 5, 15);
  return score;
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore(s => s.user);
  const recentViews = useActivityStore(s => s.recentViews);

  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [pendingCity, setPendingCity] = useState('');
  const [pendingMin, setPendingMin] = useState('');
  const [pendingMax, setPendingMax] = useState('');

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recommendations = useMemo(() => {
    if (!recentViews.length || !properties.length) return [];
    return properties
      .map(p => ({ p, score: scoreProperty(p, recentViews) }))
      .filter(({ score }) => score >= 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ p }) => p);
  }, [properties, recentViews]);

  const load = useCallback(
    async (overrideQuery?: Partial<PropertyQuery>) => {
      try {
        setError('');
        const params: PropertyQuery = {
          limit: 20,
          ...(query && { q: query }),
          ...(selectedType && { propertyType: selectedType }),
          ...(selectedCity && { city: selectedCity }),
          ...(minPrice && { minPrice: Number(minPrice) }),
          ...(maxPrice && { maxPrice: Number(maxPrice) }),
          ...overrideQuery,
        };
        const res = await fetchProperties(params);
        setProperties(res || []);
      } catch (e: any) {
        setError('Failed to load properties. Pull to refresh.');
        setProperties([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [query, selectedType, selectedCity, minPrice, maxPrice],
  );

  useEffect(() => {
    setLoading(true);
    load();
  }, [selectedType, selectedCity]);

  // Debounce search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(), 500);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [query]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const applyFilters = () => {
    setSelectedCity(pendingCity);
    setMinPrice(pendingMin);
    setMaxPrice(pendingMax);
    setShowFilters(false);
    setLoading(true);
    // load will fire via useEffect when selectedCity changes
  };

  const resetFilters = () => {
    setPendingCity('');
    setPendingMin('');
    setPendingMax('');
    setSelectedCity('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedType('');
    setShowFilters(false);
  };

  const activeFilterCount = [
    selectedCity,
    selectedType,
    minPrice,
    maxPrice,
  ].filter(Boolean).length;

  const renderCard = ({ item }: { item: Property }) => (
    <PropertyCard
      property={item}
      onPress={() =>
        navigation.navigate('room-details', { propertyId: item._id })
      }
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, {user?.name?.split(' ')[0] || 'there'} 👋
          </Text>
          <Text style={styles.headerTitle}>Find your perfect stay</Text>
        </View>
      </View>

      {/* Search Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search city, area, type..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.filterBtn,
            activeFilterCount > 0 && styles.filterBtnActive,
          ]}
          onPress={() => {
            setPendingCity(selectedCity);
            setPendingMin(minPrice);
            setPendingMax(maxPrice);
            setShowFilters(true);
          }}
        >
          <SlidersHorizontal size={18} color="#fff" />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Property Type Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipContent}
      >
        {PROPERTY_TYPES.map(({ key, label }) => {
          const active = selectedType === key;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.typeChip, active && styles.typeChipActive]}
              onPress={() => {
                setSelectedType(key);
                setLoading(true);
              }}
            >
              <Text
                style={[
                  styles.typeChipText,
                  active && styles.typeChipTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <Sparkles size={wp('4%')} color={PRIMARY} />
            <Text style={styles.aiTitle}>AI Picks for You</Text>
          </View>
          <FlatList
            data={recommendations}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => `rec-${item._id}`}
            contentContainerStyle={styles.aiList}
            renderItem={({ item }) => (
              <RecommendCard
                property={item}
                onPress={() =>
                  navigation.navigate('room-details', { propertyId: item._id })
                }
              />
            )}
          />
        </View>
      )}

      {/* Section Header */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>
          {selectedType
            ? `${selectedType}s`
            : selectedCity
            ? `In ${selectedCity}`
            : 'Latest Properties'}
        </Text>
        {!loading && (
          <Text style={styles.sectionCount}>{properties.length} found</Text>
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Finding properties...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setLoading(true);
              load();
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : properties.length === 0 ? (
        <View style={styles.center}>
          <Building2 size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No properties found</Text>
          <Text style={styles.emptyText}>
            Try adjusting your search or filters
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={resetFilters}>
            <Text style={styles.retryText}>Clear filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={properties}
          renderItem={renderCard}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PRIMARY]}
            />
          }
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>City</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: hp('1%') }}
            >
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CITIES.map(c => (
                  <TouchableOpacity
                    key={c || 'all'}
                    style={[
                      styles.chip,
                      pendingCity === c && styles.chipActive,
                    ]}
                    onPress={() => setPendingCity(c)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        pendingCity === c && styles.chipTextActive,
                      ]}
                    >
                      {c || 'All cities'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.filterLabel}>Price range (PKR / month)</Text>
            <View style={styles.priceRow}>
              <TextInput
                style={[styles.priceInput, { marginRight: 8 }]}
                placeholder="Min (e.g. 10000)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={pendingMin}
                onChangeText={setPendingMin}
              />
              <TextInput
                style={styles.priceInput}
                placeholder="Max (e.g. 80000)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={pendingMax}
                onChangeText={setPendingMax}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                <Text style={styles.resetText}>Reset all</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
                <Text style={styles.applyText}>Apply filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Property Card Component ──────────────────────────────────────────────────
// function PropertyCard({
//   property,
//   onPress,
// }: {
//   property: Property;
//   onPress: () => void;
// }) {
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const imageUrl = resolveImageUrl(property.images);
//   const toggleFavorite = useFavoriteStore(state => state.toggleFavorite);
//   const isFavorite = useFavoriteStore(state => state.isFavorite);
//   const isFav = isFavorite(property._id);

//   const onPressIn = () =>
//     Animated.spring(scaleAnim, {
//       toValue: 0.97,
//       useNativeDriver: true,
//       friction: 8,
//     }).start();
//   const onPressOut = () =>
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       useNativeDriver: true,
//       friction: 8,
//     }).start();

//   return (
//     <TouchableOpacity
//       activeOpacity={1}
//       onPress={onPress}
//       onPressIn={onPressIn}
//       onPressOut={onPressOut}
//     >
//       <Animated.View
//         style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
//       >
//         {/* Image */}
//         <View style={styles.cardImageBox}>
//           {imageUrl ? (
//             <Image source={{ uri: imageUrl }} style={styles.cardImage} />
//           ) : (
//             <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
//               <Building2 size={28} color="#D1D5DB" />
//             </View>
//           )}
//           {/* Badge */}
//           <View style={styles.typeBadge}>
//             <Text style={styles.typeBadgeText}>{property.propertyType}</Text>
//           </View>
//           {/* Heart */}
//           <TouchableOpacity
//             style={styles.heartBtn}
//             onPress={() => toggleFavorite(property)}
//             activeOpacity={0.8}
//           >
//             <Heart
//               size={15}
//               color={isFav ? '#EF4444' : '#6B7280'}
//               fill={isFav ? '#EF4444' : 'transparent'}
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Info */}
//         <View style={styles.cardBody}>
//           <Text style={styles.cardTitle} numberOfLines={1}>
//             {property.title}
//           </Text>
//           <View style={styles.locRow}>
//             <MapPin size={10} color="#9CA3AF" />
//             <Text style={styles.locText} numberOfLines={1}>
//               {' '}
//               {property.area ? `${property.area}, ` : ''}
//               {property.city}
//             </Text>
//           </View>
//           <Text style={styles.cardPrice}>
//             {formatPrice(property.price)}
//             <Text style={styles.pricePer}>/mo</Text>
//           </Text>
//         </View>
//       </Animated.View>
//     </TouchableOpacity>
//   );
// }
function PropertyCard({
  property,
  onPress,
}: {
  property: Property;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const imageUrl = resolveImageUrl(property.images);

  const favorites = useFavoriteStore(state => state.favorites);
  const toggleFavorite = useFavoriteStore(state => state.toggleFavorite);
  const isFav = favorites.some(item => item._id === property._id);

  const onPressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
    }).start();

  const onPressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View
        style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.cardImageBox}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
              <Building2 size={28} color="#D1D5DB" />
            </View>
          )}

          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {property.propertyType || 'Property'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => toggleFavorite(property)}
            activeOpacity={0.8}
          >
            <Heart
              size={15}
              color={isFav ? '#0b14bf' : '#6B7280'}
              fill={isFav ? '#0b14bf' : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {property.title}
          </Text>

          <View style={styles.locRow}>
            <MapPin size={10} color="#9CA3AF" />
            <Text style={styles.locText} numberOfLines={1}>
              {' '}
              {property.area ? `${property.area}, ` : ''}
              {property.city}
            </Text>
          </View>

          <Text style={styles.cardPrice}>
            {formatPrice(property.price)}
            <Text style={styles.pricePer}>/mo</Text>
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

function RecommendCard({
  property,
  onPress,
}: {
  property: Property;
  onPress: () => void;
}) {
  const imageUrl = resolveImageUrl(property.images);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View style={styles.recCard}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.recImage} />
        ) : (
          <View style={[styles.recImage, styles.cardImagePlaceholder]}>
            <Building2 size={20} color="#D1D5DB" />
          </View>
        )}
        <View style={styles.recAiBadge}>
          <Sparkles size={9} color="#fff" />
          <Text style={styles.recAiBadgeText}>AI Pick</Text>
        </View>
        <View style={styles.recBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {property.title}
          </Text>
          <View style={styles.locRow}>
            <MapPin size={9} color="#9CA3AF" />
            <Text style={styles.locText} numberOfLines={1}>
              {' '}
              {property.area ? `${property.area}, ` : ''}
              {property.city}
            </Text>
          </View>
          <Text style={styles.cardPrice}>
            {formatPrice(property.price)}
            <Text style={styles.pricePer}>/mo</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    paddingHorizontal: wp('4.5%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('1%'),
    backgroundColor: '#fff',
  },
  greeting: { fontSize: wp('3.5%'), color: '#6B7280' },
  headerTitle: {
    fontSize: wp('5.5%'),
    fontWeight: '800',
    color: NAVY,
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.2%'),
    backgroundColor: '#fff',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG,
    borderRadius: 12,
    paddingHorizontal: wp('3.5%'),
    height: hp('5.5%'),
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: wp('3.8%'),
    color: '#111827',
  },
  filterBtn: {
    backgroundColor: PRIMARY,
    width: hp('5.5%'),
    height: hp('5.5%'),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: { backgroundColor: '#0A4BD9' },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  chipScroll: { backgroundColor: '#fff', maxHeight: hp('6%') },
  chipContent: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('0.8%'),
    gap: 8,
    alignItems: 'center',
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  typeChipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  typeChipText: { fontSize: wp('3.2%'), color: '#6B7280', fontWeight: '600' },
  typeChipTextActive: { color: '#fff' },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('4.5%'),
    paddingTop: hp('1.5%'),
    paddingBottom: hp('0.8%'),
  },
  sectionTitle: { fontSize: wp('4.2%'), fontWeight: '700', color: NAVY },
  sectionCount: { fontSize: wp('3.2%'), color: '#9CA3AF' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: { color: '#9CA3AF', marginTop: 12, fontSize: wp('3.5%') },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: wp('3.5%'),
  },
  emptyTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: NAVY,
    marginTop: 12,
  },
  emptyText: { color: '#9CA3AF', marginTop: 4, fontSize: wp('3.5%') },
  retryBtn: {
    marginTop: 16,
    backgroundColor: PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  listContent: {
    paddingHorizontal: wp('3%'),
    paddingTop: hp('0.5%'),
    paddingBottom: hp('12%'),
  },
  row: { justifyContent: 'space-between', marginBottom: hp('1.5%') },

  // Card
  card: {
    width: wp('44.5%'),
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImageBox: { position: 'relative' },
  cardImage: { width: '100%', height: hp('15%') },
  cardImagePlaceholder: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(11,95,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: { color: '#fff', fontSize: wp('2.6%'), fontWeight: '700' },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
  },
  cardBody: { padding: wp('2.5%') },
  cardTitle: {
    fontSize: wp('3.6%'),
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  locRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  locText: { fontSize: wp('3%'), color: '#9CA3AF', flex: 1 },
  cardPrice: {
    fontSize: wp('4%'),
    fontWeight: '800',
    color: PRIMARY,
  },
  pricePer: { fontSize: wp('2.8%'), color: '#9CA3AF', fontWeight: '400' },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: hp('5%'),
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: wp('4.5%'), fontWeight: '800', color: NAVY },
  filterLabel: {
    fontSize: wp('3.5%'),
    fontWeight: '700',
    color: '#374151',
    marginBottom: hp('1%'),
    marginTop: hp('1.5%'),
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  chipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  chipText: { fontSize: wp('3.2%'), color: '#374151', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  priceRow: { flexDirection: 'row' },
  priceInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    fontSize: wp('3.5%'),
    color: '#111827',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: hp('3%'),
  },
  resetBtn: {
    flex: 1,
    height: hp('6%'),
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: { color: '#374151', fontWeight: '700' },
  applyBtn: {
    flex: 2,
    height: hp('6%'),
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: { color: '#fff', fontWeight: '700' },

  // AI Recommendations
  aiSection: {
    backgroundColor: '#fff',
    paddingTop: hp('1.5%'),
    paddingBottom: hp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4.5%'),
    gap: 6,
    marginBottom: hp('1%'),
  },
  aiTitle: { fontSize: wp('4%'), fontWeight: '700', color: NAVY },
  aiList: { paddingHorizontal: wp('4%'), gap: 10 },

  // Recommend Card
  recCard: {
    width: wp('38%'),
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  recImage: { width: '100%', height: hp('12%') },
  recAiBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  recAiBadgeText: { color: '#fff', fontSize: wp('2.4%'), fontWeight: '700' },
  recBody: { padding: wp('2%') },
});

import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Dimensions,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  ArrowLeft,
  MapPin,
  MessageCircle,
  CalendarCheck,
  Share2,
  Wifi,
  Zap,
  Car,
  UtensilsCrossed,
  Wind,
  ShieldCheck,
  Sofa,
  WashingMachine,
  Trees,
} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import MapPicker from '../../../components/MapPicker';
import {
  fetchPropertyById,
  incrementPropertyView,
  Property,
} from '../../../utils/api/propertyApi';
import {
  formatPrice,
  parseCoordinates,
  propertyTypeLabel,
  resolveAllImages,
} from '../../../utils/helpers';
import { useActivityStore } from '../../../store/useActivityStore';

const PRIMARY = '#0B5FFF';
const NAVY = '#061A4D';
const {width: SCREEN_W} = Dimensions.get('window');

const FACILITY_ICON_MAP: Record<string, any> = {
  WiFi: Wifi,
  AC: Wind,
  Parking: Car,
  Kitchen: UtensilsCrossed,
  Laundry: WashingMachine,
  Security: ShieldCheck,
  Furnished: Sofa,
  'Electricity Backup': Zap,
  Balcony: Trees,
};

export default function RoomDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const propertyId: string | undefined = route.params?.propertyId;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);

  const recordView = useActivityStore(s => s.recordView);

  const load = useCallback(async () => {
    if (!propertyId) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchPropertyById(propertyId);
      setProperty(data);
      recordView(data);
      // Fire-and-forget view increment
      incrementPropertyView(propertyId).catch(() => {});
    } catch {
      setProperty(null);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Loading property...</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorTitle}>Property not found</Text>
        <TouchableOpacity
          style={styles.goBackBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = resolveAllImages(property.images);
  const coords = parseCoordinates(property);

  return (
    <View style={styles.container}>
      {/* Image Gallery */}
      <View style={styles.gallery}>
        <FlatList
          data={images.length > 0 ? images : [null]}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          onMomentumScrollEnd={e => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
            setImageIndex(idx);
          }}
          renderItem={({item}) =>
            item ? (
              <Image source={{uri: item}} style={styles.galleryImage} />
            ) : (
              <View style={[styles.galleryImage, styles.imagePlaceholder]} />
            )
          }
        />

        {/* Top overlay */}
        <View style={styles.galleryOverlay}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Share2 size={20} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Image dots */}
        {images.length > 1 && (
          <View style={styles.imageDots}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === imageIndex && styles.dotActive]}
              />
            ))}
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Title & Price */}
        <View style={styles.titleRow}>
          <View style={{flex: 1}}>
            <Text style={styles.propertyTitle}>{property.title}</Text>
            <View style={styles.locRow}>
              <MapPin size={13} color="#9CA3AF" />
              <Text style={styles.locText}>
                {property.area ? `${property.area}, ` : ''}
                {property.city}
              </Text>
            </View>
          </View>
          <View style={styles.priceBadge}>
            <Text style={styles.priceValue}>{formatPrice(property.price)}</Text>
            <Text style={styles.perMonth}>/month</Text>
          </View>
        </View>

        {/* Type badges */}
        <View style={styles.badgeRow}>
          <Badge label={propertyTypeLabel(property.propertyType)} color={PRIMARY} />
          <Badge label={property.genderType || 'Any'} color="#8B5CF6" />
          {property.isAvailable !== false && (
            <Badge label="Available" color="#10B981" />
          )}
        </View>

        {/* Details Grid */}
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailGrid}>
          <DetailCell label="Total Rooms" value={String(property.totalRooms || 1)} />
          <DetailCell
            label="Available"
            value={`${property.availableRooms ?? 0} rooms`}
          />
          <DetailCell label="Gender" value={property.genderType || 'Any'} />
          <DetailCell label="Status" value={property.status || 'APPROVED'} />
        </View>

        {/* Description */}
        {property.description ? (
          <>
            <Text style={styles.sectionTitle}>About this property</Text>
            <Text style={styles.desc}>{property.description}</Text>
          </>
        ) : null}

        {/* Facilities */}
        {property.facilities?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Facilities</Text>
            <View style={styles.facilitiesGrid}>
              {property.facilities.map(f => {
                const Icon = FACILITY_ICON_MAP[f];
                return (
                  <View key={f} style={styles.facilityItem}>
                    <View style={styles.facilityIconBox}>
                      {Icon ? (
                        <Icon size={18} color={PRIMARY} />
                      ) : (
                        <Text style={styles.facilityEmoji}>•</Text>
                      )}
                    </View>
                    <Text style={styles.facilityText}>{f}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Location / Map */}
        {coords ? (
          <>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.addressText}>
              <MapPin size={12} color="#9CA3AF" /> {property.address}
            </Text>
            <MapPicker
              initialLatitude={coords.lat}
              initialLongitude={coords.lng}
              onLocationSelected={() => {}}
              readonly
              height={200}
            />
          </>
        ) : property.address ? (
          <>
            <Text style={styles.sectionTitle}>Address</Text>
            <Text style={styles.addressText}>{property.address}</Text>
          </>
        ) : null}

        {/* Owner info */}
        {property.owner?.name && (
          <>
            <Text style={styles.sectionTitle}>Listed by</Text>
            <View style={styles.ownerCard}>
              <View style={styles.ownerAvatar}>
                <Text style={styles.ownerInitial}>
                  {property.owner.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.ownerName}>{property.owner.name}</Text>
                {property.owner.email && (
                  <Text style={styles.ownerEmail}>{property.owner.email}</Text>
                )}
              </View>
            </View>
          </>
        )}

        <View style={{height: hp('12%')}} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() =>
            navigation.navigate('chat-details', {
              peerId: property.owner?._id || 'owner',
              peerName: property.owner?.name || 'Owner',
              propertyId: property._id,
            })
          }>
          <MessageCircle size={18} color={PRIMARY} />
          <Text style={styles.chatBtnText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('booking', {property})}>
          <CalendarCheck size={18} color="#fff" />
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const Badge = ({label, color}: {label: string; color: string}) => (
  <View style={[styles.badge, {backgroundColor: color + '15', borderColor: color + '40'}]}>
    <Text style={[styles.badgeText, {color}]}>{label}</Text>
  </View>
);

const DetailCell = ({label, value}: {label: string; value: string}) => (
  <View style={styles.detailCell}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  center: {justifyContent: 'center', alignItems: 'center'},
  loadingText: {color: '#9CA3AF', marginTop: 12},
  errorTitle: {fontSize: 16, fontWeight: '700', color: NAVY},
  goBackBtn: {
    marginTop: 12,
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  goBackText: {color: '#fff', fontWeight: '700'},

  // Gallery
  gallery: {height: hp('35%'), position: 'relative'},
  galleryImage: {width: SCREEN_W, height: hp('35%')},
  imagePlaceholder: {backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center'},
  galleryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('5.5%'),
  },
  iconBtn: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageDots: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  dot: {width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)'},
  dotActive: {backgroundColor: '#fff', width: 18},

  // Content
  scrollContent: {paddingHorizontal: wp('4.5%'), paddingTop: hp('2%')},
  titleRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 10},
  propertyTitle: {
    fontSize: wp('5%'),
    fontWeight: '800',
    color: NAVY,
    lineHeight: wp('6.5%'),
  },
  locRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
  locText: {fontSize: wp('3.3%'), color: '#9CA3AF', marginLeft: 3},
  priceBadge: {
    backgroundColor: PRIMARY + '10',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'flex-end',
  },
  priceValue: {fontSize: wp('3.8%'), fontWeight: '800', color: PRIMARY},
  perMonth: {fontSize: wp('2.8%'), color: '#9CA3AF'},

  // Badges
  badgeRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12},
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {fontSize: wp('3%'), fontWeight: '700'},

  // Section
  sectionTitle: {
    fontSize: wp('4.2%'),
    fontWeight: '800',
    color: NAVY,
    marginTop: hp('2.5%'),
    marginBottom: hp('1%'),
  },

  // Detail grid
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailCell: {
    flex: 1,
    minWidth: wp('38%'),
    backgroundColor: '#F6F8FC',
    borderRadius: 10,
    padding: 12,
  },
  detailLabel: {fontSize: wp('3%'), color: '#9CA3AF', fontWeight: '600'},
  detailValue: {fontSize: wp('3.8%'), fontWeight: '800', color: NAVY, marginTop: 4},

  // Description
  desc: {
    fontSize: wp('3.8%'),
    color: '#4B5563',
    lineHeight: wp('5.8%'),
  },

  // Facilities
  facilitiesGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F8FC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  facilityIconBox: {width: 24, alignItems: 'center'},
  facilityEmoji: {fontSize: 16},
  facilityText: {fontSize: wp('3.2%'), color: '#374151', fontWeight: '600'},

  // Location
  addressText: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
    marginBottom: 10,
    lineHeight: 20,
  },

  // Owner
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F6F8FC',
    borderRadius: 12,
    padding: 14,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInitial: {color: '#fff', fontWeight: '800', fontSize: 18},
  ownerName: {fontWeight: '700', color: NAVY, fontSize: wp('3.8%')},
  ownerEmail: {color: '#9CA3AF', fontSize: wp('3.2%'), marginTop: 2},

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: wp('4%'),
    paddingBottom: hp('3%'),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: PRIMARY,
    borderRadius: 12,
    height: hp('6.5%'),
    gap: 8,
  },
  chatBtnText: {color: PRIMARY, fontWeight: '700', fontSize: wp('4%')},
  bookBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 12,
    height: hp('6.5%'),
    gap: 8,
    shadowColor: PRIMARY,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookBtnText: {color: '#fff', fontWeight: '700', fontSize: wp('4%')},
});

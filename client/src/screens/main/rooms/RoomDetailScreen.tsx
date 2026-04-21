import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { ArrowLeft, MapPin, MessageCircle, CalendarCheck, Share2 } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapPicker from '../../../components/MapPicker';
import { fetchPropertyById, Property } from '../../../utils/api/propertyApi';

export default function RoomDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const propertyId: string | undefined = route.params?.propertyId;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertyId) {
      setLoading(false);
      return;
    }
    fetchPropertyById(propertyId)
      .then(setProperty)
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [propertyId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Property not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
          <Text style={{ color: '#4F46E5' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const lat = property.location?.coordinates?.[1];
  const lng = property.location?.coordinates?.[0];
  const cover = property.images?.[0]?.secure_url;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={wp('6%')} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Property Details</Text>
        <TouchableOpacity>
          <Share2 size={wp('5.2%')} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {cover ? (
          <Image source={{ uri: cover }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, { backgroundColor: '#eee' }]} />
        )}

        <View style={{ padding: 16 }}>
          <Text style={styles.name}>{property.name}</Text>
          <View style={styles.locRow}>
            <MapPin size={14} color="#666" />
            <Text style={styles.location}>
              {property.area}, {property.city}
            </Text>
          </View>

          <Text style={styles.price}>
            Rs. {property.pricePerMonth.toLocaleString()}
            <Text style={styles.priceUnit}> / month</Text>
          </Text>

          <Text style={styles.section}>About this property</Text>
          <Text style={styles.desc}>{property.description}</Text>

          <Text style={styles.section}>Details</Text>
          <View style={styles.metaRow}>
            <Meta label="Room Type" value={property.roomType} />
            <Meta label="Gender" value={property.genderType} />
            <Meta label="Available" value={`${property.availableRooms}/${property.totalRooms}`} />
          </View>

          {property.facilities?.length > 0 && (
            <>
              <Text style={styles.section}>Facilities</Text>
              <View style={styles.chipRow}>
                {property.facilities.map((f) => (
                  <View key={f} style={styles.chip}>
                    <Text style={styles.chipText}>{f}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {lat && lng && (
            <>
              <Text style={styles.section}>Location</Text>
              <MapPicker
                initialLatitude={lat}
                initialLongitude={lng}
                onLocationSelected={() => {}}
                readonly
                height={200}
              />
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, styles.chatBtn]}
          onPress={() =>
            navigation.navigate('chat-details', {
              peerId: property.owner?._id,
              peerName: property.owner?.name || 'Owner',
              propertyId: property._id,
            })
          }
        >
          <MessageCircle size={18} color="#4F46E5" />
          <Text style={[styles.btnText, { color: '#4F46E5' }]}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.bookBtn]}
          onPress={() => navigation.navigate('booking', { property })}
        >
          <CalendarCheck size={18} color="#fff" />
          <Text style={[styles.btnText, { color: '#fff' }]}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const Meta = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.metaCell}>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={styles.metaValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', paddingTop: hp('5%') },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('1.2%'),
    paddingTop: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: wp('4.2%'), fontWeight: '600', color: '#000' },
  cover: { width: '100%', height: hp('30%') },
  name: { fontSize: 20, fontWeight: '700' },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  location: { color: '#666', marginLeft: 4 },
  price: { fontSize: 22, fontWeight: '700', color: '#4F46E5', marginTop: 12 },
  priceUnit: { fontSize: 13, color: '#666', fontWeight: '400' },
  section: { fontSize: 15, fontWeight: '700', marginTop: 18, marginBottom: 8 },
  desc: { color: '#444', lineHeight: 20 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaCell: {
    flex: 1, backgroundColor: '#F5F5FA', padding: 10, marginRight: 6, borderRadius: 8,
  },
  metaLabel: { fontSize: 11, color: '#666' },
  metaValue: { fontSize: 13, fontWeight: '600', color: '#222', marginTop: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    backgroundColor: '#EEF0FF', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 14, marginRight: 6, marginBottom: 6,
  },
  chipText: { fontSize: 12, color: '#4F46E5' },
  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  btn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 10, marginHorizontal: 6,
  },
  chatBtn: { borderWidth: 1, borderColor: '#4F46E5' },
  bookBtn: { backgroundColor: '#4F46E5' },
  btnText: { fontWeight: '700', marginLeft: 6 },
});

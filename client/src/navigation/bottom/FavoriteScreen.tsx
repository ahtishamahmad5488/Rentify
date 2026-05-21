// @ts-nocheck
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { Heart, MapPin, Building2, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useFavoriteStore } from '../../store/useFavoriteStore';
import { formatPrice, resolveImageUrl } from '../../utils/helpers';

export default function FavoriteScreen() {
  const navigation = useNavigation<any>();
  const favorites = useFavoriteStore(state => state.favorites);
  const removeFavorite = useFavoriteStore(state => state.removeFavorite);

  const renderItem = ({ item }: any) => {
    const imageUrl = resolveImageUrl(item.images);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('room-details', {
            propertyId: item._id,
            property: item,
          })
        }
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Building2 size={34} color="#D1D5DB" />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title || 'Untitled Property'}
            </Text>

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeFavorite(item._id)}
            >
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <View style={styles.locationRow}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.location} numberOfLines={1}>
              {item.area ? `${item.area}, ` : ''}
              {item.city || item.address || 'Location not available'}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.price}>
              {formatPrice(item.price)}
              <Text style={styles.priceSub}>/mo</Text>
            </Text>

            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {item.propertyType || 'Property'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.screenTitle}>Favorites</Text>
          <Text style={styles.subtitle}>Your saved properties appear here</Text>
        </View>

        <View style={styles.headerIcon}>
          <Heart size={22} color="#0b14bf" fill="#0b14bf" />
        </View>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item: any) => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          favorites.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Heart size={60} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyText}>
              Tap the heart icon on any property to save it here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FC',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
  },
  screenTitle: {
    fontSize: wp('6.2%'),
    fontWeight: '900',
    color: '#061A4D',
  },
  subtitle: {
    marginTop: hp('0.3%'),
    fontSize: wp('3.4%'),
    color: '#6B7280',
  },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#0b14bf33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingBottom: hp('12%'),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: hp('1.8%'),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
  },
  image: {
    width: '100%',
    height: hp('22%'),
    backgroundColor: '#E5E7EB',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: wp('4%'),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: wp('4.7%'),
    fontWeight: '800',
    color: '#111827',
  },
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp('2%'),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  location: {
    marginLeft: wp('1%'),
    flex: 1,
    fontSize: wp('3.5%'),
    color: '#6B7280',
  },
  bottomRow: {
    marginTop: hp('1.4%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: wp('4.8%'),
    fontWeight: '900',
    color: '#0B5FFF',
  },
  priceSub: {
    fontSize: wp('3.2%'),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  typeBadge: {
    backgroundColor: '#EEF4FF',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.6%'),
    borderRadius: 999,
  },
  typeText: {
    color: '#0B5FFF',
    fontWeight: '800',
    fontSize: wp('3.1%'),
  },
  emptyList: {
    flex: 1,
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('8%'),
  },
  emptyTitle: {
    marginTop: hp('2%'),
    fontSize: wp('5%'),
    fontWeight: '900',
    color: '#111827',
  },
  emptyText: {
    marginTop: hp('1%'),
    color: '#6B7280',
    fontSize: wp('3.6%'),
    textAlign: 'center',
    lineHeight: 21,
  },
});

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
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Heart, Star } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import room1 from '../../assets/images/rooms/1.png';
import room2 from '../../assets/images/rooms/2.png';
import room3 from '../../assets/images/rooms/3.png';
import room4 from '../../assets/images/rooms/4.png';
import room5 from '../../assets/images/rooms/5.png';
import room6 from '../../assets/images/rooms/6.png';

const rooms = [
  {
    id: 1,
    name: 'PG Sharing Room',
    location: 'Bhilai, Durg',
    price: 1600,
    oldPrice: 1800,
    rating: 4.8,
    image: room1,
  },
  {
    id: 2,
    name: 'PG Room',
    location: 'CC Bhilai, Durg',
    price: 2000,
    oldPrice: 2200,
    rating: 4.7,
    image: room2,
  },
  {
    id: 3,
    name: 'Student Room',
    location: 'Bhilai Sec-10, Durg',
    price: 2100,
    oldPrice: 2300,
    rating: 4.8,
    image: room3,
  },
  {
    id: 4,
    name: 'PG Sharing Room',
    location: 'Chowhan Town, Bhilai',
    price: 1600,
    oldPrice: 1800,
    rating: 4.6,
    image: room4,
  },
  {
    id: 5,
    name: 'PG Sharing Room',
    location: 'Green Velly, Bhilai',
    price: 1900,
    oldPrice: 2000,
    rating: 4.6,
    image: room5,
  },
  {
    id: 6,
    name: 'Student Room',
    location: 'Bhilai, Durg',
    price: 1600,
    oldPrice: 1800,
    rating: 4.6,
    image: room6,
  },
];
export default function FavoriteScreen() {
  const navigation = useNavigation();
  const renderRoom = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.8}
      style={styles.card}
      onPress={() => navigation.navigate('room-details')}
    >
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} />
        <TouchableOpacity style={styles.heartIcon}>
          <Heart color="#1C689B" size={wp('5%')} fill={'#1C689B'} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.roomName}>{item.name}</Text>
        <Text style={styles.location}>{item.location}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.newPrice}>₹ {item.price}</Text>
          <Text style={styles.oldPrice}>₹ {item.oldPrice}</Text>
          <View style={styles.ratingContainer}>
            <Star size={wp('3.5%')} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        renderItem={renderRoom}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: wp('3%'),
  },
  row: {
    flexDirection: 'row',
    gap: hp('1%'),
    justifyContent: 'space-between',

    marginTop: hp('1%'),
  },
  card: {
    backgroundColor: '#fff',
    width: wp('46%'),
    borderRadius: wp('3%'),
    borderWidth: 0.5,
    borderColor: 'lightgrey',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: hp('12%'),
    borderTopLeftRadius: wp('3%'),
    borderTopRightRadius: wp('3%'),
  },
  heartIcon: {
    position: 'absolute',
    top: hp('1%'),
    right: wp('2%'),
    backgroundColor: '#fff',
    padding: wp('1.5%'),
    borderRadius: wp('5%'),
  },
  cardContent: {
    padding: wp('3%'),
  },
  roomName: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#111827',
  },
  location: {
    color: '#6B7280',
    fontSize: wp('3.5%'),
    marginTop: hp('0.3%'),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  newPrice: {
    fontSize: wp('4%'),
    fontWeight: '700',
    color: '#111827',
  },
  oldPrice: {
    fontSize: wp('3.5%'),
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: wp('1%'),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  ratingText: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    color: '#111827',
    marginLeft: wp('0.5%'),
  },
});

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import {
  Bell,
  ChevronDown,
  MapPin,
  Menu,
  MessageCircleMore,
} from 'lucide-react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';

export default function CustomHeader({ title }: { title: string }) {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu color="#000" size={wp('6%')} />
        </TouchableOpacity>
        <View style={styles.locationContainer}>
          <View style={styles.location}>
            <MapPin size={hp('2.2%')} color={'#1C689B'} />
            <Text>Nehru Nagar Utai</Text>
          </View>
        </View>
      </View>

      <View style={styles.rightSection}>
        <MessageCircleMore
          onPress={() => navigation.navigate('notication')}
          size={hp('2.5%')}
        />
        <Bell
          onPress={() => navigation.navigate('notication')}
          size={hp('2.5%')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    backgroundColor: '#fff',
    paddingTop: hp('5%'),
    paddingBottom: hp('1.2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hp('1%'),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
  },

  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('5%'),
  },
});

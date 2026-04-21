// @ts-nocheck
import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import notificationNotFound from '../../assets/images/notificationnotfound.png';
export default function NotificationScreen() {
  return (
    <View style={styles.container}>
      <Image source={notificationNotFound} style={styles.image} />
      <Text style={styles.title}>No notification yet</Text>
      <Text style={styles.description}>
        All notification we send will appear here, so you can view them easly
        anytime.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: wp('4%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: wp('60%'),
    height: hp('30%'),
    resizeMode: 'contain',
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: '600',
    color: '#333333',
    marginBottom: hp('0.5%'),
  },
  description: {
    fontSize: wp('3.8%'),
    color: 'gray',
    textAlign: 'center',
    paddingHorizontal: wp('4%'),
    fontWeight: '400',
    lineHeight: hp('2.3%'),
  },
});

// @ts-nocheck
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default function OnboardingSlide({ item }) {
  return (
    <View style={[styles.container]}>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: wp('100%'),
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: wp('80%'),
    height: hp('40%'),
    resizeMode: 'contain',
    marginVertical: hp('2%'),
  },
  title: {
    fontSize: wp('6%'),
    color: '#000',
    textAlign: 'center',
    marginBottom: hp('1%'),
    width: wp('90%'),
    fontWeight: '700',
  },
  description: {
    fontSize: wp('3.7%'),
    color: 'gray',
    textAlign: 'center',
    paddingHorizontal: wp('5%'),
    fontWeight: '400',
    lineHeight: hp('2.8%'),
    width: wp('100%'),
  },
});

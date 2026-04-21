import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import logo from '../../../assets/images/logo.png';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.version}>PG Finder App v1.0.0</Text>
      <Text style={styles.description}>
        PG Finder App is providing you with the best PGs for your needs.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: wp('4%'),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: wp('35%'),
    height: hp('20%'),
    resizeMode: 'contain',
  },
  version: {
    color: '#9B9CA2',
    fontSize: wp('4.5%'),
    marginBottom: hp('0.5%'),
  },
  description: {
    color: 'gray',
    fontSize: wp('4%'),
    textAlign: 'center',
    lineHeight: hp('2.6%'),
  },
});

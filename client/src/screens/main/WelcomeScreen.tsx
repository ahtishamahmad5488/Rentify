// @ts-nocheck
import { Image, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import ButtonComponent from '../../components/ButtonComponent';
import { useNavigation } from '@react-navigation/native';
import welcomeImage from '../../assets/images/locationfind.png';

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.firstSection}>
        <Image source={welcomeImage} style={styles.successImage} />
        <Text style={styles.headerText}>Welcome to PG Finder App!</Text>
        <Text style={styles.subtitleText}>
          Choose your preferred location to find {'\n'} reliable PG
          accommodations
        </Text>
      </View>
      <View style={styles.secondSection}>
        <ButtonComponent
          title="Continue"
          onPress={() => {
            navigation.navigate('drawer-navigation');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp('6%'),
    backgroundColor: 'white',
  },
  firstSection: {
    flex: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondSection: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: hp('8%'),
  },
  successImage: {
    width: wp('65%'),
    height: hp('35%'),
    resizeMode: 'contain',
  },
  headerText: {
    fontSize: wp('6.5%'),
    fontWeight: '500',
    color: '#333333',
    marginBottom: hp('1%'),
  },
  subtitleText: {
    fontSize: wp('3.7%'),
    color: 'gray',
    textAlign: 'center',
    paddingHorizontal: wp('5%'),
    fontWeight: '400',
    lineHeight: hp('2.6%'),
    width: wp('100%'),
  },
});

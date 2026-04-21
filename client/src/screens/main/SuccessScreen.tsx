// @ts-nocheck
import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import ButtonComponent from '../../components/ButtonComponent';
import { useNavigation } from '@react-navigation/native';
import successImage from '../../assets/images/success.png';
export default function SuccessScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.firstSection}>
        <Image source={successImage} style={styles.successImage} />
        <Text style={styles.headerText}>Success!</Text>
        <Text style={styles.subtitleText}>
          You password has been changed. Please {'\n'} log in again with a new
          password.
        </Text>
      </View>
      <View style={styles.secondSection}>
        <ButtonComponent
          title="Continue"
          onPress={() => {
            navigation.navigate('welcome');
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
    paddingBottom: hp('12%'),
  },
  successImage: {
    width: wp('35%'),
    height: hp('17%'),
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
